"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CHANNELS, formatCurrency, formatDateTime } from "@/lib/utils";
import { BRAND_CHANNEL_ICONS } from "@/components/ui/brand-icons";
import { ArrowUpRightIcon, CheckCircleIcon, LockIcon } from "@/components/ui/icons";
import PinGate from "@/components/dashboard/PinGate";

const STATUS_STYLE = {
  approved: "bg-success/15 text-success",
  pending: "bg-warn/15 text-warn",
  rejected: "bg-danger/15 text-danger",
};

export default function WithdrawPage() {
  const supabase = createClient();
  const [accounts, setAccounts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("local");
  const [destination, setDestination] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showPin, setShowPin] = useState(false);

  async function load() {
    const [{ data: accts }, { data: wds }] = await Promise.all([
      supabase.from("accounts").select("id, account_number, account_type, currency, balance").eq("is_demo_pool", false).order("created_at", { ascending: true }),
      supabase.from("withdrawals").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setAccounts(accts || []);
    if (accts?.[0] && !account) setAccount(accts[0].id);
    setRequests(wds || []);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const active = accounts.find((a) => a.id === account);

  function submit(e) {
    e.preventDefault();
    setError("");
    const amt = parseFloat(amount);
    if (!account) return setError("Select an account.");
    if (!amt || amt <= 0) return setError("Enter a valid amount.");
    if (active && amt > Number(active.balance)) return setError("Insufficient balance.");
    if (!destination.trim()) return setError("Enter where the funds should go.");
    setShowPin(true);
  }

  async function doWithdraw() {
    setShowPin(false);
    setBusy(true);
    const { error } = await supabase.rpc("request_withdrawal", {
      p_account: account,
      p_amount: parseFloat(amount),
      p_method: method,
      p_destination: destination.trim(),
      p_note: note.trim() || null,
    });
    setBusy(false);
    if (error) return setError(error.message);
    setAmount(""); setDestination(""); setNote("");
    setToast("Withdrawal requested — awaiting admin approval");
    setTimeout(() => setToast(""), 2600);
    load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Withdraw</h1>
        <p className="text-sm text-muted">Request a withdrawal. Funds leave your balance only after an admin approves.</p>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">From account</label>
            <select value={account} onChange={(e) => setAccount(e.target.value)} className="input">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_type} · •••• {String(a.account_number).slice(-4)} · {formatCurrency(a.balance, a.currency)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="input">
              {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Amount *</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">{active?.currency || "USD"}</span>
              <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="input pl-14 text-lg font-semibold" />
            </div>
          </div>
          <div>
            <label className="label">Destination *</label>
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Account / email / wallet / tag" className="input" />
          </div>
        </div>
        <div>
          <label className="label">Note (optional)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's this withdrawal for?" className="input" />
        </div>

        {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          <ArrowUpRightIcon size={16} /> {busy ? "Submitting…" : "Request withdrawal"}
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white/5 px-4 py-3 text-xs text-muted">
          <LockIcon size={15} className="text-brand" /> Requests are reviewed by an admin before any funds move.
        </div>
      </form>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Your withdrawal requests</h3>
        {requests.length === 0 ? (
          <div className="card p-8 text-center text-sm text-muted">No withdrawal requests yet.</div>
        ) : (
          <div className="card divide-y divide-line overflow-hidden">
            {requests.map((w) => {
              const Brand = BRAND_CHANNEL_ICONS[w.method];
              return (
                <div key={w.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center">
                    {Brand ? <Brand size={32} /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink">{w.destination}</div>
                    <div className="truncate text-xs text-muted">{w.method} · {formatDateTime(w.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-ink">{formatCurrency(w.amount, w.currency)}</div>
                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[w.status] || ""}`}>
                      {w.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PinGate
        open={showPin}
        onClose={() => setShowPin(false)}
        onVerified={doWithdraw}
        title="Authorize withdrawal"
        subtitle={active ? `${formatCurrency(parseFloat(amount || 0), active.currency)} · ${active.account_type}` : ""}
      />
    </div>
  );
}
