"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDateTime, initials } from "@/lib/utils";
import { BRAND_CHANNEL_ICONS } from "@/components/ui/brand-icons";
import {
  SearchIcon, CheckIcon, CloseIcon, CheckCircleIcon, ArrowDownLeftIcon,
} from "@/components/ui/icons";

const FILTERS = ["all", "pending", "approved", "rejected"];
const STATUS_STYLE = {
  approved: "bg-success/15 text-success",
  pending: "bg-warn/15 text-warn",
  rejected: "bg-danger/15 text-danger",
};

export default function AdminDepositsPage() {
  const supabase = createClient();
  const [deposits, setDeposits] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: deps }, { data: profs }, { data: accts }] = await Promise.all([
      supabase.from("deposits").select("*").order("created_at", { ascending: false }).limit(300),
      supabase.from("profiles").select("id, full_name, email"),
      supabase.from("accounts").select("id, account_number, account_type"),
    ]);
    setDeposits(deps || []);
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

  async function review(d, approve) {
    setBusyId(d.id); setError("");
    const { error } = await supabase.rpc("admin_review_deposit", { p_id: d.id, p_approve: approve });
    setBusyId(null);
    if (error) return setError(error.message);
    notify(d.user_id, `Deposit ${approve ? "approved" : "declined"}`,
      `Your deposit of ${formatCurrency(d.amount, d.currency)} has been ${approve ? "approved and credited to your account" : "declined"}.`);
    flash(approve ? "Deposit approved & credited" : "Deposit rejected");
    load();
  }

  const counts = useMemo(() => {
    const c = { all: deposits.length };
    FILTERS.slice(1).forEach((f) => { c[f] = deposits.filter((x) => x.status === f).length; });
    return c;
  }, [deposits]);

  const pendingTotal = useMemo(
    () => deposits.filter((d) => d.status === "pending").reduce((s, d) => s + Number(d.amount || 0), 0),
    [deposits]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deposits.filter((d) => {
      if (filter !== "all" && d.status !== filter) return false;
      if (!q) return true;
      return who(d.user_id).toLowerCase().includes(q) || d.source?.toLowerCase().includes(q) || d.reference?.toLowerCase().includes(q);
    });
  }, [deposits, query, filter, profiles]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Deposits</h1>
        <p className="text-sm text-muted">Review and approve customer deposit requests. Approving credits the account.</p>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Pending requests" value={counts.pending || 0} icon={<ArrowDownLeftIcon size={18} />} />
        <Stat label="Pending value" value={formatCurrency(pendingTotal)} icon={<ArrowDownLeftIcon size={18} />} />
        <Stat label="Total deposits" value={counts.all} icon={<CheckCircleIcon size={18} />} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, source, reference…" className="input pl-11" />
        </div>
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
      </div>

      {loading ? (
        <div className="card p-8 text-center text-sm text-muted">Loading deposits…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <ArrowDownLeftIcon size={30} className="mx-auto mb-3 text-muted" />
          <div className="text-sm font-medium text-ink">No deposits found</div>
          <div className="mt-1 text-xs text-muted">No deposits match this filter.</div>
        </div>
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {filtered.map((d) => {
            const Brand = BRAND_CHANNEL_ICONS[d.method];
            return (
              <div key={d.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center">
                  {Brand ? <Brand size={32} /> : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-xs font-bold text-white">
                      {initials(who(d.user_id))}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">{who(d.user_id)}{d.source ? ` · ${d.source}` : ""}</div>
                  <div className="truncate text-xs capitalize text-muted">{d.method} · {acct(d.account_id)} · {formatDateTime(d.created_at)}</div>
                </div>
                <div className="text-sm font-semibold text-success sm:mr-1">+{formatCurrency(d.amount, d.currency)}</div>
                {d.status === "pending" ? (
                  <div className="flex gap-2">
                    <button onClick={() => review(d, true)} disabled={busyId === d.id} className="btn-primary px-3 py-1.5 text-xs">
                      <CheckIcon size={14} /> Approve
                    </button>
                    <button onClick={() => review(d, false)} disabled={busyId === d.id} className="btn-ghost px-3 py-1.5 text-xs">
                      <CloseIcon size={14} /> Reject
                    </button>
                  </div>
                ) : (
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[d.status] || "bg-muted/15 text-muted"}`}>
                    {d.status}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-muted">{label}</div>
        <div className="truncate text-lg font-bold text-ink">{value}</div>
      </div>
    </div>
  );
}
