"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, initials } from "@/lib/utils";
import { CardIcon, CheckIcon, CloseIcon, CheckCircleIcon, ArrowRightIcon } from "@/components/ui/icons";

export default function PendingCardsPage() {
  const supabase = createClient();
  const [cards, setCards] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: crds }, { data: profs }, { data: accts }] = await Promise.all([
      supabase.from("cards").select("*").eq("status", "pending").order("created_at", { ascending: true }),
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Pending Applications</h1>
          <p className="text-sm text-muted">Debit-card applications awaiting review.</p>
        </div>
        <Link href="/admin/cards" className="btn-ghost w-fit text-sm">
          All cards <ArrowRightIcon size={15} />
        </Link>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      {loading ? (
        <div className="card p-8 text-center text-sm text-muted">Loading applications…</div>
      ) : cards.length === 0 ? (
        <div className="card p-10 text-center">
          <CheckCircleIcon size={30} className="mx-auto mb-3 text-success" />
          <div className="text-sm font-medium text-ink">All caught up</div>
          <div className="mt-1 text-xs text-muted">No card applications are waiting for review.</div>
        </div>
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {cards.map((c) => (
            <div key={c.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-xs font-bold text-white">
                {initials(who(c.user_id))}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink">{who(c.user_id)}</div>
                <div className="truncate text-xs text-muted">
                  <CardIcon size={12} className="mr-1 inline align-[-1px]" />
                  {c.card_type} card · {acct(c.account_id)} · {formatDateTime(c.created_at)}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => review(c, true)} disabled={busyId === c.id} className="btn-primary px-3 py-1.5 text-xs">
                  <CheckIcon size={14} /> Approve
                </button>
                <button onClick={() => review(c, false)} disabled={busyId === c.id} className="btn-ghost px-3 py-1.5 text-xs">
                  <CloseIcon size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
