"use client";

import { useState } from "react";
import Link from "next/link";
import { UserIcon, MailIcon, LockIcon, ShieldIcon, CheckCircleIcon, ArrowRightIcon } from "@/components/ui/icons";

export default function AddAdminPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null); // { email, promoted }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email) return setError("Email is required.");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not add administrator");
      setDone({ email, promoted: json.promoted });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFullName(""); setEmail(""); setPassword(""); setDone(null); setError("");
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Add Administrator</h1>
        <div className="card mt-6 p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircleIcon size={34} />
          </div>
          <h2 className="font-display text-lg font-bold text-ink">
            {done.promoted ? "Access granted" : "Administrator created"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {done.promoted
              ? `${done.email} has been promoted and can now open the admin console.`
              : `${done.email} now has an administrator account and can sign in right away.`}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/admin/administrators" className="btn-primary">
              View administrators <ArrowRightIcon size={16} />
            </Link>
            <button onClick={reset} className="btn-ghost">Add another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Add Administrator</h1>
        <p className="text-sm text-muted">
          Grant someone access to this admin console. If they already have a customer account, enter their email to promote them — no password needed.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card mt-6 space-y-5 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full name</label>
            <div className="relative">
              <UserIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className="input pl-11" />
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <div className="relative">
              <MailIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" className="input pl-11" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Temporary password</label>
            <div className="relative">
              <LockIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Required only for a brand-new admin" className="input pl-11" />
            </div>
            <p className="mt-1.5 text-xs text-muted">Leave blank when promoting an existing customer account.</p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-xs text-muted">
          <ShieldIcon size={16} className="mt-0.5 shrink-0 text-brand" />
          Administrators can view and manage every customer, approve requests, and credit or debit demo balances. Only add people you trust.
        </div>

        {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

        <button type="submit" disabled={busy} className="btn-primary w-full sm:w-fit">
          <ShieldIcon size={16} /> {busy ? "Adding…" : "Add administrator"}
        </button>
      </form>
    </div>
  );
}
