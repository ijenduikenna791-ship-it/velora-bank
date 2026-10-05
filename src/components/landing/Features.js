"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  SendIcon, ShieldIcon, BoltIcon, GlobeIcon, CardIcon, TrendingUpIcon,
} from "@/components/ui/icons";

const FEATURES = [
  { icon: SendIcon, title: "Send anywhere", body: "Local, wire, PayPal, Bitcoin and more — move money in a tap." },
  { icon: ShieldIcon, title: "Bank-grade security", body: "Row-level security, encrypted sessions and strict access controls." },
  { icon: BoltIcon, title: "Instant transfers", body: "Transfers settle instantly between Velora accounts." },
  { icon: GlobeIcon, title: "40+ countries", body: "Open an account and pick your country from a full flag list." },
  { icon: CardIcon, title: "Virtual cards", body: "Beautiful cards for everyday spending, built right in." },
  { icon: TrendingUpIcon, title: "Clear insights", body: "Track balances and activity with a clean, fast dashboard." },
];

export default function Features() {
  const { t } = useI18n();
  return (
    <section id="features" className="relative py-20">
      <div className="container-px">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip mx-auto mb-4">{t("nav.features")}</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {t("features.title")}
          </h2>
          <p className="mt-3 text-muted">{t("features.subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.06 }}
                className="card group p-6 transition hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-white">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{f.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
