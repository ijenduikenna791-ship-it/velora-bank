"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Full-screen intro that plays before the landing page every load.
 * Violet starfield + animated Velora mark (orbiting spark, pulsing rings,
 * rotating conic glow) + staggered wordmark + progress sweep, then a smooth
 * scale-and-fade reveal.
 */
export default function Preloader({ onDone, minDuration = 2600 }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = Date.now();
    let raf;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / minDuration) * 100));
      setProgress(pct);
      if (elapsed < minDuration) raf = requestAnimationFrame(tick);
      else setVisible(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [minDuration]);

  const word = "VELORA".split("");

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: "rgb(10 7 16)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
        >
          {/* layered glow + stars */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(55% 45% at 50% 42%, rgb(124 58 237 / 0.38), transparent 70%)" }}
          />
          <div className="starfield pointer-events-none absolute inset-0 opacity-70" />
          <motion.div
            className="starfield pointer-events-none absolute inset-0 opacity-40"
            animate={{ backgroundPositionX: ["0px", "600px"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            className="relative flex flex-col items-center"
            exit={{ scale: 1.08, opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          >
            {/* mark + orbit + rings */}
            <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
              {/* rotating conic glow */}
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent, rgb(167 139 250 / 0.5), transparent 40%)",
                  filter: "blur(6px)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              />
              {/* pulsing rings */}
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-3 rounded-3xl border"
                  style={{ borderColor: "rgb(167 139 250 / 0.5)" }}
                  initial={{ scale: 0.6, opacity: 0.8 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
                />
              ))}
              {/* orbiting spark */}
              <motion.span
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
              >
                <span
                  className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full"
                  style={{ background: "#D946EF", boxShadow: "0 0 12px 2px rgb(217 70 239 / 0.8)" }}
                />
              </motion.span>

              <motion.div
                initial={{ scale: 0.5, rotate: -16, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 170, damping: 13 }}
              >
                <svg width="78" height="78" viewBox="0 0 64 64">
                  <defs>
                    <linearGradient id="pl-mark" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#A78BFA" />
                      <stop offset="0.55" stopColor="#7C3AED" />
                      <stop offset="1" stopColor="#D946EF" />
                    </linearGradient>
                  </defs>
                  <rect width="64" height="64" rx="16" fill="url(#pl-mark)" />
                  <path d="M20 22c0-1.1.9-2 2-2h8a10 10 0 0 1 0 20h-8a2 2 0 0 1-2-2V22z" fill="#fff" fillOpacity="0.95" />
                  <path d="M34 20h8a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2h-8a10 10 0 0 0 0-24z" fill="#fff" fillOpacity="0.55" />
                </svg>
              </motion.div>
            </div>

            {/* staggered wordmark */}
            <div className="flex items-center gap-[2px] font-display text-3xl font-extrabold tracking-[0.12em] text-white">
              {word.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.07, type: "spring", stiffness: 300, damping: 20 }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>
            <motion.p
              className="mt-2 text-[11px] tracking-[0.4em] text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              SECURE · SIMPLE · SWIFT
            </motion.p>

            {/* progress with shimmer */}
            <div className="relative mt-8 h-1 w-60 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundImage: "linear-gradient(90deg, #A78BFA, #7C3AED 55%, #D946EF)",
                }}
              />
              <motion.span
                className="absolute inset-y-0 w-24 -skew-x-12"
                style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.5), transparent)" }}
                animate={{ x: ["-6rem", "15rem"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <span className="mt-2 text-[11px] tabular-nums text-white/40">{progress}%</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
