"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";
import { MailIcon, SearchIcon, SendIcon, CheckCircleIcon, UserIcon } from "@/components/ui/icons";

const TEMPLATES = [
  { label: "Welcome", subject: "Welcome to Velora Bank", message: "Hi there,\n\nWelcome to Velora Bank! Your account is ready and you can sign in anytime.\n\nIf you have any questions, just reply to this email." },
  { label: "Account update", subject: "An update on your Velora account", message: "Hi there,\n\nWe wanted to let you know about a recent update to your account." },
  { label: "Verify details", subject: "Please confirm your account details", message: "Hi there,\n\nTo keep your account secure, please take a moment to review your profile details when you next sign in." },
];

export default function EmailServicesPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, email").order("created_at", { ascending: false });
      setCustomers(data || []);
    })();
    /* eslint-disable-next-line */
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers.filter((c) => c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)).slice(0, 8);
  }, [customers, query]);

  async function send(e) {
    e.preventDefault();
    setError(""); setResult(null);
    if (!to || !subject || !message) return setError("Recipient, subject and message are all required.");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: to, subject, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not send");
      if (json.sent) {
        setResult({ ok: true, text: `Email sent to ${to}.` });
        setSubject(""); setMessage("");
      } else if (json.reason === "not-configured") {
        setResult({ ok: false, text: "Email isn't configured yet — add a RESEND_API_KEY to enable sending. Your draft is kept below." });
      } else {
        setResult({ ok: false, text: json.error || "The email service declined this message." });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Email Services</h1>
        <p className="text-sm text-muted">Send a message to a customer. Emails are delivered through Resend.</p>
      </div>

      {result && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${result.ok ? "border-success/40 bg-success/10 text-success" : "border-warn/40 bg-warn/10 text-warn"}`}>
          <CheckCircleIcon size={18} /> {result.text}
        </div>
      )}
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Compose */}
        <form onSubmit={send} className="card space-y-5 p-6 lg:col-span-2">
          <div>
            <label className="label">To</label>
            <div className="relative">
              <MailIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="customer@example.com" className="input pl-11" />
            </div>
          </div>
          <div>
            <label className="label">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" className="input" />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} placeholder="Write your message…" className="input resize-y" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Templates:</span>
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => { setSubject(t.subject); setMessage(t.message); }}
                className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:text-ink"
              >
                {t.label}
              </button>
            ))}
          </div>

          <button type="submit" disabled={busy} className="btn-primary w-full sm:w-fit">
            <SendIcon size={16} /> {busy ? "Sending…" : "Send email"}
          </button>
        </form>

        {/* Recipient picker */}
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <UserIcon size={16} className="text-brand" /> Customers
          </div>
          <div className="relative mb-3">
            <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="input pl-9 text-sm" />
          </div>
          <div className="space-y-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted">No customers found.</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTo(c.email || "")}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-white/5 ${to === c.email ? "bg-brand/10" : ""}`}
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-[10px] font-bold text-white">
                    {initials(c.full_name || "U")}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink">{c.full_name || "Customer"}</span>
                    <span className="block truncate text-xs text-muted">{c.email}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
