"use client";

import { motion } from "framer-motion";
import { ShieldIcon, BoltIcon, GlobeIcon, LockIcon } from "@/components/ui/icons";

const BADGES = [
  { icon: ShieldIcon, title: "Bank-grade security", sub: "Row-level protection" },
  { icon: BoltIcon, title: "Instant transfers", sub: "Settled in seconds" },
  { icon: GlobeIcon, title: "40+ countries", sub: "Global by default" },
  { icon: LockIcon, title: "Encrypted sessions", sub: "Private end to end" },
];

export default function TrustStrip() {
  return (
    <section className="relative border-y border-line py-8">
      <div className="container-px">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {BADGES.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon size={20} />
                </span>
                <div>
                  <div className="text-sm font-semibold text-ink">{b.title}</div>
                  <div className="text-xs text-muted">{b.sub}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
