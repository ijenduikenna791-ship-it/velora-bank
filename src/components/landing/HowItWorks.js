"use client";

import { motion } from "framer-motion";
import { UserIcon, WalletIcon, SendIcon } from "@/components/ui/icons";

const STEPS = [
  { icon: UserIcon, title: "Create your account", body: "Sign up in under a minute and pick your country from a full flag list." },
  { icon: WalletIcon, title: "Fund your account", body: "Add funds in a tap and you're ready to send, save and spend right away." },
  { icon: SendIcon, title: "Send worldwide", body: "Move money via local, wire, PayPal, Bitcoin and more — instantly." },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20">
      <div className="container-px">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip mx-auto mb-4">How it works</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Up and running in three steps
          </h2>
          <p className="mt-3 text-muted">From sign-up to your first transfer in minutes.</p>
        </div>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-line to-transparent md:block" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative text-center"
              >
                <div className="relative mx-auto mb-5 inline-flex h-20 w-20 items-center justify-center">
                  <span className="absolute inset-0 rounded-2xl bg-brand/10" />
                  <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-brand shadow-soft ring-1 ring-line">
                    <Icon size={26} />
                  </span>
                  <span className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{s.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
