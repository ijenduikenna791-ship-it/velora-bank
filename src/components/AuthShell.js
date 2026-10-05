"use client";

import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitch from "@/components/ui/LanguageSwitch";

/**
 * Shared chrome for the auth screens: starfield background, top bar with
 * the logo + language switch + theme switch, and a centered glass card.
 */
export default function AuthShell({ title, subtitle, children, footer, badge }) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgb(124 58 237 / 0.3), transparent 65%)",
        }}
      />
      <div className="starfield pointer-events-none absolute inset-0 opacity-50 dark:opacity-80" />

      <header className="container-px relative flex h-16 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageSwitch compact />
          <ThemeToggle compact />
        </div>
      </header>

      <div className="relative flex flex-1 items-center justify-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="card p-7 sm:p-9">
            {badge}
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-5 text-center text-sm text-muted">{footer}</div>}
        </motion.div>
      </div>
    </main>
  );
}
