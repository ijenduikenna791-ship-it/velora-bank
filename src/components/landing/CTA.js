"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { ArrowRightIcon, MailIcon, CheckCircleIcon } from "@/components/ui/icons";

export function CTA() {
  const { t } = useI18n();
  return (
    <section id="get-started" className="relative py-20">
      <div className="container-px">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-line p-10 text-center sm:p-16"
          style={{
            background:
              "radial-gradient(80% 120% at 50% 0%, rgb(124 58 237 / 0.35), transparent 60%)",
          }}
        >
          <div className="starfield pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">{t("cta.subtitle")}</p>
            <Link href="/register" className="btn-primary mx-auto mt-7 w-fit">
              {t("cta.button")} <ArrowRightIcon size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function subscribe(e) {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  }

  const cols = [
    { title: t("nav.features"), links: ["Accounts", "Cards", "Transfers", "Insights"] },
    { title: t("nav.resources"), links: ["Help center", "Developers", "Status", "Blog"] },
    { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
  ];
  return (
    <footer className="border-t border-line py-12">
      <div className="container-px">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-line bg-white/5 p-7 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-xl font-bold text-ink">Stay in the loop</h3>
            <p className="mt-1 text-sm text-muted">Product updates and money tips — no spam, unsubscribe anytime.</p>
          </div>
          {subscribed ? (
            <div className="inline-flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircleIcon size={18} /> Thanks — you&apos;re subscribed!
            </div>
          ) : (
            <form onSubmit={subscribe} className="flex w-full gap-3 sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <MailIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-11"
                />
              </div>
              <button type="submit" className="btn-primary shrink-0">
                Subscribe <ArrowRightIcon size={16} />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="container-px mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Velora is modern banking built around your world — simple, secure and global.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold text-ink">{c.title}</h4>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-muted transition hover:text-ink">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-px mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row">
        <span>© {new Date().getFullYear()} Velora Bank. All rights reserved.</span>
        <span>Secure · Private · Global</span>
      </div>
    </footer>
  );
}
