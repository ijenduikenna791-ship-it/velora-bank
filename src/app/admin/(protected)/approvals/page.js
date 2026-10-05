"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDateTime, initials } from "@/lib/utils";
import { BRAND_CHANNEL_ICONS } from "@/components/ui/brand-icons";
import { CardIcon, CheckIcon, CloseIcon, CheckCircleIcon } from "@/components/ui/icons";

export default function AdminApprovalsPage() {
  const supabase = createClient();
  const [cards, setCards] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: crds }, { data: wds }, { data: deps }, { data: profs }, { data: accts }] = await Promise.all([
      supabase.from("cards").select("*").eq("status", "pending").order("created_at", { ascending: true }),
      supabase.from("withdrawals").select("*").eq("status", "pending").order("created_at", { ascending: true }),
      supabase.from("deposits").select("*").eq("status", "pending").order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, full_name, email"),
      supabase.from("accounts").select("id, account_number, account_type"),
    ]);
    setCards(crds || []);
    setWithdrawals(wds || []);
    setDeposits(deps || []);
    setProfiles(Object.fromEntries((profs || []).map((p) => [p.id, p])));
    setAccounts(Object.fromEntries((accts || []).map((a) => [a.id, a])));
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function flash(msg) { setToast(msg); setTimeout(() => setToast(""), 2400); }

  // Best-effort email notification (no-ops if email isn't configured).
  async function notify(uid, subject, text) {
    const email = profiles[uid]?.email;
    if (!email) return;
    try {
      await fetch("/api/notify-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, text }),
      });
    } catch {}
  }

  async function reviewCard(c, approve) {
    setBusyId(c.id); setError("");
    const { error } = await supabase.rpc("admin_review_card", { p_card: c.id, p_approve: approve });
    setBusyId(null);
    if (error) return setError(error.message);
    notify(c.user_id, `Your debit card was ${approve ? "approved" : "declined"}`,
      `Your Velora debit card application has been ${approve ? "approved and is now active" : "declined"}.`);
    flash(approve ? "Card approved" : "Card rejected");
    load();
  }
  async function reviewWithdrawal(w, approve) {
    setBusyId(w.id); setError("");
    const { error } = await supabase.rpc("admin_review_withdrawal", { p_id: w.id, p_approve: approve });
    setBusyId(null);
    if (error) return setError(error.message);
    notify(w.user_id, `Withdrawal ${approve ? "approved" : "declined"}`,
      `Your withdrawal of ${formatCurrency(w.amount, w.currency)} to ${w.destination} has been ${approve ? "approved and paid out" : "declined"}.`);
    flash(approve ? "Withdrawal approved & paid out" : "Withdrawal rejected");
    load();
  }
  async function reviewDeposit(d, approve) {
    setBusyId(d.id); setError("");
    const { error } = await supabase.rpc("admin_review_deposit", { p_id: d.id, p_approve: approve });
    setBusyId(null);
    if (error) return setError(error.message);
    notify(d.user_id, `Deposit ${approve ? "approved" : "declined"}`,
      `Your deposit of ${formatCurrency(d.amount, d.currency)} has been ${approve ? "approved and credited to your account" : "declined"}.`);
    flash(approve ? "Deposit approved & credited" : "Deposit rejected");
    load();
  }

  const who = (uid) => profiles[uid]?.full_name || profiles[uid]?.email || "Customer";
  const acct = (id) => { const a = accounts[id]; return a ? `${a.account_type} · •••• ${String(a.account_number).slice(-4)}` : ""; };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Approvals</h1>
        <p className="text-sm text-muted">Review pending debit-card applications and withdrawal requests.</p>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      {/* Card applications */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <CardIcon size={16} className="text-brand" /> Card applications
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">{cards.length}</span>
        </h3>
        {loading ? (
          <div className="card p-6 text-center text-sm text-muted">Loading…</div>
        ) : cards.length === 0 ? (
          <div className="card p-6 text-center text-sm text-muted">No pending card applications.</div>
        ) : (
          <div className="card divide-y divide-line overflow-hidden">
            {cards.map((c) => (
              <div key={c.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-xs font-bold text-white">
                  {initials(who(c.user_id))}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">{who(c.user_id)}</div>
                  <div className="truncate text-xs text-muted">{c.card_type} card · {acct(c.account_id)} · {formatDateTime(c.created_at)}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => reviewCard(c, true)} disabled={busyId === c.id} className="btn-primary px-3 py-1.5 text-xs">
                    <CheckIcon size={14} /> Approve
                  </button>
                  <button onClick={() => reviewCard(c, false)} disabled={busyId === c.id} className="btn-ghost px-3 py-1.5 text-xs">
                    <CloseIcon size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Withdrawals */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          Withdrawal requests
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">{withdrawals.length}</span>
        </h3>
        {loading ? (
          <div className="card p-6 text-center text-sm text-muted">Loading…</div>
        ) : withdrawals.length === 0 ? (
          <div className="card p-6 text-center text-sm text-muted">No pending withdrawals.</div>
        ) : (
          <div className="card divide-y divide-line overflow-hidden">
            {withdrawals.map((w) => {
              const Brand = BRAND_CHANNEL_ICONS[w.method];
              return (
                <div key={w.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center">
                    {Brand ? <Brand size={32} /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink">
                      {who(w.user_id)} → {w.destination}
                    </div>
                    <div className="truncate text-xs text-muted">{w.method} · {acct(w.account_id)} · {formatDateTime(w.created_at)}</div>
                  </div>
                  <div className="text-sm font-semibold text-ink sm:mr-2">{formatCurrency(w.amount, w.currency)}</div>
                  <div className="flex gap-2">
                    <button onClick={() => reviewWithdrawal(w, true)} disabled={busyId === w.id} className="btn-primary px-3 py-1.5 text-xs">
                      <CheckIcon size={14} /> Approve
                    </button>
                    <button onClick={() => reviewWithdrawal(w, false)} disabled={busyId === w.id} className="btn-ghost px-3 py-1.5 text-xs">
                      <CloseIcon size={14} /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Deposits */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          Deposit requests
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">{deposits.length}</span>
        </h3>
        {loading ? (
          <div className="card p-6 text-center text-sm text-muted">Loading…</div>
        ) : deposits.length === 0 ? (
          <div className="card p-6 text-center text-sm text-muted">No pending deposits.</div>
        ) : (
          <div className="card divide-y divide-line overflow-hidden">
            {deposits.map((d) => {
              const Brand = BRAND_CHANNEL_ICONS[d.method];
              return (
                <div key={d.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center">
                    {Brand ? <Brand size={32} /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink">{who(d.user_id)} · {d.source}</div>
                    <div className="truncate text-xs text-muted">{d.method} · {acct(d.account_id)} · {formatDateTime(d.created_at)}</div>
                  </div>
                  <div className="text-sm font-semibold text-success sm:mr-2">+{formatCurrency(d.amount, d.currency)}</div>
                  <div className="flex gap-2">
                    <button onClick={() => reviewDeposit(d, true)} disabled={busyId === d.id} className="btn-primary px-3 py-1.5 text-xs">
                      <CheckIcon size={14} /> Approve
                    </button>
                    <button onClick={() => reviewDeposit(d, false)} disabled={busyId === d.id} className="btn-ghost px-3 py-1.5 text-xs">
                      <CloseIcon size={14} /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
