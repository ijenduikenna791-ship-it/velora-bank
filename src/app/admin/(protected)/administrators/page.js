"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { formatDate, initials } from "@/lib/utils";
import { flagUrl, findCountry } from "@/lib/countries";
import { ShieldIcon, PlusIcon, CheckCircleIcon, CloseIcon } from "@/components/ui/icons";

export default function AdministratorsPage() {
  const supabase = createClient();
  const [admins, setAdmins] = useState([]);
  const [meId, setMeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null); // admin to revoke
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: { user } }, { data: rows }] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("profiles")
        .select("id, full_name, email, country, role, created_at")
        .eq("role", "admin")
        .order("created_at", { ascending: true }),
    ]);
    setMeId(user?.id || null);
    setAdmins(rows || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function flash(m) { setToast(m); setTimeout(() => setToast(""), 2600); }

  async function revoke(a) {
    setBusy(true); setError("");
    const { error } = await supabase.from("profiles").update({ role: "user" }).eq("id", a.id);
    setBusy(false); setConfirm(null);
    if (error) return setError(error.message);
    flash(`${a.full_name || a.email} is no longer an administrator`);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Administrators</h1>
          <p className="text-sm text-muted">People with full access to this admin console.</p>
        </div>
        <Link href="/admin/administrators/new" className="btn-primary w-fit">
          <PlusIcon size={16} /> Add admin
        </Link>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      {loading ? (
        <div className="card p-8 text-center text-sm text-muted">Loading administrators…</div>
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {admins.map((a) => {
            const c = findCountry(a.country);
            const isMe = a.id === meId;
            const isLast = admins.length === 1;
            return (
              <div key={a.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-xs font-bold text-white">
                  {initials(a.full_name || "A")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate text-sm font-medium text-ink">
                    {a.full_name || "Administrator"}
                    {c && <Image src={flagUrl(c.code)} alt="" width={18} height={13} className="rounded-[2px]" unoptimized />}
                    {isMe && <span className="rounded-md bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand">You</span>}
                  </div>
                  <div className="truncate text-xs text-muted">{a.email} · added {formatDate(a.created_at)}</div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
                  <ShieldIcon size={12} /> Admin
                </span>
                <button
                  onClick={() => setConfirm(a)}
                  disabled={isMe || isLast}
                  title={isMe ? "You can't revoke your own access" : isLast ? "At least one admin is required" : "Revoke admin access"}
                  className="btn-ghost shrink-0 px-3 py-1.5 text-xs text-danger disabled:opacity-40"
                >
                  Revoke
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Revoke confirm */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5" onClick={() => setConfirm(null)}>
          <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Revoke admin access</h3>
              <button onClick={() => setConfirm(null)} className="text-muted hover:text-ink"><CloseIcon size={18} /></button>
            </div>
            <p className="mt-2 text-sm text-muted">
              {confirm.full_name || confirm.email} will lose access to the admin console and become a regular customer. Their account and data stay intact.
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => revoke(confirm)} disabled={busy} className="btn-primary flex-1">{busy ? "Revoking…" : "Revoke"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
