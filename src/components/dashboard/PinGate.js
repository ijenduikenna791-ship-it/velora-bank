"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { LockIcon, CloseIcon } from "@/components/ui/icons";

/**
 * Transaction-PIN gate. Shown before money moves (transfers, withdrawals).
 *
 *  - If the user has no PIN yet, it prompts them to create one (enter + confirm)
 *    and then continues.
 *  - If a PIN exists, it asks them to enter it and verifies server-side via the
 *    `verify_transaction_pin` RPC (the PIN itself never leaves the database in
 *    plain text — it is stored as a bcrypt hash).
 *
 * Props:
 *   open        - whether the modal is visible
 *   onClose     - called when the user dismisses it
 *   onVerified  - called once the PIN is set/verified; proceed with the action
 *   title       - heading text
 *   subtitle    - small line under the title (e.g. the amount)
 */
export default function PinGate({ open, onClose, onVerified, title = "Authorize payment", subtitle }) {
  const supabase = createClient();
  const [phase, setPhase] = useState("loading"); // loading | create | verify
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setPin("");
    setConfirm("");
    setError("");
    setPhase("loading");
    (async () => {
      const { data, error: err } = await supabase.rpc("has_transaction_pin");
      setPhase(!err && data ? "verify" : !err ? "create" : "verify");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (phase === "verify" || phase === "create") {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [phase]);

  const digits = (v) => v.replace(/\D/g, "").slice(0, 4);

  async function submitCreate() {
    setError("");
    if (pin.length !== 4) return setError("PIN must be exactly 4 digits.");
    if (pin !== confirm) return setError("PINs do not match.");
    setBusy(true);
    const { error: err } = await supabase.rpc("set_transaction_pin", { p_pin: pin });
    setBusy(false);
    if (err) return setError(err.message);
    onVerified?.();
  }

  async function submitVerify() {
    setError("");
    if (pin.length !== 4) return setError("Enter your 4-digit PIN.");
    setBusy(true);
    const { data, error: err } = await supabase.rpc("verify_transaction_pin", { p_pin: pin });
    setBusy(false);
    if (err) return setError(err.message);
    if (!data) {
      setPin("");
      setTimeout(() => inputRef.current?.focus(), 40);
      return setError("Incorrect PIN. Please try again.");
    }
    onVerified?.();
  }

  const pinBox =
    "input text-center text-2xl font-semibold tracking-[0.6em]";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="pin-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-5 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-sm overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 border-b border-line p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <LockIcon size={20} />
                </span>
                <div>
                  <div className="text-sm font-semibold text-ink">{title}</div>
                  {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-muted transition hover:text-ink"
                aria-label="Close"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="p-5">
              {phase === "loading" && (
                <div className="flex items-center justify-center py-8">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brand" />
                </div>
              )}

              {phase === "create" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted">
                    Set a 4-digit transaction PIN. You&apos;ll use it to authorize payments and withdrawals.
                  </p>
                  <div>
                    <label className="label">New PIN</label>
                    <input
                      ref={inputRef}
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(digits(e.target.value))}
                      placeholder="••••"
                      className={pinBox}
                    />
                  </div>
                  <div>
                    <label className="label">Confirm PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={confirm}
                      onChange={(e) => setConfirm(digits(e.target.value))}
                      onKeyDown={(e) => e.key === "Enter" && submitCreate()}
                      placeholder="••••"
                      className={pinBox}
                    />
                  </div>
                  {error && (
                    <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">
                      {error}
                    </div>
                  )}
                  <button onClick={submitCreate} disabled={busy} className="btn-primary w-full">
                    {busy ? "Saving…" : "Set PIN & continue"}
                  </button>
                </div>
              )}

              {phase === "verify" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted">Enter your transaction PIN to continue.</p>
                  <input
                    ref={inputRef}
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(digits(e.target.value))}
                    onKeyDown={(e) => e.key === "Enter" && submitVerify()}
                    placeholder="••••"
                    className={pinBox}
                  />
                  {error && (
                    <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">
                      {error}
                    </div>
                  )}
                  <button onClick={submitVerify} disabled={busy} className="btn-primary w-full">
                    {busy ? "Verifying…" : "Confirm"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
