"use client";

import { useEffect, useState } from "react";
import { loadSection, saveSection, Toggle, Saved } from "@/components/admin/settings-ui";
import { SettingsIcon } from "@/components/ui/icons";

const KEY = "payment";
const CHANNELS = [
  { id: "local", label: "Local transfer" },
  { id: "wire", label: "Wire transfer" },
  { id: "paypal", label: "PayPal" },
  { id: "bitcoin", label: "Bitcoin" },
  { id: "zelle", label: "Zelle" },
  { id: "cashapp", label: "Cash App" },
];
const DEFAULTS = {
  channels: { local: true, wire: true, paypal: true, bitcoin: true, zelle: true, cashapp: true },
  wire_fee: 15,
  bitcoin_fee_pct: 1,
};

export default function PaymentSettingsPage() {
  const [s, setS] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { (async () => { setS({ ...DEFAULTS, ...(await loadSection(KEY, DEFAULTS)) }); setLoading(false); })(); }, []);
  const setChannel = (id, v) => setS((p) => ({ ...p, channels: { ...p.channels, [id]: v } }));

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError(""); setSaved(false);
    const err = await saveSection(KEY, {
      ...s,
      wire_fee: Number(s.wire_fee) || 0,
      bitcoin_fee_pct: Number(s.bitcoin_fee_pct) || 0,
    });
    setBusy(false);
    if (err) return setError(err);
    setSaved(true); setTimeout(() => setSaved(false), 2600);
  }

  if (loading) return <div className="card p-8 text-center text-sm text-muted">Loading settings…</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Payment Settings</h1>
        <p className="text-sm text-muted">Enable transfer channels and set demo fees.</p>
      </div>

      <Saved show={saved} />
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      <form onSubmit={save} className="card space-y-5 p-6">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Transfer channels</div>
          <div className="space-y-2">
            {CHANNELS.map((c) => (
              <Toggle
                key={c.id}
                checked={!!s.channels?.[c.id]}
                onChange={(v) => setChannel(c.id, v)}
                label={c.label}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Wire fee (USD)</label>
            <input type="number" min="0" step="0.01" value={s.wire_fee} onChange={(e) => setS((p) => ({ ...p, wire_fee: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Bitcoin fee (%)</label>
            <input type="number" min="0" step="0.1" value={s.bitcoin_fee_pct} onChange={(e) => setS((p) => ({ ...p, bitcoin_fee_pct: e.target.value }))} className="input" />
          </div>
        </div>

        <button type="submit" disabled={busy} className="btn-primary w-full sm:w-fit">
          <SettingsIcon size={16} /> {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
