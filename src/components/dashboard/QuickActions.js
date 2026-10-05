"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { SendIcon, ArrowDownLeftIcon, CardIcon, ChartIcon } from "@/components/ui/icons";

export default function QuickActions() {
  const { t } = useI18n();
  const actions = [
    { href: "/dashboard/transfer", label: t("dash.send"), icon: SendIcon },
    { href: "/dashboard/transactions", label: t("dash.recent"), icon: ChartIcon },
    { href: "/dashboard/cards", label: t("dash.cards"), icon: CardIcon },
    { href: "/dashboard/transfer", label: t("dash.request"), icon: ArrowDownLeftIcon },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((a, i) => {
        const Icon = a.icon;
        return (
          <motion.div key={a.label + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link
              href={a.href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-card p-4 text-center transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-soft"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon size={20} />
              </span>
              <span className="text-xs font-medium text-ink">{a.label}</span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
