"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { createClient } from "@/lib/supabase/client";
import { MailIcon, ArrowRightIcon, CheckCircleIcon, ArrowLeftIcon } from "@/components/ui/icons";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      title={t("auth.forgotTitle")}
      subtitle={sent ? undefined : t("auth.forgotSub")}
      footer={
        <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
          <ArrowLeftIcon size={14} /> {t("auth.backToLogin")}
        </Link>
      }
    >
      {sent ? (
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircleIcon size={34} />
          </div>
          <h2 className="font-display text-lg font-bold text-ink">{t("auth.resetSent")}</h2>
          <p className="mt-1.5 text-sm text-muted">{t("auth.resetSentSub")}</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">{t("auth.email")}</label>
            <div className="relative">
              <MailIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
            {loading ? t("auth.sending") : t("auth.sendReset")}
            {!loading && <ArrowRightIcon size={16} />}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
