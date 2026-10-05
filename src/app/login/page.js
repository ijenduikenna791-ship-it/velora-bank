"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import CountrySelect from "@/components/ui/CountrySelect";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { createClient } from "@/lib/supabase/client";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, ArrowRightIcon } from "@/components/ui/icons";

function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(params.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title={t("auth.welcome")}
      subtitle={t("auth.signinSub")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-semibold text-brand hover:underline">
            {t("auth.signUp")}
          </Link>
        </>
      }
    >
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

        <div>
          <label className="label">{t("auth.password")}</label>
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
          <div className="mt-1.5 text-right">
            <Link href="/forgot-password" className="text-xs font-medium text-brand hover:underline">
              {t("auth.forgot")}
            </Link>
          </div>
        </div>

        <div>
          <label className="label">{t("auth.country")}</label>
          <CountrySelect value={country} onChange={setCountry} placeholder={t("auth.selectCountry")} />
        </div>

        {error && (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t("auth.signingIn") : t("auth.signIn")}
          {!loading && <ArrowRightIcon size={16} />}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-muted">
        <Link href="/admin/login" className="hover:text-ink">Admin access</Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
