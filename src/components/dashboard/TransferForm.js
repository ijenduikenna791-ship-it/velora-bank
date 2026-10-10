"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { CHANNELS, formatCurrency, maskAccount } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { FIELDS } from "@/lib/transfer-fields";
import { ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon, CopyIcon, LockIcon, DownloadIcon, UserIcon } from "@/components/ui/icons";
import { BRAND_CHANNEL_ICONS } from "@/components/ui/brand-icons";
import PinGate from "@/components/dashboard/PinGate";

// The destination field each saved recipient prefills, per channel.
const PRIMARY_FIELD = {
  local: "accountNumber",
  wire: "iban",
  paypal: "email",
  bitcoin: "wallet",
  skrill: "email",
  cashapp: "cashtag",
  zelle: "handle",
  revolut: "revtag",
  venmo: "username",
};

function printReceipt(txn, fromLabel) {
  const w = window.open("", "_blank", "width=460,height=720");
  if (!w) return;
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: txn.currency || "USD" }).format(txn.amount || 0);
  const when = new Date(txn.created_at || Date.now()).toLocaleString();
  const row = (k, v) => v ? `<tr><td style="color:#8a8a99;padding:7px 0">${k}</td><td style="text-align:right;font-weight:600;color:#15131c">${v}</td></tr>` : "";
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Velora receipt ${txn.reference}</title>
  <style>
    *{box-sizing:border-box;font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,sans-serif}
    body{margin:0;background:#f4f3f8;padding:28px;color:#15131c}
    .card{max-width:400px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.08)}
    .head{background:linear-gradient(135deg,#A78BFA,#7C3AED 55%,#D946EF);color:#fff;padding:26px 24px}
    .brand{font-weight:800;font-size:20px;letter-spacing:.3px}
    .amt{font-size:34px;font-weight:800;margin-top:14px}
    .sub{opacity:.85;font-size:12px;margin-top:2px}
    .body{padding:20px 24px}
    table{width:100%;border-collapse:collapse;font-size:14px}
    .foot{padding:16px 24px;border-top:1px solid #eee;color:#8a8a99;font-size:11px;text-align:center}
    .ok{display:inline-block;margin-top:10px;background:rgba(255,255,255,.18);padding:3px 10px;border-radius:999px;font-size:11px;text-transform:capitalize}
  </style></head><body>
    <div class="card">
      <div class="head">
        <div class="brand">Velora</div>
        <div class="amt">${money}</div>
        <div class="sub">Payment receipt</div>
        <span class="ok">${txn.status || "completed"}</span>
      </div>
      <div class="body"><table>
        ${row("Reference", txn.reference)}
        ${row("Date", when)}
        ${row("Method", (txn.type || "").toUpperCase())}
        ${row("From", fromLabel)}
        ${row("Recipient", txn.recipient_name)}
        ${row("To", txn.recipient_label)}
        ${row("Note", txn.note)}
      </table></div>
      <div class="foot">Velora Bank · Keep this receipt for your records.</div>
    </div>
    <script>setTimeout(function(){window.print()},350)</script>
  </body></html>`);
  w.document.close();
}

/**
 * Reusable Send Money form with channel tabs + review + confirmation.
 * scope="own"  → only the signed-in user's accounts (customer dashboard)
 * scope="all"  → every customer account (admin dashboard)
 */
export default function TransferForm({ scope = "own", backHref = "/dashboard" }) {
  const { t } = useI18n();
  const supabase = createClient();
  const isAdmin = scope === "all";

  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [fromAccount, setFromAccount] = useState("");
  const [channel, setChannel] = useState("local");
  const [values, setValues] = useState({});
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [limits, setLimits] = useState({ min_transfer: 0, max_transfer: 0 });
  const [enabledChannels, setEnabledChannels] = useState(null); // null = not loaded yet (show all)
  const [require2fa, setRequire2fa] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpInfo, setOtpInfo] = useState(null); // { demo?, code?, to?, error? }
  const [otpBusy, setOtpBusy] = useState(false);

  async function loadAccounts() {
    let q = supabase
      .from("accounts")
      .select(isAdmin ? "id, account_number, account_type, currency, balance, profiles(full_name)" : "id, account_number, account_type, currency, balance")
      .eq("is_demo_pool", false)
      .order("created_at", { ascending: true });
    const { data } = await q;
    setAccounts(data || []);
    if (data?.[0] && !fromAccount) setFromAccount(data[0].id);
  }

  async function loadBeneficiaries() {
    if (isAdmin) return; // saved recipients are a customer feature
    const { data } = await supabase
      .from("beneficiaries")
      .select("*")
      .order("created_at", { ascending: false });
    setBeneficiaries(data || []);
  }

  useEffect(() => {
    loadAccounts();
    loadBeneficiaries();
    // Customer transfers respect the admin's payment + limit settings.
    if (!isAdmin) {
      getSettings("payment", { channels: {} }).then((s) => setEnabledChannels(s.channels || {}));
      getSettings("app", { min_transfer: 0, max_transfer: 0 }).then((s) =>
        setLimits({ min_transfer: Number(s.min_transfer) || 0, max_transfer: Number(s.max_transfer) || 0 })
      );
      getSettings("security", { require_2fa: false }).then((s) => setRequire2fa(s.require_2fa === true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A channel is shown unless the admin explicitly disabled it.
  const channelList = CHANNELS.filter((c) => !enabledChannels || enabledChannels[c.id] !== false);

  // If the active channel got disabled, fall back to the first available one.
  useEffect(() => {
    if (enabledChannels && !channelList.some((c) => c.id === channel) && channelList[0]) {
      switchChannel(channelList[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledChannels]);

  const savedForChannel = beneficiaries.filter((b) => b.channel === channel);

  function applyBeneficiary(id) {
    const b = beneficiaries.find((x) => x.id === id);
    if (!b) return;
    const field = PRIMARY_FIELD[channel];
    setValues({
      recipientName: b.details?.recipientName || b.label || "",
      ...(field ? { [field]: b.details?.detail || "" } : {}),
    });
  }

  const active = accounts.find((a) => a.id === fromAccount);
  const config = FIELDS[channel];
  const Icon = BRAND_CHANNEL_ICONS[channel];

  const accountLabel = (a) =>
    `${isAdmin && a.profiles?.full_name ? a.profiles.full_name + " · " : ""}${a.account_type} · ${maskAccount(a.account_number)} · ${formatCurrency(a.balance, a.currency)}`;

  function setField(name, val) {
    setValues((v) => ({ ...v, [name]: val }));
  }
  function switchChannel(id) {
    setChannel(id);
    setValues({});
    setError("");
  }
  function validate() {
    if (!fromAccount) return "Select a source account.";
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return "Enter a valid amount.";
    if (!isAdmin && limits.min_transfer && amt < limits.min_transfer)
      return `The minimum transfer is ${formatCurrency(limits.min_transfer, active?.currency || "USD")}.`;
    if (!isAdmin && limits.max_transfer && amt > limits.max_transfer)
      return `The maximum transfer is ${formatCurrency(limits.max_transfer, active?.currency || "USD")}.`;
    if (active && amt > Number(active.balance)) return "Insufficient demo balance.";
    for (const f of config.fields) {
      if (f.required && !values[f.name]?.trim()) return `${f.label} is required.`;
    }
    return "";
  }
  function toReview(e) {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setError("");
    setStep("review");
  }
  // Ask the server to email a one-time code, then open the code entry step.
  async function startOtp() {
    setOtpBusy(true); setError(""); setOtpInfo(null); setOtpCode("");
    try {
      const res = await fetch("/api/transfer/send-otp", { method: "POST" });
      const json = await res.json();
      setOtpInfo(json.sent ? { to: json.to } : json.demo ? { demo: true, code: json.code } : { error: json.error || "Couldn't send a code." });
      setOtpOpen(true);
    } catch {
      setOtpInfo({ error: "Couldn't send a code. Please try again." });
      setOtpOpen(true);
    } finally {
      setOtpBusy(false);
    }
  }

  async function confirm(otp) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccount,
          type: channel,
          amount: parseFloat(amount),
          recipientName: values.recipientName || null,
          recipientLabel: config.labelFrom(values),
          note: note || null,
          metadata: { channel, ...values },
          otp: otp || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Transfer failed");
      setOtpOpen(false);
      setResult(json.transaction);
      setStep("success");
      await loadAccounts();
    } catch (err) {
      setError(err.message);
      if (!otpOpen) setStep("review");
    } finally {
      setLoading(false);
    }
  }

  function afterPin() {
    setShowPin(false);
    if (require2fa) startOtp();
    else confirm();
  }
  function reset() {
    setValues({});
    setAmount("");
    setNote("");
    setResult(null);
    setStep("form");
    setError("");
  }

  return (
    <>
    <AnimatePresence mode="wait">
      {step === "form" && (
        <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
          <div className="card p-5">
            <label className="label">{t("transfer.from")}</label>
            {accounts.length > 1 || isAdmin ? (
              <select value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} className="input">
                {accounts.length === 0 && <option>Loading…</option>}
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{accountLabel(a)}</option>
                ))}
              </select>
            ) : active ? (
              <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
                <span className="text-sm text-ink">{active.account_type} · {maskAccount(active.account_number)}</span>
                <span className="text-sm font-semibold text-ink">{formatCurrency(active.balance, active.currency)}</span>
              </div>
            ) : (
              <div className="text-sm text-muted">Loading account…</div>
            )}
          </div>

          <div className="card p-5">
            <label className="label mb-3">Transfer method</label>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {channelList.map((c) => {
                const CI = BRAND_CHANNEL_ICONS[c.id];
                const activeTab = c.id === channel;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => switchChannel(c.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                      activeTab ? "border-transparent bg-brand text-white shadow-glow" : "border-line bg-white/5 text-muted hover:text-ink"
                    }`}
                  >
                    <CI size={16} /> {c.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={toReview} className="mt-5 space-y-4">
              {savedForChannel.length > 0 && (
                <div>
                  <label className="label flex items-center gap-1.5"><UserIcon size={13} /> Saved recipients</label>
                  <select
                    key={channel}
                    defaultValue=""
                    onChange={(e) => e.target.value && applyBeneficiary(e.target.value)}
                    className="input"
                  >
                    <option value="">Choose a saved recipient…</option>
                    {savedForChannel.map((b) => (
                      <option key={b.id} value={b.id}>{b.label} · {b.details?.detail}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {config.fields.map((f, idx) => (
                  <div key={f.name} className={config.fields.length % 2 !== 0 && idx === 0 ? "sm:col-span-2" : ""}>
                    <label className="label">{f.label}{f.required && " *"}</label>
                    <input
                      type={f.type || "text"}
                      value={values[f.name] || ""}
                      onChange={(e) => setField(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      className="input"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{t("transfer.amount")} *</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">{active?.currency || "USD"}</span>
                    <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="input pl-14 text-lg font-semibold" />
                  </div>
                </div>
                <div>
                  <label className="label">{t("transfer.note")}</label>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's this for?" className="input" />
                </div>
              </div>

              {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

              <button type="submit" className="btn-primary w-full">{t("transfer.continue")} <ArrowRightIcon size={16} /></button>
            </form>
          </div>
        </motion.div>
      )}

      {step === "review" && (
        <motion.div key="review" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line p-5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon size={20} /></span>
              <div>
                <div className="text-sm font-semibold text-ink">{t("transfer.review")}</div>
                <div className="text-xs text-muted">{CHANNELS.find((c) => c.id === channel)?.label}</div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-5 text-center">
                <div className="text-xs uppercase tracking-widest text-muted">{t("transfer.amount")}</div>
                <div className="mt-1 font-display text-4xl font-extrabold text-ink">{formatCurrency(parseFloat(amount || 0), active?.currency || "USD")}</div>
              </div>
              <dl className="divide-y divide-line rounded-xl border border-line">
                <Row label={t("transfer.from")} value={active ? `${active.account_type} · ${maskAccount(active.account_number)}` : ""} />
                {values.recipientName && <Row label={t("transfer.recipientName")} value={values.recipientName} />}
                <Row label="To" value={config.labelFrom(values)} />
                {note && <Row label={t("transfer.note")} value={note} />}
                <Row label="Method" value={CHANNELS.find((c) => c.id === channel)?.label} />
              </dl>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-white/5 px-4 py-3 text-xs text-muted">
                <LockIcon size={15} className="text-brand" /> {t("transfer.demoNote")}
              </div>
              {error && <div className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}
              <div className="mt-5 flex gap-3">
                <button onClick={() => setStep("form")} className="btn-ghost flex-1" disabled={loading}><ArrowLeftIcon size={16} /> Back</button>
                <button onClick={() => setShowPin(true)} className="btn-primary flex-1" disabled={loading}>{loading ? "Processing…" : t("transfer.confirm")}</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {step === "success" && result && (
        <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircleIcon size={40} />
          </motion.div>
          <h2 className="font-display text-xl font-extrabold text-ink">{t("transfer.success")}</h2>
          <p className="mt-1 text-sm text-muted">{t("transfer.successSub")}</p>
          <div className="mx-auto mt-6 max-w-sm space-y-3 text-left">
            <div className="rounded-xl border border-line p-4">
              <div className="text-xs uppercase tracking-widest text-muted">{t("transfer.amount")}</div>
              <div className="mt-1 font-display text-3xl font-extrabold text-ink">{formatCurrency(result.amount, result.currency)}</div>
            </div>
            <button
              onClick={() => { navigator.clipboard?.writeText(result.reference); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="flex w-full items-center justify-between rounded-xl border border-line p-4 text-left transition hover:border-brand/40"
            >
              <span>
                <span className="block text-xs uppercase tracking-widest text-muted">{t("transfer.reference")}</span>
                <span className="mt-0.5 block font-mono text-sm text-ink">{result.reference}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-brand"><CopyIcon size={15} /> {copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => printReceipt(result, active ? `${active.account_type} · ${maskAccount(active.account_number)}` : "")}
              className="btn-ghost"
            >
              <DownloadIcon size={16} /> Download receipt
            </button>
            <button onClick={reset} className="btn-ghost">{t("transfer.newTransfer")}</button>
            <Link href={backHref} className="btn-primary">{t("transfer.backDash")}</Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    <PinGate
      open={showPin}
      onClose={() => setShowPin(false)}
      onVerified={afterPin}
      title="Authorize transfer"
      subtitle={`${formatCurrency(parseFloat(amount || 0), active?.currency || "USD")} · ${CHANNELS.find((c) => c.id === channel)?.label || ""}`}
    />

    <AnimatePresence>
      {otpOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-5"
          onClick={() => !loading && setOtpOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
            className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand"><LockIcon size={18} /></span>
              <h3 className="text-base font-semibold text-ink">Verify it&apos;s you</h3>
            </div>
            <p className="text-sm text-muted">
              {otpInfo?.to
                ? `We emailed a 6-digit code to ${otpInfo.to}. Enter it to authorise this transfer.`
                : "Enter the 6-digit code to authorise this transfer."}
            </p>

            {otpInfo?.demo && (
              <div className="mt-3 rounded-xl border border-warn/40 bg-warn/10 px-4 py-2.5 text-sm text-warn">
                Demo mode (email not configured). Your code is <span className="font-mono font-bold">{otpInfo.code}</span>.
              </div>
            )}
            {otpInfo?.error && (
              <div className="mt-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{otpInfo.error}</div>
            )}

            <input
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="••••••"
              className="input mt-4 text-center font-mono text-2xl tracking-[0.5em]"
              autoFocus
            />

            {error && <div className="mt-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

            <div className="mt-5 flex gap-3">
              <button onClick={() => setOtpOpen(false)} disabled={loading} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => confirm(otpCode)} disabled={loading || otpCode.length < 6} className="btn-primary flex-1">
                {loading ? "Verifying…" : "Confirm transfer"}
              </button>
            </div>

            <button
              onClick={startOtp}
              disabled={otpBusy || loading}
              className="mx-auto mt-3 block text-xs text-muted underline-offset-2 hover:text-ink hover:underline disabled:opacity-50"
            >
              {otpBusy ? "Sending…" : "Resend code"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="max-w-[60%] truncate text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
