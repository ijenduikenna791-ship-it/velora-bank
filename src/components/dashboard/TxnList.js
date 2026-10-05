"use client";

import { motion } from "framer-motion";
import { formatCurrency, formatDateTime, maskAccount } from "@/lib/utils";
import { ArrowUpRightIcon, ArrowDownLeftIcon } from "@/components/ui/icons";
import { BRAND_CHANNEL_ICONS } from "@/components/ui/brand-icons";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function TxnList({ transactions = [], ownAccountIds = [], compact = false }) {
  const { t } = useI18n();

  if (!transactions.length) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center">
        <div className="text-sm font-medium text-ink">No activity yet</div>
        <div className="text-xs text-muted">Your transfers will appear here.</div>
      </div>
    );
  }

  return (
    <div className={compact ? "divide-y divide-line" : "card divide-y divide-line overflow-hidden"}>
      {transactions.map((tx, i) => {
        const incoming = ownAccountIds.includes(tx.to_account) && !ownAccountIds.includes(tx.from_account);
        const Brand = BRAND_CHANNEL_ICONS[tx.type];
        return (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3) }}
            className="flex items-center gap-4 px-5 py-4"
          >
            {Brand ? (
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center">
                <Brand size={34} />
              </span>
            ) : (
              <span
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  incoming ? "bg-success/10 text-success" : "bg-brand/10 text-brand"
                }`}
              >
                {incoming ? <ArrowDownLeftIcon size={20} /> : <ArrowUpRightIcon size={20} />}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-ink">
                  {tx.recipient_name || (incoming ? "Incoming transfer" : "Transfer")}
                </span>
                <span className="hidden rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted sm:inline">
                  {tx.type}
                </span>
              </div>
              <div className="mt-0.5 truncate text-xs text-muted">
                {tx.recipient_label || maskAccount(tx.reference)} · {formatDateTime(tx.created_at)}
              </div>
            </div>

            <div className="text-right">
              <div className={`flex items-center justify-end gap-1 text-sm font-semibold tabular-nums ${incoming ? "text-success" : "text-ink"}`}>
                {incoming ? <ArrowDownLeftIcon size={14} /> : <ArrowUpRightIcon size={14} />}
                {incoming ? "+" : "−"}
                {formatCurrency(tx.amount, tx.currency).replace(/^[-−]/, "")}
              </div>
              <div className="mt-0.5 text-[11px] capitalize text-muted">{tx.status}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
