"use client";

import { useEffect, useState } from "react";
import { loadSection, saveSection, Toggle, Saved } from "@/components/admin/settings-ui";
import { SettingsIcon } from "@/components/ui/icons";

const KEY = "appearance";
const DEFAULTS = { brand: "velora", default_theme: "system", show_converter: true };
const THEMES = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

export default function AppearanceSettingsPage() {
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
    const err = await saveSection(KEY, s);
    setBusy(false);
    if (err) return setError(err);
    setSaved(true); setTimeout(() => setSaved(false), 2600);
  }

  if (loading) return <div className="card p-8 text-center text-sm text-muted">Loading settings…</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Appearance Settings</h1>
        <p className="text-sm text-muted">Branding and display preferences.</p>
      </div>

      <Saved show={saved} />
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      <form onSubmit={save} className="card space-y-5 p-6">
        <div>
          <label className="label">Brand name</label>
          <input value={s.brand} onChange={(e) => set("brand", e.target.value)} className="input" />
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Default theme</div>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => set("default_theme", t.id)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  s.default_theme === t.id ? "border-brand bg-brand/10 text-brand" : "border-line text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Toggle
          checked={!!s.show_converter}
          onChange={(v) => set("show_converter", v)}
          label="Show currency converter"
          hint="Display the FX converter on the landing page."
        />

        <button type="submit" disabled={busy} className="btn-primary w-full sm:w-fit">
          <SettingsIcon size={16} /> {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
