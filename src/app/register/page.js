"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import CountrySelect from "@/components/ui/CountrySelect";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { createClient } from "@/lib/supabase/client";
import { UserIcon, MailIcon, LockIcon, PhoneIcon, EyeIcon, EyeOffIcon, ArrowRightIcon, CheckCircleIcon } from "@/components/ui/icons";

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!phone.trim()) { setError("Phone number is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, country, phone: phone.trim() } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <AuthShell title="Almost there" subtitle="We sent you a confirmation link.">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircleIcon size={44} className="text-success" />
          <p className="text-sm text-muted">
            Check <span className="text-ink">{email}</span> to confirm your account, then sign in.
          </p>
          <Link href="/login" className="btn-primary mt-2">Go to sign in</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("auth.createTitle")}
      subtitle={t("auth.createSub")}
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            {t("auth.signIn")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">{t("auth.fullName")}</label>
          <div className="relative">
            <UserIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className="input pl-11" />
          </div>
        </div>

        <div>
          <label className="label">{t("auth.email")}</label>
          <div className="relative">
            <MailIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-11" />
          </div>
        </div>

        <div>
          <label className="label">{t("auth.phone")} *</label>
          <div className="relative">
            <PhoneIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("auth.phonePlaceholder")} className="input pl-11" />
          </div>
        </div>

        <div>
          <label className="label">{t("auth.password")}</label>
          <div className="relative">
            <LockIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type={show ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="input pl-11 pr-11"
            />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Toggle password visibility">
              {show ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="label">{t("auth.confirmPassword")}</label>
          <div className="relative">
            <LockIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type={showConfirm ? "text" : "password"}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              className={`input pl-11 pr-11 ${confirm && confirm !== password ? "border-danger focus:border-danger focus:ring-danger/30" : ""}`}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Toggle password visibility">
              {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
          {confirm && confirm !== password && (
            <p className="mt-1 text-xs text-danger">Passwords do not match.</p>
          )}
        </div>

        <div>
          <label className="label">{t("auth.country")}</label>
          <CountrySelect value={country} onChange={setCountry} placeholder={t("auth.selectCountry")} />
        </div>

        {error && (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t("auth.signingIn") : t("auth.signUp")}
          {!loading && <ArrowRightIcon size={16} />}
        </button>

        <p className="text-center text-xs leading-relaxed text-muted">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">Privacy Policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}
