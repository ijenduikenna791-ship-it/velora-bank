"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon } from "@/components/ui/icons";

const FAQS = [
  {
    q: "Is Velora free to use?",
    a: "Yes. The Personal plan is free and includes your Checking and Savings accounts, a virtual card, and standard transfers. Premium and Business add higher limits and extra features.",
  },
  {
    q: "How fast are transfers?",
    a: "Transfers between Velora accounts settle instantly. You'll see your balance update the moment a transfer completes, and you can download a receipt for every one.",
  },
  {
    q: "Which payment methods can I send with?",
    a: "You can send via Local transfer, Wire, PayPal, Bitcoin, Skrill, Cash App, Zelle, Revolut and Venmo — each with the right fields and a clear review step before anything moves.",
  },
  {
    q: "How is my account protected?",
    a: "Velora is built to bank-grade standards: row-level security on every table, encrypted auto-refreshing sessions, and a 4-digit transaction PIN that authorizes every payment and withdrawal. Every transfer is logged and fully traceable.",
  },
  {
    q: "Can I get a debit card?",
    a: "Yes. Apply for a virtual debit card right from your dashboard. An admin reviews the request, and once approved your card is ready to use for everyday spending.",
  },
  {
    q: "How do I get started?",
    a: "Create an account, pick your country, and your Checking and Savings accounts are ready in under a minute. From there you can send money, request withdrawals, and manage everything from one dashboard.",
  },
];

function Item({ faq, open, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-ink sm:text-base">{faq.q}</span>
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          <PlusIcon size={18} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="resources" className="relative py-20">
      <div className="container-px">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip mx-auto mb-4">FAQ</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-muted">Everything you need to know about getting started with Velora.</p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {FAQS.map((faq, i) => (
            <Item
              key={faq.q}
              faq={faq}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
