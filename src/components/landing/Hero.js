"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SmartImage from "@/components/ui/SmartImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  SparklesIcon, ArrowRightIcon, ShieldIcon, SendIcon, ArrowUpRightIcon, ArrowDownLeftIcon,
} from "@/components/ui/icons";

/* Real modern-bank-building photo from Pexels (free to use). Swap in README. */
const BUILDING =
  "https://images.pexels.com/photos/34649284/pexels-photo-34649284.jpeg?auto=compress&cs=tinysrgb&w=1100";

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32">
      {/* Background glow + stars */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 55% at 75% 25%, rgb(124 58 237 / 0.35), transparent 70%)" }}
      />
      <div className="starfield pointer-events-none absolute inset-0 opacity-40 dark:opacity-70" />

      <div className="container-px relative grid items-center gap-12 lg:grid-cols-2">
        {/* Left — copy */}
        <div className="relative">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="chip mb-6 bg-white/5 text-ink"
          >
            <SparklesIcon size={14} className="text-brand-light" />
            {t("hero.badge")}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-ink sm:text-6xl"
          >
            {t("hero.title1")}
            <br />
            <span className="bg-gradient-to-r from-brand-light via-brand to-accent bg-clip-text text-transparent">
              {t("hero.title2")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-5 max-w-lg text-pretty text-sm text-muted sm:text-base"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/register" className="btn-primary">
              {t("hero.openAccount")}
              <ArrowRightIcon size={16} />
            </Link>
            <Link href="#features" className="btn-ghost">
              {t("hero.seeYields")}
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-10 grid max-w-md grid-cols-3 gap-4"
          >
            {[
              { num: "93%", label: t("stats.growth") },
              { num: "17%", label: t("stats.cashback") },
              { num: "40+", label: t("stats.countries") },
            ].map((s, i) => (
              <div key={s.label} className={i !== 0 ? "border-l border-line pl-4" : ""}>
                <div className="stat-num">{s.num}</div>
                <div className="mt-1 text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-7 inline-flex items-center gap-2 text-xs text-muted"
          >
            <ShieldIcon size={15} className="text-brand" />
            Trusted by members in 40+ countries worldwide
          </motion.div>
        </div>

        {/* Right — building + floating dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-brand/35 via-accent/15 to-transparent blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-line shadow-glow">
            <SmartImage
              src={BUILDING}
              alt="Modern Velora bank building at night"
              className="h-[380px] w-full object-cover sm:h-[480px]"
              fallbackClassName="h-[380px] w-full sm:h-[480px]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
          </div>

          {/* Floating balance / dashboard card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { delay: 0.6, duration: 0.6 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
            }}
            className="absolute -bottom-6 -left-4 w-64 rounded-2xl border border-line bg-card/90 p-4 shadow-soft backdrop-blur-xl sm:-left-8"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-muted">Total balance</span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-brand">
                <SendIcon size={14} />
              </span>
            </div>
            <div className="mt-1 font-display text-2xl font-extrabold text-ink">$24,580.00</div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-success/15 text-success">
                    <ArrowDownLeftIcon size={13} />
                  </span>
                  Incoming
                </span>
                <span className="font-semibold text-success">+$1,200</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand/15 text-brand">
                    <ArrowUpRightIcon size={13} />
                  </span>
                  Wire transfer
                </span>
                <span className="font-semibold text-ink">−$450</span>
              </div>
            </div>
          </motion.div>

          {/* Floating gold card chip */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            transition={{
              opacity: { delay: 0.7, duration: 0.6 },
              y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
            }}
            className="absolute -right-3 top-8 w-44 overflow-hidden rounded-2xl p-4 text-white shadow-glow sm:-right-6"
            style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand-light)), rgb(var(--brand)) 55%, rgb(var(--accent)))" }}
          >
            <div className="flex items-center justify-between">
              <span className="h-5 w-7 rounded bg-white/25" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Velora</span>
            </div>
            <div className="mt-5 font-mono text-xs tracking-widest text-white/80">•••• 4921</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
