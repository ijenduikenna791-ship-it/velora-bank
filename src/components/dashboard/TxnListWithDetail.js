"use client";

import { useState } from "react";
import TxnList from "@/components/dashboard/TxnList";
import { CHANNELS, formatCurrency, formatDateTime } from "@/lib/utils";
import { BRAND_CHANNEL_ICONS } from "@/components/ui/brand-icons";
import { CloseIcon, CopyIcon, ArrowUpRightIcon, ArrowDownLeftIcon } from "@/components/ui/icons";

/**
 * A transaction list whose rows open a payment-details sheet when tapped.
 * Reusable on both the customer and admin dashboards (it's a client wrapper
 * so it can hold the modal state that a server component can't).
 */
export default function TxnListWithDetail({ transactions = [], ownAccountIds = [], compact = false }) {
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  return (
    <>
      <TxnList
        transactions={transactions}
        ownAccountIds={ownAccountIds}
        compact={compact}
        onSelect={(tx) => { setSelected(tx); setCopied(false); }}
      />
      {selected && (
        <TxnDetail
          tx={selected}
          incoming={ownAccountIds.includes(selected.to_account) && !ownAccountIds.includes(selected.from_account)}
          copied={copied}
          onCopy={() => { navigator.clipboard?.writeText(selected.reference); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

export function TxnDetail({ tx, incoming, copied, onCopy, onClose }) {
  const Brand = BRAND_CHANNEL_ICONS[tx.type];
  const amount = formatCurrency(tx.amount, tx.currency).replace(/^[-−]/, "");
  const channel = CHANNELS.find((c) => c.id === tx.type)?.label || tx.type;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-5" onClick={onClose}>
      <div
        className="card w-full max-w-md overflow-hidden rounded-b-none rounded-t-3xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-6 pb-6 pt-7 text-center text-white" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand-light)), rgb(var(--brand)) 55%, rgb(var(--accent)))" }}>
          <button onClick={onClose} className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30" aria-label="Close">
            <CloseIcon size={16} />
          </button>
          <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            {Brand ? <Brand size={30} /> : incoming ? <ArrowDownLeftIcon size={24} /> : <ArrowUpRightIcon size={24} />}
          </div>
          <div className="text-xs font-medium uppercase tracking-widest text-white/80">{incoming ? "Received" : "Sent"}</div>
          <div className="mt-1 font-display text-3xl font-extrabold">
            {incoming ? "+" : "−"}{amount}
          </div>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold capitalize">
            {tx.status}
          </span>
        </div>

        <div className="px-6 py-5">
          <dl className="divide-y divide-line">
            <Row label="Type" value={channel} cap />
            <Row label="Direction" value={incoming ? "Incoming" : "Outgoing"} />
            {tx.recipient_name && <Row label="Recipient" value={tx.recipient_name} />}
            {tx.recipient_label && <Row label={incoming ? "From" : "To"} value={tx.recipient_label} />}
            {Number(tx.fee) > 0 && <Row label="Fee" value={formatCurrency(tx.fee, tx.currency)} />}
            <Row label="Date" value={formatDateTime(tx.created_at)} />
            {tx.note && <Row label="Note" value={tx.note} />}
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="text-sm text-muted">Reference</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="truncate font-mono text-xs text-ink">{tx.reference}</span>
                <button onClick={onCopy} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand hover:underline">
                  <CopyIcon size={13} /> {copied ? "Copied" : "Copy"}
                </button>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, cap }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="shrink-0 text-sm text-muted">{label}</dt>
      <dd className={`max-w-[62%] truncate text-sm font-medium text-ink ${cap ? "capitalize" : ""}`}>{value}</dd>
    </div>
  );
}
