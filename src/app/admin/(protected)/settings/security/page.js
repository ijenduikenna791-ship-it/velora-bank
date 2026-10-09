"use client";

import { useEffect, useState } from "react";
import { loadSection, saveSection, Toggle, Saved } from "@/components/admin/settings-ui";
import { ShieldIcon, CloseIcon, PlusIcon } from "@/components/ui/icons";

const KEY = "security";
const DEFAULTS = { require_2fa: false, session_timeout_min: 30, allowed_ips: [] };

export default function SecuritySettingsPage() {
  const [s, setS] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [ip, setIp] = useState("");

  useEffect(() => { (async () => { setS({ ...DEFAULTS, ...(await loadSection(KEY, DEFAULTS)) }); setLoading(false); })(); }, []);
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));

  function addIp() {
    const v = ip.trim();
    if (!v) return;
    if ((s.allowed_ips || []).includes(v)) { setIp(""); return; }
    set("allowed_ips", [...(s.allowed_ips || []), v]);
    setIp("");
  }
  function removeIp(v) { set("allowed_ips", (s.allowed_ips || []).filter((x) => x !== v)); }

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError(""); setSaved(false);
    const err = await saveSection(KEY, { ...s, session_timeout_min: Number(s.session_timeout_min) || 0 });
    setBusy(false);
    if (err) return setError(err);
    setSaved(true); setTimeout(() => setSaved(false), 2600);
  }

  if (loading) return <div className="card p-8 text-center text-sm text-muted">Loading settings…</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Security &amp; IP</h1>
        <p className="text-sm text-muted">Verification, session and IP allow-list controls.</p>
      </div>

      <Saved show={saved} />
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      <form onSubmit={save} className="card space-y-5 p-6">
        <Toggle
          checked={!!s.require_2fa}
          onChange={(v) => set("require_2fa", v)}
          label="Require two-factor on transfers"
          hint="Customers confirm a one-time code before a transfer completes."
        />

        <div>
          <label className="label">Session timeout (minutes)</label>
          <input type="number" min="1" step="1" value={s.session_timeout_min} onChange={(e) => set("session_timeout_min", e.target.value)} className="input sm:max-w-[200px]" />
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Admin IP allow-list</div>
          <div className="flex gap-2">
            <input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addIp(); } }}
              placeholder="e.g. 203.0.113.42"
              className="input"
            />
            <button type="button" onClick={addIp} className="btn-ghost shrink-0 px-3"><PlusIcon size={16} /></button>
          </div>
          {(s.allowed_ips || []).length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {s.allowed_ips.map((v) => (
                <span key={v} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-ink">
                  {v}
                  <button type="button" onClick={() => removeIp(v)} className="text-muted hover:text-danger"><CloseIcon size={13} /></button>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted">No IPs listed — admin access isn&apos;t IP-restricted.</p>
          )}
        </div>

        <button type="submit" disabled={busy} className="btn-primary w-full sm:w-fit">
          <ShieldIcon size={16} /> {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
