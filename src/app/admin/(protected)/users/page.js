"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatCurrency, formatDate, initials, maskAccount } from "@/lib/utils";
import { flagUrl, findCountry } from "@/lib/countries";
import { SearchIcon, PlusIcon, CloseIcon, CheckCircleIcon, LockIcon, CheckIcon, UserIcon } from "@/components/ui/icons";

export default function AdminUsersPage() {
  const { t } = useI18n();
  const supabase = createClient();

  const [profiles, setProfiles] = useState([]);
  const [acctsByUser, setAcctsByUser] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);   // profile being viewed
  const [creditFor, setCreditFor] = useState(null); // account row
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: profs }, { data: accts }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, country, phone, address, role, kyc_level, created_at").order("created_at", { ascending: false }),
      supabase.from("accounts").select("id, user_id, account_number, account_type, currency, balance, status").eq("is_demo_pool", false),
    ]);
    const map = {};
    (accts || []).forEach((a) => { (map[a.user_id] = map[a.user_id] || []).push(a); });
    setProfiles(profs || []);
    setAcctsByUser(map);
    setLoading(false);
    // keep open detail fresh
    if (detail) {
      const p = (profs || []).find((x) => x.id === detail.id);
      if (p) setDetail(p);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((r) => r.full_name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q));
  }, [profiles, query]);

  function flash(m) { setToast(m); setTimeout(() => setToast(""), 2400); }
  const totalBalance = (uid) => (acctsByUser[uid] || []).reduce((s, a) => s + Number(a.balance || 0), 0);
  const anyFrozen = (uid) => (acctsByUser[uid] || []).some((a) => a.status === "frozen");

  async function setAccountStatus(acctId, status) {
    setBusy(true); setError("");
    const { error } = await supabase.from("accounts").update({ status }).eq("id", acctId);
    setBusy(false);
    if (error) return setError(error.message);
    flash(status === "frozen" ? "Account frozen" : "Account unfrozen");
    load();
  }

  async function doCredit() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }
    setBusy(true); setError("");
    const { error } = await supabase.rpc("admin_adjust_balance", { p_account: creditFor.id, p_amount: amt, p_note: "Admin credit" });
    setBusy(false);
    if (error) return setError(error.message);
    setCreditFor(null); setAmount("");
    flash("Account credited");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{t("admin.users")}</h1>
          <p className="text-sm text-muted">Manage customers, view details, freeze accounts and credit funds.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("admin.search")} className="input pl-11" />
          </div>
          <Link href="/admin/users/new" className="btn-primary shrink-0">
            <PlusIcon size={16} /> Create user
          </Link>
        </div>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      <div className="card overflow-hidden">
        <div className="hidden grid-cols-12 gap-4 border-b border-line px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted sm:grid">
          <div className="col-span-4">Customer</div>
          <div className="col-span-3">Balance</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Action</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">No users found.</div>
        ) : (
          <div className="divide-y divide-line">
            {filtered.map((r) => {
              const c = findCountry(r.country);
              const frozen = anyFrozen(r.id);
              return (
                <div key={r.id} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-12 sm:items-center sm:gap-4">
                  <div className="col-span-4 flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-xs font-bold text-white">
                      {initials(r.full_name || "U")}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate text-sm font-medium text-ink">
                        {r.full_name}
                        {c && <Image src={flagUrl(c.code)} alt="" width={18} height={13} className="rounded-[2px]" unoptimized />}
                      </div>
                      <div className="truncate text-xs text-muted">{r.email}</div>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm font-semibold text-ink">{formatCurrency(totalBalance(r.id))}</div>
                  <div className="col-span-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${frozen ? "bg-danger/15 text-danger" : "bg-success/15 text-success"}`}>
                      {frozen ? "Frozen" : "Active"}
                    </span>
                  </div>
                  <div className="col-span-3 flex gap-2 sm:justify-end">
                    <Link href={`/admin/users/${r.id}`} className="btn-ghost px-3 py-1.5 text-xs">
                      <UserIcon size={14} /> Profile
                    </Link>
                    <button onClick={() => { setDetail(r); setError(""); }} className="btn-ghost px-3 py-1.5 text-xs">
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5" onClick={() => setDetail(null)}>
          <div className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-sm font-bold text-white">
                  {initials(detail.full_name || "U")}
                </span>
                <div>
                  <div className="text-base font-semibold text-ink">{detail.full_name}</div>
                  <div className="text-xs text-muted">{detail.email}</div>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="text-muted hover:text-ink"><CloseIcon size={18} /></button>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Info label="Total balance" value={formatCurrency(totalBalance(detail.id))} />
              <Info label="Role" value={detail.role} />
              <Info label="Country" value={findCountry(detail.country)?.name || "—"} />
              <Info label="Phone" value={detail.phone || "—"} />
              <Info label="KYC level" value={`Level ${detail.kyc_level ?? 1}`} />
              <Info label="Joined" value={formatDate(detail.created_at)} />
              <div className="col-span-2"><Info label="Address" value={detail.address || "—"} /></div>
            </dl>

            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Accounts</div>
              <div className="space-y-2">
                {(acctsByUser[detail.id] || []).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-ink">{a.account_type} · {maskAccount(a.account_number)}</div>
                      <div className="text-xs text-muted">{formatCurrency(a.balance, a.currency)} ·
                        <span className={a.status === "frozen" ? "text-danger" : "text-success"}> {a.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setCreditFor(a); setAmount(""); setError(""); }} className="btn-soft px-3 py-1.5 text-xs">
                        <PlusIcon size={13} /> Credit
                      </button>
                      {a.status === "frozen" ? (
                        <button onClick={() => setAccountStatus(a.id, "active")} disabled={busy} className="btn-ghost px-3 py-1.5 text-xs">
                          <CheckIcon size={13} /> Unfreeze
                        </button>
                      ) : (
                        <button onClick={() => setAccountStatus(a.id, "frozen")} disabled={busy} className="btn-ghost px-3 py-1.5 text-xs text-danger">
                          <LockIcon size={13} /> Freeze
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit modal */}
      {creditFor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-5" onClick={() => setCreditFor(null)}>
          <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Credit funds</h3>
              <button onClick={() => setCreditFor(null)} className="text-muted hover:text-ink"><CloseIcon size={18} /></button>
            </div>
            <p className="mt-1 text-sm text-muted">{creditFor.account_type} · {maskAccount(creditFor.account_number)}</p>
            <div className="mt-4">
              <label className="label">Amount</label>
              <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="input" autoFocus />
            </div>
            {error && <div className="mt-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}
            <div className="mt-5 flex gap-3">
              <button onClick={() => setCreditFor(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={doCredit} disabled={busy} className="btn-primary flex-1">{busy ? "Crediting…" : "Credit"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium capitalize text-ink">{value}</dd>
    </div>
  );
}
