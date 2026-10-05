"use client";

import { motion } from "framer-motion";
import SmartImage from "@/components/ui/SmartImage";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { ShieldIcon, LockIcon, CheckCircleIcon } from "@/components/ui/icons";

/*
  Real photography from Pexels (free to use). Swap this URL for your
  own pick from https://www.pexels.com — see README "Images".
*/
const PHOTO =
  "https://images.pexels.com/photos/8062355/pexels-photo-8062355.jpeg?auto=compress&cs=tinysrgb&w=1000";

export default function Security() {
  const { t } = useI18n();
  const points = [
    "Row-level security on every table",
    "Encrypted, auto-refreshing sessions",
    "Admin actions gated by database roles",
    "Every transfer logged and fully traceable",
  ];

  return (
    <section id="security" className="relative py-20">
      <div className="container-px grid items-center gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand/30 to-accent/20 blur-2xl" />
          <SmartImage
            src={PHOTO}
            alt="Managing finances securely"
            className="h-80 w-full rounded-3xl border border-line object-cover"
            fallbackClassName="h-80 w-full rounded-3xl border border-line"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="chip mb-4">
            <ShieldIcon size={14} className="text-brand-light" /> {t("nav.security")}
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Security built into the foundation
          </h2>
          <p className="mt-3 text-muted">
            Velora is engineered to bank-grade standards — every balance change
            runs through guarded database functions, so the UI can never move money it shouldn't.
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-ink">
                <CheckCircleIcon size={20} className="shrink-0 text-success" />
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-line bg-white/5 px-4 py-3 text-xs text-muted">
            <LockIcon size={16} className="text-brand" />
            Every transfer runs through guarded, auditable database functions.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
