"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadSection, saveSection, Toggle, Saved } from "@/components/admin/settings-ui";
import { CardIcon, ArrowLeftIcon } from "@/components/ui/icons";

const KEY = "cards";
const DEFAULTS = { applications_open: true, default_type: "Debit", daily_limit: 5000, auto_approve: false, application_fee: 0 };
const TYPES = ["Debit", "Virtual"];

export default function CardSettingsPage() {
  const [s, setS] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { (async () => { setS({ ...DEFAULTS, ...(await loadSection(KEY, DEFAULTS)) }); setLoading(false); })(); }, []);
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError(""); setSaved(false);
    const err = await saveSection(KEY, { ...s, daily_limit: Number(s.daily_limit) || 0, application_fee: Number(s.application_fee) || 0 });
    setBusy(false);
    if (err) return setError(err);
    setSaved(true); setTimeout(() => setSaved(false), 2600);
  }

  if (loading) return <div className="card p-8 text-center text-sm text-muted">Loading settings…</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/cards" className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeftIcon size={16} /> All cards
        </Link>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Card Settings</h1>
        <p className="text-sm text-muted">Control how customers apply for and use virtual cards.</p>
      </div>

      <Saved show={saved} />
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      <form onSubmit={save} className="card space-y-5 p-6">
        <Toggle
          checked={!!s.applications_open}
          onChange={(v) => set("applications_open", v)}
          label="Accept new card applications"
          hint="When off, customers can't apply for a new card from their dashboard."
        />
        <Toggle
          checked={!!s.auto_approve}
          onChange={(v) => set("auto_approve", v)}
          label="Auto-approve applications"
          hint="Display preference — new cards still appear in the pending queue for review."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Default card type</label>
            <select value={s.default_type} onChange={(e) => set("default_type", e.target.value)} className="input">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Daily spend limit (USD)</label>
            <input type="number" min="0" step="100" value={s.daily_limit} onChange={(e) => set("daily_limit", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Application fee (USD)</label>
            <input type="number" min="0" step="0.01" value={s.application_fee} onChange={(e) => set("application_fee", e.target.value)} className="input" />
            <p className="mt-1.5 text-xs text-muted">Charged from the customer&apos;s account when they apply. 0 = free.</p>
          </div>
        </div>

        <button type="submit" disabled={busy} className="btn-primary w-full sm:w-fit">
          <CardIcon size={16} /> {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
