"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SmartImage from "@/components/ui/SmartImage";
import { CheckCircleIcon, ArrowRightIcon } from "@/components/ui/icons";

/* Real banking photography from Pexels (free to use). Swap IDs in README. */
const PHONE_PHOTO =
  "https://images.pexels.com/photos/7534791/pexels-photo-7534791.jpeg?auto=compress&cs=tinysrgb&w=1000";

const POINTS = [
  "Send money across 9 methods — local, wire, PayPal, Bitcoin and more",
  "Track every transfer with instant confirmations",
  "Manage virtual cards and balances in one place",
  "Switch language and theme anytime, on any device",
];

export default function AppShowcase() {
  return (
    <section className="relative overflow-hidden py-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 50% at 80% 30%, rgb(217 70 239 / 0.14), transparent 70%)" }}
      />
      <div className="container-px relative grid items-center gap-12 lg:grid-cols-2">
        {/* Phone visual */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-brand/40 via-accent/20 to-transparent blur-3xl" />
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto aspect-[9/16] w-72 overflow-hidden rounded-[2.5rem] border-[6px] border-line bg-card shadow-glow"
          >
            <SmartImage
              src={PHONE_PHOTO}
              alt="Managing money on the Velora mobile app"
              className="h-full w-full object-cover"
              fallbackClassName="h-full w-full"
            />
            {/* floating balance chip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="glass absolute left-4 top-5 rounded-2xl px-4 py-3 text-white"
            >
              <div className="text-[10px] uppercase tracking-widest text-white/70">Balance</div>
              <div className="font-display text-lg font-extrabold">$24,580.00</div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="chip mb-4">Your money, in your pocket</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            A full bank, beautifully simple
          </h2>
          <p className="mt-3 text-muted">
            Everything Velora does on the web works just as smoothly on mobile — open an account,
            move money and watch it land, all in a few taps.
          </p>
          <ul className="mt-6 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-ink">
                <CheckCircleIcon size={20} className="mt-0.5 shrink-0 text-success" />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/register" className="btn-primary mt-7 w-fit">
            Open an account <ArrowRightIcon size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
