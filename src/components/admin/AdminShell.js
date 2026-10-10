"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitch from "@/components/ui/LanguageSwitch";
import NotificationsBell from "@/components/dashboard/NotificationsBell";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";
import {
  GridIcon, UsersIcon, UserIcon, PlusIcon, CheckCircleIcon, SendIcon,
  ArrowDownLeftIcon, WalletIcon, CardIcon, MailIcon, ShieldIcon, SettingsIcon,
  ChevronDownIcon, LogoutIcon, MenuIcon, CloseIcon,
} from "@/components/ui/icons";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: GridIcon },
  { href: "/admin/users", label: "Manage Users", icon: UsersIcon },
  { href: "/admin/users/new", label: "Create User", icon: UserIcon },
  { href: "/admin/applications", label: "User Applications", icon: CheckCircleIcon },
  { href: "/admin/transactions", label: "Transfer Transactions", icon: SendIcon },
  { href: "/admin/deposits", label: "Deposits", icon: ArrowDownLeftIcon },
  {
    label: "Loans", icon: WalletIcon, children: [
      { href: "/admin/loans", label: "Applications" },
      { href: "/admin/loans/settings", label: "Loan Settings" },
    ],
  },
  {
    label: "Virtual Cards", icon: CardIcon, children: [
      { href: "/admin/cards", label: "All Cards" },
      { href: "/admin/cards/pending", label: "Pending Applications" },
      { href: "/admin/cards/settings", label: "Card Settings" },
    ],
  },
  { href: "/admin/email", label: "Email Services", icon: MailIcon },
  {
    label: "Administrators", icon: ShieldIcon, children: [
      { href: "/admin/administrators", label: "All Admins" },
      { href: "/admin/administrators/new", label: "Add Admin" },
    ],
  },
  {
    label: "Settings", icon: SettingsIcon, children: [
      { href: "/admin/settings", label: "App Settings" },
      { href: "/admin/settings/payment", label: "Payment" },
      { href: "/admin/settings/appearance", label: "Appearance" },
      { href: "/admin/settings/security", label: "Security & IP" },
    ],
  },
];

export default function AdminShell({ profile, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false); // mobile drawer

  const isActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");
  const groupActive = (item) => item.children?.some((c) => isActive(c.href));

  // Auto-expand the submenu that contains the active route.
  const [expanded, setExpanded] = useState(() => {
    const o = {};
    NAV.forEach((it) => {
      if (it.children && it.children.some((c) => isActive(c.href))) o[it.label] = true;
    });
    return o;
  });
  const toggle = (label) => setExpanded((e) => ({ ...e, [label]: !e[label] }));

  async function logout() {
    await supabase.auth.signOut();
    router.push("/vault-7f3a2c9b");
    router.refresh();
  }

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-4">
        <Logo />
        <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
          Admin
        </span>
      </div>

      <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {NAV.map((item) => {
          const Icon = item.icon;
          if (item.children) {
            const isOpen = expanded[item.label] || groupActive(item);
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    groupActive(item) ? "text-ink" : "text-muted hover:bg-white/5 hover:text-ink"
                  }`}
                >
                  <Icon size={19} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDownIcon size={15} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 space-y-1 pl-6">
                        {item.children.map((c) => {
                          const active = isActive(c.href);
                          return (
                            <Link
                              key={c.href}
                              href={c.href}
                              onClick={() => setOpen(false)}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                                active ? "bg-brand/10 font-medium text-brand" : "text-muted hover:bg-white/5 hover:text-ink"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-brand" : "bg-muted/50"}`} />
                              {c.label}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                active ? "bg-brand text-white shadow-glow" : "text-muted hover:bg-white/5 hover:text-ink"
              }`}
            >
              <Icon size={19} />
              {item.label}
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
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-surface">
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
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-card lg:hidden"
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
              <ShieldIcon size={18} />
            </span>
            <span className="text-sm font-medium text-muted">Admin console</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitch compact />
            <ThemeToggle compact />
            <NotificationsBell variant="admin" />
            <div className="flex items-center gap-2.5 rounded-full border border-line py-1 pl-1 pr-3">
              <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand to-accent text-xs font-bold text-white">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(profile?.full_name || "Admin")
                )}
              </span>
              <span className="hidden text-sm font-medium text-ink sm:block">
                {profile?.full_name || "Administrator"}
              </span>
            </div>
          </div>
        </header>

        <main className="px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
