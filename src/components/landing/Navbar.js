"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitch from "@/components/ui/LanguageSwitch";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#features", label: t("nav.features") },
    { href: "#security", label: t("nav.security") },
    { href: "#resources", label: t("nav.resources") },
  ];

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? "border-b border-line bg-surface/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="container-px flex h-16 items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-muted transition hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitch compact />
          <ThemeToggle compact />
          <Link href="/login" className="text-sm font-medium text-muted transition hover:text-ink">
            {t("nav.login")}
          </Link>
          <Link href="/register" className="btn-primary px-4 py-2 text-sm">
            {t("nav.signup")}
          </Link>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-surface/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1 text-sm text-muted">
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-2">
              <LanguageSwitch />
              <ThemeToggle compact />
            </div>
            <div className="mt-2 flex gap-3">
              <Link href="/login" className="btn-ghost flex-1">{t("nav.login")}</Link>
              <Link href="/register" className="btn-primary flex-1">{t("nav.signup")}</Link>
            </div>
          </div>
        </div>
      )}
    </motion.header>
  );
}
