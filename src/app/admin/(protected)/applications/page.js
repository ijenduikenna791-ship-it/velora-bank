"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDateTime, initials } from "@/lib/utils";
import { BRAND_CHANNEL_ICONS } from "@/components/ui/brand-icons";
import { CardIcon, CheckIcon, CloseIcon, CheckCircleIcon, ArrowDownLeftIcon, ArrowUpRightIcon } from "@/components/ui/icons";

const TABS = [
  { key: "all", label: "All" },
  { key: "cards", label: "Cards" },
  { key: "deposits", label: "Deposits" },
  { key: "withdrawals", label: "Withdrawals" },
];

export default function UserApplicationsPage() {
  const supabase = createClient();
  const [cards, setCards] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: crds }, { data: deps }, { data: wds }, { data: profs }, { data: accts }] = await Promise.all([
      supabase.from("cards").select("*").eq("status", "pending").order("created_at", { ascending: true }),
      supabase.from("deposits").select("*").eq("status", "pending").order("created_at", { ascending: true }),
      supabase.from("withdrawals").select("*").eq("status", "pending").order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, full_name, email"),
      supabase.from("accounts").select("id, account_number, account_type"),
    ]);
    setCards(crds || []);
    setDeposits(deps || []);
    setWithdrawals(wds || []);
    setProfiles(Object.fromEntries((profs || []).map((p) => [p.id, p])));
    setAccounts(Object.fromEntries((accts || []).map((a) => [a.id, a])));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function flash(m) { setToast(m); setTimeout(() => setToast(""), 2400); }
  const who = (uid) => profiles[uid]?.full_name || profiles[uid]?.email || "Customer";
  const acct = (id) => { const a = accounts[id]; return a ? `${a.account_type} · •••• ${String(a.account_number).slice(-4)}` : "—"; };

  async function notify(uid, subject, text) {
    const email = profiles[uid]?.email;
    if (!email) return;
    try {
      await fetch("/api/notify-approval", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, text }),
      });
    } catch {}
  }

  async function run(id, rpc, args, msg, notifyArgs) {
    setBusyId(id); setError("");
    const { error } = await supabase.rpc(rpc, args);
    setBusyId(null);
    if (error) return setError(error.message);
    if (notifyArgs) notify(...notifyArgs);
    flash(msg);
    load();
  }

  const reviewCard = (c, ok) => run(c.id, "admin_review_card", { p_card: c.id, p_approve: ok },
    ok ? "Card approved" : "Card rejected",
    [c.user_id, `Your debit card was ${ok ? "approved" : "declined"}`, `Your Velora debit card application has been ${ok ? "approved and is now active" : "declined"}.`]);
  const reviewDeposit = (d, ok) => run(d.id, "admin_review_deposit", { p_id: d.id, p_approve: ok },
    ok ? "Deposit approved & credited" : "Deposit rejected",
    [d.user_id, `Deposit ${ok ? "approved" : "declined"}`, `Your deposit of ${formatCurrency(d.amount, d.currency)} has been ${ok ? "approved and credited" : "declined"}.`]);
  const reviewWithdrawal = (w, ok) => run(w.id, "admin_review_withdrawal", { p_id: w.id, p_approve: ok },
    ok ? "Withdrawal approved & paid" : "Withdrawal rejected",
    [w.user_id, `Withdrawal ${ok ? "approved" : "declined"}`, `Your withdrawal of ${formatCurrency(w.amount, w.currency)} to ${w.destination} has been ${ok ? "approved and paid out" : "declined"}.`]);

  const total = cards.length + deposits.length + withdrawals.length;
  const counts = { all: total, cards: cards.length, deposits: deposits.length, withdrawals: withdrawals.length };

  const showCards = tab === "all" || tab === "cards";
  const showDeposits = tab === "all" || tab === "deposits";
  const showWithdrawals = tab === "all" || tab === "withdrawals";

  const empty = useMemo(() => total === 0, [total]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">User Applications</h1>
        <p className="text-sm text-muted">Everything waiting for your review, in one place.</p>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              tab === t.key ? "bg-brand text-white shadow-glow" : "border border-line text-muted hover:text-ink"
            }`}
          >
            {t.label} <span className="opacity-70">· {counts[t.key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-8 text-center text-sm text-muted">Loading…</div>
      ) : empty ? (
        <div className="card p-10 text-center">
          <CheckCircleIcon size={30} className="mx-auto mb-3 text-success" />
          <div className="text-sm font-medium text-ink">Nothing to review</div>
          <div className="mt-1 text-xs text-muted">All customer requests are up to date.</div>
        </div>
      ) : (
        <div className="space-y-8">
          {showCards && cards.length > 0 && (
            <Section title="Card applications" count={cards.length} icon={<CardIcon size={16} className="text-brand" />}>
              {cards.map((c) => (
                <Row
                  key={c.id}
                  avatar={<Avatar name={who(c.user_id)} />}
                  title={who(c.user_id)}
                  sub={`${c.card_type} card · ${acct(c.account_id)} · ${formatDateTime(c.created_at)}`}
                  busy={busyId === c.id}
                  onApprove={() => reviewCard(c, true)}
                  onReject={() => reviewCard(c, false)}
                />
              ))}
            </Section>
          )}

          {showDeposits && deposits.length > 0 && (
            <Section title="Deposit requests" count={deposits.length} icon={<ArrowDownLeftIcon size={16} className="text-success" />}>
              {deposits.map((d) => {
                const Brand = BRAND_CHANNEL_ICONS[d.method];
                return (
                  <Row
                    key={d.id}
                    avatar={Brand ? <span className="inline-flex h-10 w-10 items-center justify-center"><Brand size={32} /></span> : <Avatar name={who(d.user_id)} />}
                    title={`${who(d.user_id)}${d.source ? ` · ${d.source}` : ""}`}
                    sub={`${d.method} · ${acct(d.account_id)} · ${formatDateTime(d.created_at)}`}
                    amount={<span className="text-success">+{formatCurrency(d.amount, d.currency)}</span>}
                    busy={busyId === d.id}
                    onApprove={() => reviewDeposit(d, true)}
                    onReject={() => reviewDeposit(d, false)}
                  />
                );
              })}
            </Section>
          )}

          {showWithdrawals && withdrawals.length > 0 && (
            <Section title="Withdrawal requests" count={withdrawals.length} icon={<ArrowUpRightIcon size={16} className="text-brand" />}>
              {withdrawals.map((w) => {
                const Brand = BRAND_CHANNEL_ICONS[w.method];
                return (
                  <Row
                    key={w.id}
                    avatar={Brand ? <span className="inline-flex h-10 w-10 items-center justify-center"><Brand size={32} /></span> : <Avatar name={who(w.user_id)} />}
                    title={`${who(w.user_id)} → ${w.destination}`}
                    sub={`${w.method} · ${acct(w.account_id)} · ${formatDateTime(w.created_at)}`}
                    amount={<span className="text-ink">{formatCurrency(w.amount, w.currency)}</span>}
                    busy={busyId === w.id}
                    onApprove={() => reviewWithdrawal(w, true)}
                    onReject={() => reviewWithdrawal(w, false)}
                  />
                );
              })}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, count, icon, children }) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        {icon} {title}
        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">{count}</span>
      </h3>
      <div className="card divide-y divide-line overflow-hidden">{children}</div>
    </section>
  );
}

function Avatar({ name }) {
  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-xs font-bold text-white">
      {initials(name)}
    </span>
  );
}

function Row({ avatar, title, sub, amount, busy, onApprove, onReject }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
      <span className="shrink-0">{avatar}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">{title}</div>
        <div className="truncate text-xs capitalize text-muted">{sub}</div>
      </div>
      {amount && <div className="text-sm font-semibold tabular-nums sm:mr-1">{amount}</div>}
      <div className="flex gap-2">
        <button onClick={onApprove} disabled={busy} className="btn-primary px-3 py-1.5 text-xs">
          <CheckIcon size={14} /> Approve
        </button>
        <button onClick={onReject} disabled={busy} className="btn-ghost px-3 py-1.5 text-xs">
          <CloseIcon size={14} /> Reject
        </button>
      </div>
    </div>
  );
}
