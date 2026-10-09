"use client";

import { useState } from "react";
import Link from "next/link";
import CountrySelect from "@/components/ui/CountrySelect";
import { UserIcon, MailIcon, PhoneIcon, LockIcon, PlusIcon, CheckCircleIcon, ArrowRightIcon } from "@/components/ui/icons";

export default function CreateUserPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [startingBalance, setStartingBalance] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Email and password are required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, country, password, startingBalance }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create user");
      setCreated({ id: json.userId, email, fullName });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFullName(""); setEmail(""); setPhone(""); setCountry("");
    setPassword(""); setStartingBalance(""); setCreated(null); setError("");
  }

  if (created) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Create User</h1>
        <div className="card mt-6 p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircleIcon size={34} />
          </div>
          <h2 className="font-display text-lg font-bold text-ink">Account created</h2>
          <p className="mt-1 text-sm text-muted">
            {created.fullName || created.email} now has a Checking and Savings account and can sign in right away.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={`/admin/users/${created.id}`} className="btn-primary">
              View profile <ArrowRightIcon size={16} />
            </Link>
            <button onClick={reset} className="btn-ghost">Create another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Create User</h1>
        <p className="text-sm text-muted">Open a new customer account. They can sign in immediately — no email confirmation needed.</p>
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
          <div>
            <label className="label">Phone</label>
            <div className="relative">
              <PhoneIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 1234" className="input pl-11" />
            </div>
          </div>
          <div>
            <label className="label">Country</label>
            <CountrySelect value={country} onChange={setCountry} placeholder="Select country" />
          </div>
          <div>
            <label className="label">Temporary password *</label>
            <div className="relative">
              <LockIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="input pl-11" />
            </div>
          </div>
          <div>
            <label className="label">Opening balance (Checking)</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">USD</span>
              <input type="number" min="0" step="0.01" value={startingBalance} onChange={(e) => setStartingBalance(e.target.value)} placeholder="0.00" className="input pl-14" />
            </div>
          </div>
        </div>

        {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

        <button type="submit" disabled={busy} className="btn-primary w-full sm:w-fit">
          <PlusIcon size={16} /> {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
