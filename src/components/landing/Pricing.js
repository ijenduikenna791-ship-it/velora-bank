"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircleIcon, ArrowRightIcon } from "@/components/ui/icons";

const PLANS = [
  {
    name: "Personal",
    price: "$0",
    period: "/month",
    tagline: "Everything you need for everyday money.",
    features: [
      "Checking + Savings accounts",
      "Send via Local, Wire, PayPal, Bitcoin & more",
      "One virtual debit card",
      "Instant Velora-to-Velora transfers",
      "Clean, fast dashboard",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$9",
    period: "/month",
    tagline: "For people who move money often.",
    features: [
      "Everything in Personal",
      "Higher transfer limits",
      "Priority withdrawal approvals",
      "Saved recipients & downloadable receipts",
      "Email notifications",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/month",
    tagline: "Built for teams and growing companies.",
    features: [
      "Everything in Premium",
      "Multiple team members",
      "Admin controls & approvals",
      "Full transaction exports",
      "Dedicated support",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-20">
      <div className="container-px">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip mx-auto mb-4">Pricing</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-muted">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08 }}
              className={`card relative flex flex-col p-7 ${
                plan.highlight
                  ? "border-brand shadow-glow lg:-mt-4 lg:mb-0"
                  : ""
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-glow">
                  Most popular
                </span>
              )}

              <div className="text-sm font-semibold text-ink">{plan.name}</div>
              <div className="mt-3 flex items-end gap-1">
                <span className="font-display text-4xl font-extrabold text-ink">{plan.price}</span>
                <span className="mb-1 text-sm text-muted">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{plan.tagline}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                    <CheckCircleIcon size={18} className="mt-0.5 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`mt-7 w-full ${plan.highlight ? "btn-primary" : "btn-ghost"}`}
              >
                {plan.cta}
                <ArrowRightIcon size={16} />
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Prices shown are illustrative for this demo. No real billing takes place.
        </p>
      </div>
    </section>
  );
}
