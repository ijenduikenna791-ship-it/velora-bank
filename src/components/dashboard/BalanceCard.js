"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { maskAccount } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { WalletIcon } from "@/components/ui/icons";

function useCountUp(target, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export default function BalanceCard({ balance = 0, currency = "USD", accountNumber, accountType }) {
  const { t, lang } = useI18n();
  const animated = useCountUp(Number(balance) || 0);

  const formatted = new Intl.NumberFormat(lang === "en" ? "en-US" : lang, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(animated);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-7 text-white"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgb(var(--brand-light)), rgb(var(--brand)) 55%, rgb(var(--accent)))",
      }}
    >
      <div className="starfield pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <WalletIcon size={18} /> {t("dash.totalBalance")}
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{accountType || "Checking"}</span>
        </div>

        <div className="mt-4 font-display text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
          {formatted}
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/60">Account</div>
            <div className="mt-0.5 font-mono text-sm tracking-widest text-white/90">
              {maskAccount(accountNumber)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-widest text-white/60">{t("dash.available")}</div>
            <div className="mt-0.5 text-sm font-semibold">{currency}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
