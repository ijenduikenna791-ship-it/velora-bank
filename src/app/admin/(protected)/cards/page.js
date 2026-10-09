"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, initials } from "@/lib/utils";
import {
  SearchIcon, CardIcon, CheckIcon, CloseIcon, LockIcon, CheckCircleIcon, EyeIcon, EyeOffIcon,
} from "@/components/ui/icons";

const FILTERS = ["all", "pending", "approved", "frozen", "rejected"];
const STATUS_STYLE = {
  approved: "bg-success/15 text-success",
  pending: "bg-warn/15 text-warn",
  rejected: "bg-danger/15 text-danger",
  frozen: "bg-muted/20 text-muted",
};

function maskCard(num, reveal) {
  if (!num) return "•••• •••• •••• ••••";
  const s = String(num);
  if (reveal) return s.replace(/(.{4})/g, "$1 ").trim();
  return "•••• •••• •••• " + s.slice(-4);
}

export default function AdminCardsPage() {
  const supabase = createClient();
  const [cards, setCards] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: crds }, { data: profs }, { data: accts }] = await Promise.all([
      supabase.from("cards").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email"),
      supabase.from("accounts").select("id, account_number, account_type"),
    ]);
    setCards(crds || []);
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

  async function review(c, approve) {
    setBusyId(c.id); setError("");
    const { error } = await supabase.rpc("admin_review_card", { p_card: c.id, p_approve: approve });
    setBusyId(null);
    if (error) return setError(error.message);
    notify(c.user_id, `Your debit card was ${approve ? "approved" : "declined"}`,
      `Your Velora debit card application has been ${approve ? "approved and is now active" : "declined"}.`);
    flash(approve ? "Card approved" : "Card rejected");
    load();
  }

  // Freeze / unfreeze directly (admin has full RLS on cards).
  async function setStatus(c, status) {
    setBusyId(c.id); setError("");
    const { error } = await supabase.from("cards").update({ status }).eq("id", c.id);
    setBusyId(null);
    if (error) return setError(error.message);
    flash(status === "frozen" ? "Card frozen" : "Card reactivated");
    load();
  }

  const counts = useMemo(() => {
    const c = { all: cards.length };
    FILTERS.slice(1).forEach((f) => { c[f] = cards.filter((x) => x.status === f).length; });
    return c;
  }, [cards]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return who(c.user_id).toLowerCase().includes(q) || String(c.card_number).includes(q) || c.card_holder?.toLowerCase().includes(q);
    });
  }, [cards, query, filter, profiles]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">All Cards</h1>
        <p className="text-sm text-muted">Every virtual debit card issued across the platform.</p>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search holder, number…" className="input pl-11" />
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
        <div className="card p-8 text-center text-sm text-muted">Loading cards…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <CardIcon size={30} className="mx-auto mb-3 text-muted" />
          <div className="text-sm font-medium text-ink">No cards found</div>
          <div className="mt-1 text-xs text-muted">No cards match this filter.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((c) => {
            const reveal = !!revealed[c.id];
            return (
              <div key={c.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-xs font-bold text-white">
                      {initials(who(c.user_id))}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink">{who(c.user_id)}</div>
                      <div className="truncate text-xs text-muted">{acct(c.account_id)}</div>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[c.status] || "bg-muted/15 text-muted"}`}>
                    {c.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-surface/50 px-4 py-3">
                  <CardIcon size={18} className="shrink-0 text-brand" />
                  <span className="flex-1 truncate font-mono text-sm tracking-wider text-ink">{maskCard(c.card_number, reveal)}</span>
                  <button
                    onClick={() => setRevealed((r) => ({ ...r, [c.id]: !r[c.id] }))}
                    className="text-muted hover:text-ink"
                    aria-label={reveal ? "Hide number" : "Reveal number"}
                  >
                    {reveal ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted">
                  <span>{c.card_type} · {c.card_holder || "Velora Member"}</span>
                  <span>{formatDateTime(c.created_at)}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {c.status === "pending" && (
                    <>
                      <button onClick={() => review(c, true)} disabled={busyId === c.id} className="btn-primary px-3 py-1.5 text-xs">
                        <CheckIcon size={14} /> Approve
                      </button>
                      <button onClick={() => review(c, false)} disabled={busyId === c.id} className="btn-ghost px-3 py-1.5 text-xs">
                        <CloseIcon size={14} /> Reject
                      </button>
                    </>
                  )}
                  {c.status === "approved" && (
                    <button onClick={() => setStatus(c, "frozen")} disabled={busyId === c.id} className="btn-ghost px-3 py-1.5 text-xs text-danger">
                      <LockIcon size={14} /> Freeze
                    </button>
                  )}
                  {c.status === "frozen" && (
                    <button onClick={() => setStatus(c, "approved")} disabled={busyId === c.id} className="btn-ghost px-3 py-1.5 text-xs">
                      <CheckIcon size={14} /> Reactivate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
