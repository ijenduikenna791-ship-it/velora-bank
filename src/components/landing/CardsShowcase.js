"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SmartImage from "@/components/ui/SmartImage";
import { CardIcon, SparklesIcon, ArrowRightIcon } from "@/components/ui/icons";

const CARDS_PHOTO =
  "https://images.pexels.com/photos/11363562/pexels-photo-11363562.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default function CardsShowcase() {
  return (
    <section className="relative py-20">
      <div className="container-px grid items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="chip mb-4">
            <CardIcon size={14} className="text-brand-light" /> Velora Cards
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Cards designed for the way you spend
          </h2>
          <p className="mt-3 text-muted">
            Every Velora account comes with beautiful virtual cards. Track balances, freeze and
            unfreeze in a tap, and keep spending organised — all in one place, all yours to control.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { title: "Virtual by default", body: "Instantly issued, ready to use." },
              { title: "Real-time balance", body: "See every change as it happens." },
              { title: "Multi-currency ready", body: "Built for a global audience." },
              { title: "Clean controls", body: "Freeze, rename, review — fast." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <SparklesIcon size={16} className="text-brand" /> {f.title}
                </div>
                <p className="mt-1 text-xs text-muted">{f.body}</p>
              </div>
            ))}
          </div>

          <Link href="/register" className="btn-primary mt-7 w-fit">
            Get your card <ArrowRightIcon size={16} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-accent/30 via-brand/20 to-transparent blur-3xl" />
          <SmartImage
            src={CARDS_PHOTO}
            alt="Velora payment cards"
            className="h-80 w-full rounded-3xl border border-line object-cover shadow-soft"
            fallbackClassName="h-80 w-full rounded-3xl border border-line"
          />
          {/* floating virtual card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-4 w-56 overflow-hidden rounded-2xl p-5 text-white shadow-glow sm:-left-8"
            style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand-light)), rgb(var(--brand)) 55%, rgb(var(--accent)))" }}
          >
            <div className="starfield pointer-events-none absolute inset-0 opacity-25" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="h-6 w-8 rounded bg-white/25" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Velora</span>
              </div>
              <div className="mt-6 font-mono text-sm tracking-widest">•••• 4921</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
