"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadSection, saveSection, Toggle, Saved } from "@/components/admin/settings-ui";
import { WalletIcon, CloseIcon, PlusIcon, ArrowLeftIcon } from "@/components/ui/icons";

const KEY = "loans";
const DEFAULTS = { enabled: true, interest_rate: 5, max_amount: 50000, terms: [6, 12, 24, 36] };

export default function LoanSettingsPage() {
  const [s, setS] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [term, setTerm] = useState("");

  useEffect(() => { (async () => { setS({ ...DEFAULTS, ...(await loadSection(KEY, DEFAULTS)) }); setLoading(false); })(); }, []);
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));

  function addTerm() {
    const n = parseInt(term, 10);
    if (!n || n <= 0) return;
    if ((s.terms || []).includes(n)) { setTerm(""); return; }
    set("terms", [...(s.terms || []), n].sort((a, b) => a - b));
    setTerm("");
  }
  function removeTerm(n) { set("terms", (s.terms || []).filter((x) => x !== n)); }

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError(""); setSaved(false);
    const err = await saveSection(KEY, {
      ...s,
      interest_rate: Number(s.interest_rate) || 0,
      max_amount: Number(s.max_amount) || 0,
    });
    setBusy(false);
    if (err) return setError(err);
    setSaved(true); setTimeout(() => setSaved(false), 2600);
  }

  if (loading) return <div className="card p-8 text-center text-sm text-muted">Loading settings…</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/loans" className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeftIcon size={16} /> Loan applications
        </Link>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Loan Settings</h1>
        <p className="text-sm text-muted">Configure the demo loan product.</p>
      </div>

      <Saved show={saved} />
      {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

      <form onSubmit={save} className="card space-y-5 p-6">
        <Toggle checked={!!s.enabled} onChange={(v) => set("enabled", v)} label="Loans enabled" hint="Allow customers to apply for loans." />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Interest rate (%)</label>
            <input type="number" min="0" step="0.1" value={s.interest_rate} onChange={(e) => set("interest_rate", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Maximum amount (USD)</label>
            <input type="number" min="0" step="100" value={s.max_amount} onChange={(e) => set("max_amount", e.target.value)} className="input" />
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Available terms (months)</div>
          <div className="flex gap-2">
            <input
              type="number" min="1" value={term} onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTerm(); } }}
              placeholder="e.g. 18" className="input sm:max-w-[200px]"
            />
            <button type="button" onClick={addTerm} className="btn-ghost shrink-0 px-3"><PlusIcon size={16} /></button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(s.terms || []).map((n) => (
              <span key={n} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-ink">
                {n} mo
                <button type="button" onClick={() => removeTerm(n)} className="text-muted hover:text-danger"><CloseIcon size={13} /></button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={busy} className="btn-primary w-full sm:w-fit">
          <WalletIcon size={16} /> {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
