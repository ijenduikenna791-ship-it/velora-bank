"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import {
  BellIcon, ArrowDownLeftIcon, ArrowUpRightIcon, CardIcon, CheckCircleIcon, CloseIcon,
} from "@/components/ui/icons";

function ago(ts) {
  if (!ts) return "";
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); return `${d}d ago`;
}

export default function NotificationsBell({ variant = "user" }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function load() {
    try {
      if (variant === "admin") {
        const [{ count: c }, { count: w }, { count: d }] = await Promise.all([
          supabase.from("cards").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("deposits").select("*", { count: "exact", head: true }).eq("status", "pending"),
        ]);
        const out = [];
        if (c) out.push({ id: "c", icon: CardIcon, title: `${c} card application${c > 1 ? "s" : ""} to review`, href: "/admin/approvals" });
        if (w) out.push({ id: "w", icon: ArrowUpRightIcon, title: `${w} withdrawal${w > 1 ? "s" : ""} to review`, href: "/admin/approvals" });
        if (d) out.push({ id: "d", icon: ArrowDownLeftIcon, title: `${d} deposit${d > 1 ? "s" : ""} to review`, href: "/admin/approvals" });
        setItems(out);
        return;
      }

      // customer: build from recent activity + request statuses
      const { data: { user } } = await supabase.auth.getUser();
      const ownAccts = (await supabase.from("accounts").select("id").eq("user_id", user.id)).data || [];
      const ownIds = ownAccts.map((a) => a.id);

      const [{ data: txns }, { data: wds }, { data: deps }, { data: cards }] = await Promise.all([
        supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("withdrawals").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("deposits").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("cards").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      const out = [];
      (txns || []).forEach((t) => {
        const incoming = ownIds.includes(t.to_account) && !ownIds.includes(t.from_account);
        out.push({
          id: "t" + t.id,
          icon: incoming ? ArrowDownLeftIcon : ArrowUpRightIcon,
          title: `${incoming ? "Received" : "Sent"} ${formatCurrency(t.amount, t.currency)}`,
          sub: (t.recipient_label || t.type) + "",
          time: t.created_at,
          href: "/dashboard/transactions",
        });
      });
      (wds || []).filter((w) => w.status !== "pending").forEach((w) => out.push({
        id: "w" + w.id, icon: w.status === "approved" ? CheckCircleIcon : CloseIcon,
        title: `Withdrawal ${w.status}`, sub: formatCurrency(w.amount, w.currency), time: w.processed_at || w.created_at, href: "/dashboard/withdraw",
      }));
      (deps || []).filter((d) => d.status !== "pending").forEach((d) => out.push({
        id: "d" + d.id, icon: d.status === "approved" ? CheckCircleIcon : CloseIcon,
        title: `Deposit ${d.status === "approved" ? "credited" : "rejected"}`, sub: formatCurrency(d.amount, d.currency), time: d.processed_at || d.created_at, href: "/dashboard/deposit",
      }));
      (cards || []).filter((c) => c.status !== "pending").forEach((c) => out.push({
        id: "cd" + c.id, icon: CardIcon, title: `Card ${c.status}`, sub: "Debit card", time: c.reviewed_at || c.created_at, href: "/dashboard/cards",
      }));

      out.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
      setItems(out.slice(0, 8));
    } catch {
      setItems([]);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open) load(); }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:bg-white/5"
        aria-label="Notifications"
      >
        <BellIcon size={18} />
        {items.length > 0 && <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-accent" />}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-sm font-semibold text-ink">Notifications</span>
            <span className="text-xs text-muted">{items.length}</span>
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted">You&apos;re all caught up.</div>
          ) : (
            <ul className="max-h-96 divide-y divide-line overflow-y-auto">
              {items.map((n) => {
                const Icon = n.icon || BellIcon;
                return (
                  <li key={n.id}>
                    <Link href={n.href || "#"} onClick={() => setOpen(false)} className="flex items-start gap-3 px-4 py-3 transition hover:bg-white/5">
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{n.title}</span>
                        {n.sub && <span className="block truncate text-xs text-muted">{n.sub}</span>}
                      </span>
                      {n.time && <span className="shrink-0 text-[11px] text-muted">{ago(n.time)}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
