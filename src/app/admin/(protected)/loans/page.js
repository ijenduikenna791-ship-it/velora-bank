"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDateTime, initials } from "@/lib/utils";
import { WalletIcon, CheckIcon, CloseIcon, CheckCircleIcon, PlusIcon, SettingsIcon } from "@/components/ui/icons";

const FILTERS = ["all", "pending", "active", "rejected", "paid"];
const STATUS_STYLE = {
  active: "bg-success/15 text-success",
  pending: "bg-warn/15 text-warn",
  rejected: "bg-danger/15 text-danger",
  paid: "bg-brand/15 text-brand",
  approved: "bg-success/15 text-success",
};

export default function LoansPage() {
  const supabase = createClient();
  const [loans, setLoans] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  // New-loan modal
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ account_id: "", amount: "", term: 12, purpose: "" });
  const [cbusy, setCbusy] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: lns }, { data: profs }, { data: accts }] = await Promise.all([
      supabase.from("loans").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email"),
      supabase.from("accounts").select("id, user_id, account_number, account_type").eq("is_demo_pool", false),
    ]);
    setLoans(lns || []);
    setProfiles(Object.fromEntries((profs || []).map((p) => [p.id, p])));
    setAccounts(accts || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function flash(m) { setToast(m); setTimeout(() => setToast(""), 2600); }
  const who = (uid) => profiles[uid]?.full_name || profiles[uid]?.email || "Customer";
  const acctLabel = (a) => `${who(a.user_id)} · ${a.account_type} •••• ${String(a.account_number).slice(-4)}`;
  const acctFor = (id) => { const a = accounts.find((x) => x.id === id); return a ? `${a.account_type} •••• ${String(a.account_number).slice(-4)}` : "—"; };

  async function notify(uid, subject, text) {
    const email = profiles[uid]?.email;
    if (!email) return;
    try {
      await fetch("/api/notify-approval", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, subject, text }) });
    } catch {}
  }

  async function review(l, approve) {
    setBusyId(l.id); setError("");
    const { error } = await supabase.rpc("admin_review_loan", { p_id: l.id, p_approve: approve });
    setBusyId(null);
    if (error) return setError(error.message);
    notify(l.user_id, `Loan ${approve ? "approved" : "declined"}`,
      `Your loan of ${formatCurrency(l.amount, l.currency)} has been ${approve ? "approved and disbursed to your account" : "declined"}.`);
    flash(approve ? "Loan approved & disbursed" : "Loan rejected");
    load();
  }

  async function create(e) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!form.account_id) return setError("Choose a customer account");
    if (!amt || amt <= 0) return setError("Enter a valid amount");
    setCbusy(true); setError("");
    const { error } = await supabase.rpc("admin_create_loan", {
      p_account: form.account_id, p_amount: amt, p_term: Number(form.term) || 12, p_purpose: form.purpose || null,
    });
    setCbusy(false);
    if (error) return setError(error.message);
    setCreating(false); setForm({ account_id: "", amount: "", term: 12, purpose: "" });
    flash("Loan created (pending approval)");
    load();
  }

  const counts = useMemo(() => {
    const c = { all: loans.length };
    FILTERS.slice(1).forEach((f) => { c[f] = loans.filter((x) => x.status === f).length; });
    return c;
  }, [loans]);

  const filtered = useMemo(
    () => (filter === "all" ? loans : loans.filter((l) => l.status === filter)),
    [loans, filter]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Loan Applications</h1>
          <p className="text-sm text-muted">Review and disburse customer loans. Approving credits the account.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/loans/settings" className="btn-ghost w-fit text-sm"><SettingsIcon size={15} /> Settings</Link>
          <button onClick={() => { setCreating(true); setError(""); }} className="btn-primary w-fit"><PlusIcon size={16} /> New loan</button>
        </div>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
              filter === f ? "bg-brand text-white shadow-glow" : "border border-line text-muted hover:text-ink"
            }`}
          >
            {f} {counts[f] != null && <span className="opacity-70">· {counts[f]}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-8 text-center text-sm text-muted">Loading loans…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <WalletIcon size={30} className="mx-auto mb-3 text-muted" />
          <div className="text-sm font-medium text-ink">No loans found</div>
          <div className="mt-1 text-xs text-muted">No loans match this filter.</div>
        </div>
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {filtered.map((l) => (
            <div key={l.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-xs font-bold text-white">
                {initials(who(l.user_id))}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink">{who(l.user_id)}</div>
                <div className="truncate text-xs text-muted">
                  {acctFor(l.account_id)} · {l.term_months} mo @ {l.interest_rate}% · {formatDateTime(l.created_at)}
                </div>
              </div>
              <div className="text-right sm:mr-1">
                <div className="text-sm font-semibold text-ink">{formatCurrency(l.amount, l.currency)}</div>
                {l.monthly_payment != null && <div className="text-[11px] text-muted">{formatCurrency(l.monthly_payment, l.currency)}/mo</div>}
              </div>
              {l.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => review(l, true)} disabled={busyId === l.id} className="btn-primary px-3 py-1.5 text-xs"><CheckIcon size={14} /> Approve</button>
                  <button onClick={() => review(l, false)} disabled={busyId === l.id} className="btn-ghost px-3 py-1.5 text-xs"><CloseIcon size={14} /> Reject</button>
                </div>
              ) : (
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[l.status] || "bg-muted/15 text-muted"}`}>{l.status}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New loan modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5" onClick={() => setCreating(false)}>
          <form className="card w-full max-w-md space-y-4 p-6" onClick={(e) => e.stopPropagation()} onSubmit={create}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">New loan</h3>
              <button type="button" onClick={() => setCreating(false)} className="text-muted hover:text-ink"><CloseIcon size={18} /></button>
            </div>
            <div>
              <label className="label">Customer account</label>
              <select value={form.account_id} onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))} className="input">
                <option value="">Select account…</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{acctLabel(a)}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Amount (USD)</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" className="input" />
              </div>
              <div>
                <label className="label">Term (months)</label>
                <select value={form.term} onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))} className="input">
                  {[6, 12, 24, 36, 48].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Purpose (optional)</label>
              <input value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Home improvement" className="input" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setCreating(false)} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={cbusy} className="btn-primary flex-1">{cbusy ? "Creating…" : "Create loan"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
