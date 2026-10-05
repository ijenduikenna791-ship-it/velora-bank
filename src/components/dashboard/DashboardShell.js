"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitch from "@/components/ui/LanguageSwitch";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { initials } from "@/lib/utils";
import NotificationsBell from "@/components/dashboard/NotificationsBell";
import {
  GridIcon, SendIcon, ReceiptIcon, CardIcon, SettingsIcon, LogoutIcon,
  MenuIcon, CloseIcon, BellIcon, UsersIcon, BankIcon, ChartIcon,
  ArrowUpRightIcon, ArrowDownLeftIcon, CheckCircleIcon,
} from "@/components/ui/icons";

export default function DashboardShell({ profile, children, variant = "user" }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const userNav = [
    { href: "/dashboard", label: t("dash.overview"), icon: GridIcon },
    { href: "/dashboard/transfer", label: t("dash.transfer"), icon: SendIcon },
    { href: "/dashboard/recipients", label: t("dash.recipients"), icon: UsersIcon },
    { href: "/dashboard/withdraw", label: t("dash.withdraw"), icon: ArrowUpRightIcon },
    { href: "/dashboard/deposit", label: t("dash.deposit"), icon: ArrowDownLeftIcon },
    { href: "/dashboard/transactions", label: t("dash.transactions"), icon: ReceiptIcon },
    { href: "/dashboard/cards", label: t("dash.cards"), icon: CardIcon },
    { href: "/dashboard/settings", label: t("dash.settings"), icon: SettingsIcon },
  ];

  const adminNav = [
    { href: "/admin", label: t("admin.overview"), icon: ChartIcon },
    { href: "/admin/users", label: t("admin.users"), icon: UsersIcon },
    { href: "/admin/approvals", label: t("admin.approvals"), icon: CheckCircleIcon },
    { href: "/admin/transactions", label: t("admin.transactions"), icon: ReceiptIcon },
    { href: "/admin/send", label: t("admin.send"), icon: SendIcon },
  ];

  const nav = variant === "admin" ? adminNav : userNav;

  async function logout() {
    await supabase.auth.signOut();
    router.push(variant === "admin" ? "/admin/login" : "/login");
    router.refresh();
  }

  const isActive = (href) =>
    href === "/dashboard" || href === "/admin" ? pathname === href : pathname.startsWith(href);

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
        {variant === "admin" && (
          <span className="ml-2 rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
            Admin
          </span>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((n) => {
          const Icon = n.icon;
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                active ? "bg-brand text-white shadow-glow" : "text-muted hover:bg-white/5 hover:text-ink"
              }`}
            >
              <Icon size={19} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted transition hover:bg-danger/10 hover:text-danger"
        >
          <LogoutIcon size={19} />
          {t("dash.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-card lg:block">
        {SidebarInner}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-card lg:hidden"
            >
              {SidebarInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-surface/80 px-5 backdrop-blur-xl sm:px-8">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon size={20} />
          </button>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
              <BankIcon size={18} />
            </span>
            <span className="text-sm font-medium text-muted">{t("dash.overview")}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitch compact />
            <ThemeToggle compact />
            <NotificationsBell variant={variant} />
            <div className="flex items-center gap-2.5 rounded-full border border-line py-1 pl-1 pr-3">
              <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand to-accent text-xs font-bold text-white">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(profile?.full_name || "V")
                )}
              </span>
              <span className="hidden text-sm font-medium text-ink sm:block">
                {profile?.full_name || "Customer"}
              </span>
            </div>
          </div>
        </header>

        <main className="px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
