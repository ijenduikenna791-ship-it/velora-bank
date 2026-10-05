"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { CopyIcon, CheckIcon, WalletIcon, BankIcon, ArrowDownLeftIcon } from "@/components/ui/icons";

export default function AccountsPanel({ accounts = [] }) {
  const [copied, setCopied] = useState(null);

  function copy(num) {
    try {
      navigator.clipboard?.writeText(num);
      setCopied(num);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }

  if (!accounts.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Your accounts</h3>
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <ArrowDownLeftIcon size={14} /> Share a number to receive money
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {accounts.map((a) => {
          const Icon = a.account_type === "Savings" ? WalletIcon : BankIcon;
          const isFrozen = a.status && a.status !== "active";
          return (
            <div key={a.id} className={`card p-5 ${isFrozen ? "border-danger/40" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${isFrozen ? "bg-danger/10 text-danger" : "bg-brand/10 text-brand"}`}>
                    <Icon size={16} />
                  </span>
                  {a.account_type}
                  {isFrozen && (
                    <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-danger">
                      {a.status === "closed" ? "Closed" : "Frozen"}
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold text-ink">
                  {formatCurrency(a.balance, a.currency)}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-widest text-muted">Account number</div>
                <button
                  onClick={() => copy(a.account_number)}
                  className="mt-1 flex w-full items-center justify-between rounded-xl border border-line bg-surface px-3 py-2.5 text-left transition hover:border-brand/40"
                >
                  <span className="font-mono text-sm tracking-wider text-ink">{a.account_number}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-brand">
                    {copied === a.account_number ? <><CheckIcon size={14} /> Copied</> : <><CopyIcon size={14} /> Copy</>}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
