"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { CHANNELS } from "@/lib/utils";
import { BRAND_CHANNEL_ICONS } from "@/components/ui/brand-icons";
import { PlusIcon, CloseIcon, CheckCircleIcon } from "@/components/ui/icons";

// The main destination field label/placeholder per channel.
const DETAIL_META = {
  local:   { label: "Account number", placeholder: "0123456789" },
  wire:    { label: "IBAN / Account", placeholder: "DE89 3704 0044 0532 0130 00" },
  paypal:  { label: "PayPal email", placeholder: "jane@example.com" },
  bitcoin: { label: "Wallet address", placeholder: "bc1q…" },
  skrill:  { label: "Skrill email", placeholder: "jane@example.com" },
  cashapp: { label: "$Cashtag", placeholder: "$janedoe" },
  zelle:   { label: "Email or phone", placeholder: "jane@example.com / +1…" },
  revolut: { label: "Revtag or phone", placeholder: "@janedoe" },
  venmo:   { label: "Venmo @username", placeholder: "@jane-doe" },
};

export default function RecipientsPage() {
  const { t } = useI18n();
  const supabase = createClient();

  const [userId, setUserId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [label, setLabel] = useState("");
  const [channel, setChannel] = useState("local");
  const [recipientName, setRecipientName] = useState("");
  const [detail, setDetail] = useState("");

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
    const { data } = await supabase
      .from("beneficiaries")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addRecipient(e) {
    e.preventDefault();
    setError("");
    if (!label.trim()) return setError("Give this recipient a name/label.");
    if (!detail.trim()) return setError(`${DETAIL_META[channel].label} is required.`);
    setAdding(true);
    const { error } = await supabase.from("beneficiaries").insert({
      user_id: userId,
      label: label.trim(),
      channel,
      details: { recipientName: recipientName.trim() || label.trim(), detail: detail.trim() },
    });
    setAdding(false);
    if (error) return setError(error.message);
    setLabel(""); setRecipientName(""); setDetail(""); setChannel("local");
    setToast("Recipient saved");
    setTimeout(() => setToast(""), 2200);
    load();
  }

  async function remove(id) {
    await supabase.from("beneficiaries").delete().eq("id", id);
    load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Saved recipients</h1>
        <p className="text-sm text-muted">Save people you send to often, then pick them in one tap on Send Money.</p>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircleIcon size={18} /> {toast}
        </div>
      )}

      {/* Add form */}
      <form onSubmit={addRecipient} className="card space-y-4 p-6">
        <div className="text-sm font-semibold text-ink">Add a recipient</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Label</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Mum, Landlord, John" className="input" />
          </div>
          <div>
            <label className="label">Method</label>
            <select value={channel} onChange={(e) => { setChannel(e.target.value); setDetail(""); }} className="input">
              {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Recipient name (optional)</label>
            <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Jane Doe" className="input" />
          </div>
          <div>
            <label className="label">{DETAIL_META[channel].label}</label>
            <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={DETAIL_META[channel].placeholder} className="input" />
          </div>
        </div>
        {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}
        <button type="submit" disabled={adding} className="btn-primary w-fit">
          <PlusIcon size={16} /> {adding ? "Saving…" : "Save recipient"}
        </button>
      </form>

      {/* List */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Your recipients</h3>
        {loading ? (
          <div className="card p-8 text-center text-sm text-muted">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="card p-8 text-center text-sm text-muted">No saved recipients yet.</div>
        ) : (
          <div className="card divide-y divide-line overflow-hidden">
            {rows.map((r) => {
              const Brand = BRAND_CHANNEL_ICONS[r.channel];
              const ch = CHANNELS.find((c) => c.id === r.channel);
              return (
                <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center">
                    {Brand ? <Brand size={32} /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink">{r.label}</div>
                    <div className="truncate text-xs text-muted">
                      {ch?.label} · {r.details?.detail}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(r.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition hover:border-danger/40 hover:text-danger"
                    aria-label="Delete recipient"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
