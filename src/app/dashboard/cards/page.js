"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { CardIcon, PlusIcon, CheckCircleIcon, LockIcon, CloseIcon } from "@/components/ui/icons";

const GRADIENTS = [
  "linear-gradient(135deg, rgb(var(--brand-light)), rgb(var(--brand)) 55%, rgb(var(--accent)))",
  "linear-gradient(135deg, #1f2937, #4c1d95)",
  "linear-gradient(135deg, rgb(var(--accent)), #7e22ce)",
];

function groupCard(num) {
  if (!num) return "•••• •••• •••• ••••";
  return "•••• •••• •••• " + String(num).slice(-4);
}

const STATUS_STYLE = {
  approved: "bg-success/15 text-success",
  pending: "bg-warn/15 text-warn",
  rejected: "bg-danger/15 text-danger",
  frozen: "bg-muted/15 text-muted",
};

export default function CardsPage() {
  const supabase = createClient();
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [picking, setPicking] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: accts }, { data: crds }] = await Promise.all([
      supabase.from("accounts").select("id, account_number, account_type, currency, balance").eq("is_demo_pool", false).order("created_at", { ascending: true }),
      supabase.from("cards").select("*").order("created_at", { ascending: false }),
    ]);
    setAccounts(accts || []);
    setCards(crds || []);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const accountsWithoutCard = accounts.filter(
    (a) => !cards.some((c) => c.account_id === a.id && ["pending", "approved"].includes(c.status))
  );

  async function apply(accountId) {
    setBusy(true); setError("");
    const { error } = await supabase.rpc("request_card", { p_account: accountId });
    setBusy(false); setPicking(false);
    if (error) return setError(error.message);
    setToast("Application submitted — awaiting admin approval");
    setTimeout(() => setToast(""), 2600);
    load();
  }

  const acctLabel = (id) => {
    const a = accounts.find((x) => x.id === id);
    return a ? `${a.account_type} · •••• ${String(a.account_number).slice(-4)}` : "";
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Cards</h1>
          <p className="text-sm text-muted">Apply for a Velora debit card. New cards are activated after admin approval.</p>
        </div>
        {accountsWithoutCard.length > 0 && (
          <button onClick={() => { setPicking(true); setError(""); }} className="btn-primary w-fit">
            <PlusIcon size={16} /> Apply for debit card
          </button>
        )}
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-sm text-muted">Loading…</div>
      ) : cards.length === 0 ? (
        <div className="card p-10 text-center">
          <CardIcon size={32} className="mx-auto mb-3 text-muted" />
          <div className="text-sm font-medium text-ink">No cards yet</div>
          <div className="mt-1 text-xs text-muted">Apply for a debit card to get started.</div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {cards.map((c, i) => (
            <div key={c.id}>
              <div
                className="relative aspect-[1.6/1] overflow-hidden rounded-2xl p-6 text-white shadow-soft"
                style={{ backgroundImage: GRADIENTS[i % GRADIENTS.length], opacity: c.status === "approved" ? 1 : 0.55 }}
              >
                <div className="starfield pointer-events-none absolute inset-0 opacity-25" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="h-8 w-11 rounded-md bg-white/25" />
                    <span className="font-display text-sm font-bold tracking-wide">Velora</span>
                  </div>
                  <div>
                    <div className="font-mono text-base tracking-[0.18em]">{groupCard(c.card_number)}</div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-white/60">Card holder</div>
                        <div className="text-sm font-medium">{c.card_holder || "Velora Member"}</div>
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-white/70">{c.card_type}</div>
                    </div>
                  </div>
                </div>
                {c.status !== "approved" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white">
                      <LockIcon size={14} /> {c.status === "pending" ? "Awaiting approval" : "Rejected"}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between px-1">
                <span className="text-xs text-muted">{acctLabel(c.account_id)}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[c.status] || ""}`}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply modal */}
      {picking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5" onClick={() => setPicking(false)}>
          <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Apply for a debit card</h3>
              <button onClick={() => setPicking(false)} className="text-muted hover:text-ink"><CloseIcon size={18} /></button>
            </div>
            <p className="mt-1 text-sm text-muted">Choose the account to link this card to.</p>
            <div className="mt-4 space-y-2">
              {accountsWithoutCard.map((a) => (
                <button
                  key={a.id}
                  onClick={() => apply(a.id)}
                  disabled={busy}
                  className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left transition hover:border-brand/40 disabled:opacity-50"
                >
                  <span className="text-sm text-ink">{a.account_type} · •••• {String(a.account_number).slice(-4)}</span>
                  <span className="text-xs text-muted">{formatCurrency(a.balance, a.currency)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
