"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, formatDateTime, initials, maskAccount } from "@/lib/utils";
import { findCountry, flagUrl } from "@/lib/countries";
import {
  ArrowLeftIcon, CheckCircleIcon, PlusIcon, LockIcon, CheckIcon, CloseIcon,
  ShieldIcon, WalletIcon, BankIcon, ArrowUpRightIcon, ArrowDownLeftIcon, UserIcon,
} from "@/components/ui/icons";

const LIMITS = {
  1: { daily: 10000, single: 5000, label: "Basic" },
  2: { daily: 50000, single: 25000, label: "Verified" },
  3: { daily: null, single: null, label: "Premium" },
};

export default function AdminUserProfile() {
  const { id } = useParams();
  const supabase = createClient();

  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const [adjust, setAdjust] = useState(null); // {account, direction}
  const [amount, setAmount] = useState("");
  const [pwFor, setPwFor] = useState(false);
  const [newPw, setNewPw] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: prof }, { data: accts }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase.from("accounts").select("*").eq("user_id", id).eq("is_demo_pool", false).order("created_at", { ascending: true }),
    ]);
    setProfile(prof || null);
    setAccounts(accts || []);
    const ids = (accts || []).map((a) => a.id);
    if (ids.length) {
      const list = ids.join(",");
      const { data: tx } = await supabase
        .from("transactions")
        .select("*")
        .or(`from_account.in.(${list}),to_account.in.(${list})`)
        .order("created_at", { ascending: false })
        .limit(25);
      setTxns(tx || []);
    } else {
      setTxns([]);
    }
    setLoading(false);
  }

  useEffect(() => { if (id) load(); /* eslint-disable-next-line */ }, [id]);

  function flash(m) { setToast(m); setTimeout(() => setToast(""), 2400); }

  const totalBalance = useMemo(() => accounts.reduce((s, a) => s + Number(a.balance || 0), 0), [accounts]);
  const ownIds = useMemo(() => accounts.map((a) => a.id), [accounts]);

  async function setStatus(acctId, status) {
    setBusy(true); setError("");
    const { error } = await supabase.from("accounts").update({ status }).eq("id", acctId);
    setBusy(false);
    if (error) return setError(error.message);
    flash(status === "frozen" ? "Account frozen" : status === "closed" ? "Account closed" : "Account active");
    load();
  }

  async function doAdjust() {
    const raw = parseFloat(amount);
    if (!raw || raw <= 0) return setError("Enter a valid amount");
    const signed = adjust.direction === "debit" ? -raw : raw;
    setBusy(true); setError("");
    const { error } = await supabase.rpc("admin_adjust", {
      p_account: adjust.account.id,
      p_amount: signed,
      p_note: adjust.direction === "debit" ? "Admin debit" : "Admin credit",
    });
    setBusy(false);
    if (error) return setError(error.message);
    setAdjust(null); setAmount("");
    flash(adjust.direction === "debit" ? "Account debited" : "Account credited");
    load();
  }

  async function setKyc(level) {
    setBusy(true); setError("");
    const { error } = await supabase.rpc("admin_set_kyc", { p_user: id, p_level: level });
    setBusy(false);
    if (error) return setError(error.message);
    flash(`KYC set to level ${level}`);
    load();
  }

  async function resetPassword() {
    if (newPw.length < 6) return setError("Password must be at least 6 characters");
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, password: newPw }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not reset password");
      setPwFor(false); setNewPw("");
      flash("Password updated");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="card p-10 text-center text-sm text-muted">Loading profile…</div>;
  if (!profile) return <div className="card p-10 text-center text-sm text-muted">User not found.</div>;

  const country = findCountry(profile.country);
  const kyc = LIMITS[profile.kyc_level || 1] || LIMITS[1];
  const frozen = accounts.some((a) => a.status === "frozen");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-ink">
        <ArrowLeftIcon size={15} /> Back to users
      </Link>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-lg font-bold text-white">
              {initials(profile.full_name || "U")}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-extrabold tracking-tight text-ink">{profile.full_name || "Customer"}</h1>
                {country && <Image src={flagUrl(country.code)} alt="" width={22} height={16} className="h-4 w-6 rounded-[2px] object-cover" unoptimized />}
                {profile.role === "admin" && (
                  <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">Admin</span>
                )}
              </div>
              <div className="text-sm text-muted">{profile.email}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-widest text-muted">Total balance</div>
            <div className="font-display text-2xl font-extrabold text-ink">{formatCurrency(totalBalance)}</div>
            <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${frozen ? "bg-danger/15 text-danger" : "bg-success/15 text-success"}`}>
              {frozen ? "Frozen" : "Active"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Accounts */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
              <BankIcon size={18} className="text-brand" /> Accounts & balances
            </div>
            <div className="space-y-3">
              {accounts.map((a) => {
                const Icon = a.account_type === "Savings" ? WalletIcon : BankIcon;
                const isFrozen = a.status !== "active";
                return (
                  <div key={a.id} className="rounded-xl border border-line p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-ink">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand"><Icon size={16} /></span>
                        {a.account_type} · {maskAccount(a.account_number)}
                        {isFrozen && <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-bold uppercase text-danger">{a.status}</span>}
                      </div>
                      <div className="text-sm font-semibold text-ink">{formatCurrency(a.balance, a.currency)}</div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => { setAdjust({ account: a, direction: "credit" }); setAmount(""); setError(""); }} className="btn-soft px-3 py-1.5 text-xs">
                        <PlusIcon size={13} /> Credit
                      </button>
                      <button onClick={() => { setAdjust({ account: a, direction: "debit" }); setAmount(""); setError(""); }} className="btn-ghost px-3 py-1.5 text-xs">
                        <ArrowUpRightIcon size={13} /> Debit
                      </button>
                      {a.status === "active" ? (
                        <button onClick={() => setStatus(a.id, "frozen")} disabled={busy} className="btn-ghost px-3 py-1.5 text-xs text-danger">
                          <LockIcon size={13} /> Freeze
                        </button>
                      ) : (
                        <button onClick={() => setStatus(a.id, "active")} disabled={busy} className="btn-ghost px-3 py-1.5 text-xs">
                          <CheckIcon size={13} /> Unfreeze
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {accounts.length === 0 && <div className="text-sm text-muted">No accounts.</div>}
            </div>
          </div>

          {/* Activity */}
          <div className="card p-6">
            <div className="mb-4 text-sm font-semibold text-ink">Transaction activity</div>
            {txns.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted">No transactions yet.</div>
            ) : (
              <div className="divide-y divide-line">
                {txns.map((tx) => {
                  const incoming = ownIds.includes(tx.to_account) && !ownIds.includes(tx.from_account);
                  return (
                    <div key={tx.id} className="flex items-center gap-3 py-3">
                      <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${incoming ? "bg-success/10 text-success" : "bg-brand/10 text-brand"}`}>
                        {incoming ? <ArrowDownLeftIcon size={16} /> : <ArrowUpRightIcon size={16} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-ink">{tx.recipient_name || tx.note || (incoming ? "Incoming" : tx.type)}</div>
                        <div className="truncate text-xs text-muted">{tx.type} · {formatDateTime(tx.created_at)}</div>
                      </div>
                      <div className={`text-sm font-semibold tabular-nums ${incoming ? "text-success" : "text-ink"}`}>
                        {incoming ? "+" : "−"}{formatCurrency(tx.amount, tx.currency).replace(/^[-−]/, "")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Account info */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink"><UserIcon size={18} className="text-brand" /> Account information</div>
            <dl className="space-y-3 text-sm">
              <Row label="Email" value={profile.email} />
              <Row label="Phone" value={profile.phone || "—"} />
              <Row label="Country" value={country?.name || "—"} />
              <Row label="Address" value={profile.address || "—"} />
              <Row label="Role" value={profile.role} />
              <Row label="Joined" value={formatDate(profile.created_at)} />
            </dl>
          </div>

          {/* KYC & limits */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink"><CheckCircleIcon size={18} className="text-brand" /> KYC & limits</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Level</span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setKyc(lvl)}
                    disabled={busy}
                    className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${
                      (profile.kyc_level || 1) === lvl ? "bg-brand text-white" : "border border-line text-muted hover:text-ink"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Tier" value={kyc.label} />
              <Row label="Daily limit" value={kyc.daily ? formatCurrency(kyc.daily) : "Unlimited"} />
              <Row label="Per transfer" value={kyc.single ? formatCurrency(kyc.single) : "Unlimited"} />
            </div>
          </div>

          {/* Security */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink"><ShieldIcon size={18} className="text-brand" /> Security</div>
            <p className="text-xs text-muted">Transaction PIN is set and managed by the customer (stored hashed — never visible).</p>
            <button onClick={() => { setPwFor(true); setNewPw(""); setError(""); }} className="btn-ghost mt-4 w-full">
              <LockIcon size={15} /> Reset password
            </button>
          </div>
        </div>
      </div>

      {/* Adjust modal */}
      {adjust && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-5" onClick={() => setAdjust(null)}>
          <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">{adjust.direction === "debit" ? "Debit account" : "Credit account"}</h3>
              <button onClick={() => setAdjust(null)} className="text-muted hover:text-ink"><CloseIcon size={18} /></button>
            </div>
            <p className="mt-1 text-sm text-muted">{adjust.account.account_type} · {maskAccount(adjust.account.account_number)}</p>
            <div className="mt-4">
              <label className="label">Amount</label>
              <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="input" autoFocus />
            </div>
            {error && <div className="mt-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}
            <div className="mt-5 flex gap-3">
              <button onClick={() => setAdjust(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={doAdjust} disabled={busy} className="btn-primary flex-1">
                {busy ? "Working…" : adjust.direction === "debit" ? "Debit" : "Credit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {pwFor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-5" onClick={() => setPwFor(false)}>
          <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Reset password</h3>
              <button onClick={() => setPwFor(false)} className="text-muted hover:text-ink"><CloseIcon size={18} /></button>
            </div>
            <p className="mt-1 text-sm text-muted">Set a new password for {profile.full_name || profile.email}.</p>
            <div className="mt-4">
              <label className="label">New password</label>
              <input type="text" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 6 characters" className="input" autoFocus />
            </div>
            {error && <div className="mt-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}
            <div className="mt-5 flex gap-3">
              <button onClick={() => setPwFor(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={resetPassword} disabled={busy} className="btn-primary flex-1">{busy ? "Saving…" : "Update"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[60%] truncate text-right font-medium capitalize text-ink">{value}</dd>
    </div>
  );
}
