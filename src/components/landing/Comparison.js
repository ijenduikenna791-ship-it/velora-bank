"use client";

import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import { CheckCircleIcon, CloseIcon } from "@/components/ui/icons";

const ROWS = [
  { feature: "Open an account in minutes", velora: true, bank: false },
  { feature: "Instant transfers, 24/7", velora: true, bank: "Limited hours" },
  { feature: "Send via PayPal, crypto & wallets", velora: true, bank: false },
  { feature: "No hidden monthly fees", velora: true, bank: false },
  { feature: "Apply for a card in-app", velora: true, bank: "Days by mail" },
  { feature: "Manage everything from one dashboard", velora: true, bank: "Limited" },
];

function Cell({ value }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center text-success">
        <CheckCircleIcon size={22} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center text-muted/50">
        <CloseIcon size={20} />
      </span>
    );
  }
  return <span className="text-xs font-medium text-muted">{value}</span>;
}

export default function Comparison() {
  return (
    <section className="relative py-20">
      <div className="container-px">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip mx-auto mb-4">Why Velora</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Velora vs. traditional banks
          </h2>
          <p className="mt-3 text-muted">See how modern banking stacks up against the old way.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="card mx-auto mt-10 max-w-3xl overflow-hidden p-0"
        >
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-line bg-white/5 px-5 py-4 sm:px-6">
            <span className="text-sm font-semibold text-muted">Feature</span>
            <span className="flex w-24 justify-center sm:w-32">
              <Logo />
            </span>
            <span className="w-24 text-center text-xs font-semibold text-muted sm:w-32">
              Traditional banks
            </span>
          </div>

          {/* Rows */}
          {ROWS.map((r, i) => (
            <div
              key={r.feature}
              className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 sm:px-6 ${
                i !== ROWS.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <span className="text-sm text-ink">{r.feature}</span>
              <span className="flex w-24 justify-center sm:w-32">
                <Cell value={r.velora} />
              </span>
              <span className="flex w-24 justify-center sm:w-32">
                <Cell value={r.bank} />
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
