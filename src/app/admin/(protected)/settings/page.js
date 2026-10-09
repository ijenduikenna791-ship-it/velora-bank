"use client";

import { useEffect, useState } from "react";
import { loadSection, saveSection, Toggle, Saved } from "@/components/admin/settings-ui";
import { SettingsIcon } from "@/components/ui/icons";

const KEY = "app";
const DEFAULTS = { bank_name: "Velora Bank", support_email: "support@velora.demo", maintenance_mode: false, min_transfer: 1, max_transfer: 1000000 };

export default function AppSettingsPage() {
  const [s, setS] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { (async () => { setS(await loadSection(KEY, DEFAULTS)); setLoading(false); })(); }, []);
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError(""); setSaved(false);
    const err = await saveSection(KEY, {
      ...s,
      min_transfer: Number(s.min_transfer) || 0,
      max_transfer: Number(s.max_transfer) || 0,
    });
    setBusy(false);
    if (err) return setError(err);
    setSaved(true); setTimeout(() => setSaved(false), 2600);
  }

  if (loading) return <div className="card p-8 text-center text-sm text-muted">Loading settings…</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">App Settings</h1>
        <p className="text-sm text-muted">Core configuration for your Velora demo.</p>
      </div>

      <Saved show={saved} />
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      <form onSubmit={save} className="card space-y-5 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Bank name</label>
            <input value={s.bank_name} onChange={(e) => set("bank_name", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Support email</label>
            <input type="email" value={s.support_email} onChange={(e) => set("support_email", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Minimum transfer (USD)</label>
            <input type="number" min="0" step="1" value={s.min_transfer} onChange={(e) => set("min_transfer", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Maximum transfer (USD)</label>
            <input type="number" min="0" step="1" value={s.max_transfer} onChange={(e) => set("max_transfer", e.target.value)} className="input" />
          </div>
        </div>

        <Toggle
          checked={!!s.maintenance_mode}
          onChange={(v) => set("maintenance_mode", v)}
          label="Maintenance mode"
          hint="Show a maintenance notice to customers (demo flag)."
        />

        <button type="submit" disabled={busy} className="btn-primary w-full sm:w-fit">
          <SettingsIcon size={16} /> {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
