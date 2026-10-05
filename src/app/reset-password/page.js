"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { createClient } from "@/lib/supabase/client";
import { LockIcon, EyeIcon, EyeOffIcon, ArrowRightIcon, CheckCircleIcon } from "@/components/ui/icons";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const supabase = createClient();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) await supabase.auth.exchangeCodeForSession(code);
      } catch {
        /* link already consumed or hash-based — fall through to getSession */
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setReady(true);
      setChecking(false);
    })();
    return () => sub?.subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) return setError(err.message);
    setDone(true);
    await supabase.auth.signOut();
    setTimeout(() => router.push("/login"), 2200);
  }

  return (
    <AuthShell
      title={done ? t("auth.pwUpdated") : t("auth.resetTitle")}
      subtitle={done || !ready ? undefined : t("auth.resetSub")}
      footer={
        <Link href="/login" className="font-semibold text-brand hover:underline">
          {t("auth.backToLogin")}
        </Link>
      }
    >
      {done ? (
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircleIcon size={34} />
          </div>
          <p className="text-sm text-muted">{t("auth.pwUpdatedSub")}</p>
        </div>
      ) : checking ? (
        <div className="flex items-center justify-center py-8">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brand" />
        </div>
      ) : !ready ? (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          This reset link is invalid or has expired.{" "}
          <Link href="/forgot-password" className="font-semibold underline">
            Request a new one
          </Link>
          .
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">{t("auth.newPassword")}</label>
            <div className="relative">
              <LockIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={show ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                aria-label="Toggle password visibility"
              >
                {show ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">{t("auth.confirmNewPassword")}</label>
            <div className="relative">
              <LockIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={show ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="input pl-11"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t("auth.updating") : t("auth.updatePassword")}
            {!loading && <ArrowRightIcon size={16} />}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
