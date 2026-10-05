"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { createClient } from "@/lib/supabase/client";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, ShieldIcon, ArrowRightIcon } from "@/components/ui/icons";

export default function AdminLoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // Verify the signed-in user actually has the admin role.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setError("This account is not authorized for admin access.");
      return;
    }

    setLoading(false);
    router.push("/admin");
    router.refresh();
  }

  return (
    <AuthShell
      title={t("auth.adminTitle")}
      subtitle={t("auth.adminSub")}
      badge={
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <ShieldIcon size={24} />
        </div>
      }
      footer={
        <Link href="/login" className="hover:text-ink">← Back to customer sign in</Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">{t("auth.email")}</label>
          <div className="relative">
            <MailIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@velora.bank" className="input pl-11" />
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
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Toggle password visibility">
              {show ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t("auth.signingIn") : t("auth.signIn")}
          {!loading && <ArrowRightIcon size={16} />}
        </button>
      </form>
    </AuthShell>
  );
}
