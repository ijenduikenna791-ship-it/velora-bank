"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { WalletIcon, PlusIcon, CheckCircleIcon, CloseIcon } from "@/components/ui/icons";

const LOAN_DEFAULTS = { enabled: true, interest_rate: 5, max_amount: 50000, terms: [6, 12, 24, 36] };

const STATUS_STYLE = {
  active: "bg-success/15 text-success",
  pending: "bg-warn/15 text-warn",
  rejected: "bg-danger/15 text-danger",
  paid: "bg-brand/15 text-brand",
  approved: "bg-success/15 text-success",
};
const STATUS_LABEL = {
  active: "Active", pending: "Awaiting approval", rejected: "Declined", paid: "Paid off", approved: "Approved",
};

function monthly(amount, rate, term) {
  const a = Number(amount) || 0;
  const r = Number(rate) || 0;
  const t = Math.max(Number(term) || 1, 1);
  return Math.round(((a * (1 + r / 100)) / t) * 100) / 100;
}

export default function LoansPage() {
  const supabase = createClient();
  const [accounts, setAccounts] = useState([]);
  const [loans, setLoans] = useState([]);
  const [cfg, setCfg] = useState(LOAN_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({ account_id: "", amount: "", term: 12, purpose: "" });

  async function load() {
    setLoading(true);
    const [{ data: accts }, { data: lns }, { data: setting }] = await Promise.all([
      supabase.from("accounts").select("id, account_number, account_type, currency, balance").eq("is_demo_pool", false).order("created_at", { ascending: true }),
      supabase.from("loans").select("*").order("created_at", { ascending: false }),
      supabase.from("app_settings").select("value").eq("key", "loans").maybeSingle(),
    ]);
    setAccounts(accts || []);
    setLoans(lns || []);
    setCfg({ ...LOAN_DEFAULTS, ...(setting?.value || {}) });
    setForm((f) => ({ ...f, account_id: accts?.[0]?.id || "", term: (setting?.value?.terms || LOAN_DEFAULTS.terms)[1] || 12 }));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function flash(m) { setToast(m); setTimeout(() => setToast(""), 2800); }

  const terms = cfg.terms?.length ? cfg.terms : LOAN_DEFAULTS.terms;
  const estimate = useMemo(() => monthly(form.amount, cfg.interest_rate, form.term), [form.amount, form.term, cfg.interest_rate]);

  async function apply(e) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!form.account_id) return setError("Choose an account to receive the funds.");
    if (!amt || amt <= 0) return setError("Enter a valid amount.");
    if (cfg.max_amount && amt > Number(cfg.max_amount)) return setError(`The maximum loan amount is ${formatCurrency(cfg.max_amount)}.`);
    setBusy(true); setError("");
    const { error } = await supabase.rpc("request_loan", {
      p_account: form.account_id, p_amount: amt, p_term: Number(form.term) || 12, p_purpose: form.purpose || null,
    });
    setBusy(false);
    if (error) return setError(error.message);
    setApplying(false);
    setForm((f) => ({ ...f, amount: "", purpose: "" }));
    flash("Loan application submitted — awaiting approval.");
    load();
  }

  const acctLabel = (id) => {
    const a = accounts.find((x) => x.id === id);
    return a ? `${a.account_type} · •••• ${String(a.account_number).slice(-4)}` : "—";
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Loans</h1>
          <p className="text-sm text-muted">Apply for a Velora loan. Funds are disbursed after approval.</p>
        </div>
        {cfg.enabled !== false && accounts.length > 0 && (
          <button onClick={() => { setApplying(true); setError(""); }} className="btn-primary w-fit">
            <PlusIcon size={16} /> Apply for a loan
          </button>
        )}
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}

      {/* Rate card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Info label="Interest rate" value={`${cfg.interest_rate}%`} />
        <Info label="Max amount" value={formatCurrency(cfg.max_amount)} />
        <Info label="Terms" value={`${terms.join(", ")} mo`} />
      </div>

      {cfg.enabled === false && (
        <div className="rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          Loans are currently unavailable. Please check back later.
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-sm text-muted">Loading…</div>
      ) : loans.length === 0 ? (
        <div className="card p-10 text-center">
          <WalletIcon size={30} className="mx-auto mb-3 text-muted" />
          <div className="text-sm font-medium text-ink">No loans yet</div>
          <div className="mt-1 text-xs text-muted">Apply for a loan to get started.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((l) => (
            <div key={l.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-bold text-ink">{formatCurrency(l.amount, l.currency)}</div>
                  <div className="text-xs text-muted">{acctLabel(l.account_id)} · applied {formatDateTime(l.created_at)}</div>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[l.status] || "bg-muted/15 text-muted"}`}>
                  {STATUS_LABEL[l.status] || l.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
                <Mini label="Term" value={`${l.term_months} mo`} />
                <Mini label="Rate" value={`${l.interest_rate}%`} />
                <Mini label="Monthly" value={l.monthly_payment != null ? formatCurrency(l.monthly_payment, l.currency) : "—"} />
              </div>
              {l.purpose && <div className="mt-3 text-xs text-muted">Purpose: {l.purpose}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Apply modal */}
      {applying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5" onClick={() => setApplying(false)}>
          <form className="card w-full max-w-md space-y-4 p-6" onClick={(e) => e.stopPropagation()} onSubmit={apply}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Apply for a loan</h3>
              <button type="button" onClick={() => setApplying(false)} className="text-muted hover:text-ink"><CloseIcon size={18} /></button>
            </div>

            <div>
              <label className="label">Disburse to</label>
              <select value={form.account_id} onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))} className="input">
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_type} · •••• {String(a.account_number).slice(-4)}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Amount (USD)</label>
                <input type="number" min="0" step="0.01" max={cfg.max_amount || undefined} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" className="input" autoFocus />
              </div>
              <div>
                <label className="label">Term (months)</label>
                <select value={form.term} onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))} className="input">
                  {terms.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Purpose (optional)</label>
              <input value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Home improvement" className="input" />
            </div>

            <div className="rounded-xl border border-line bg-surface/50 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Estimated monthly payment</span>
                <span className="font-semibold text-ink">{formatCurrency(estimate)}</span>
              </div>
              <div className="mt-1 text-[11px] text-muted">{cfg.interest_rate}% over {form.term} months (demo estimate).</div>
            </div>

            {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setApplying(false)} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? "Submitting…" : "Submit application"}</button>
            </div>
          </form>
        </div>
      )}

      {error && !applying && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 text-lg font-bold text-ink">{value}</div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}
