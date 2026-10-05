"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CountrySelect from "@/components/ui/CountrySelect";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitch from "@/components/ui/LanguageSwitch";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { initials } from "@/lib/utils";
import { UserIcon, CheckCircleIcon, PlusIcon, LockIcon } from "@/components/ui/icons";

export default function SettingsPage() {
  const { t } = useI18n();
  const supabase = createClient();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [hasPin, setHasPin] = useState(false);
  const [pinEditing, setPinEditing] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinSaving, setPinSaving] = useState(false);
  const [pinSaved, setPinSaved] = useState(false);
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setCountry(data.country || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setAvatarUrl(data.avatar_url || "");
      }
      const { data: pinSet } = await supabase.rpc("has_transaction_pin");
      setHasPin(!!pinSet);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onPickAvatar(e) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    if (file.size > 3 * 1024 * 1024) { setError("Image must be under 3 MB."); return; }
    setUploading(true); setError("");
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${profile.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, cacheControl: "3600" });
    if (upErr) { setUploading(false); setError(upErr.message); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
    setAvatarUrl(url);
    setUploading(false);
  }

  async function savePin() {
    setPinError("");
    if (!/^\d{4}$/.test(pin)) return setPinError("PIN must be exactly 4 digits.");
    if (pin !== pinConfirm) return setPinError("PINs do not match.");
    setPinSaving(true);
    const { error } = await supabase.rpc("set_transaction_pin", { p_pin: pin });
    setPinSaving(false);
    if (error) return setPinError(error.message);
    setHasPin(true); setPinEditing(false); setPin(""); setPinConfirm("");
    setPinSaved(true); setTimeout(() => setPinSaved(false), 2500);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, country, phone, address })
      .eq("id", profile.id);
    setSaving(false);
    if (error) return setError(error.message);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{t("dash.settings")}</h1>
        <p className="text-sm text-muted">Manage your profile and preferences.</p>
      </div>

      <form onSubmit={save} className="card space-y-5 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <UserIcon size={18} className="text-brand" /> Profile
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <span className="relative inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand to-accent text-lg font-bold text-white">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(fullName || "V")
            )}
          </span>
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-ghost px-4 py-2 text-sm">
              <PlusIcon size={15} /> {uploading ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            <p className="mt-1 text-xs text-muted">JPG or PNG, up to 3 MB.</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t("auth.fullName")}</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">{t("auth.email")}</label>
            <input value={profile?.email || ""} disabled className="input opacity-60" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 1234" className="input" />
          </div>
          <div>
            <label className="label">{t("auth.country")}</label>
            <CountrySelect value={country} onChange={setCountry} placeholder={t("auth.selectCountry")} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, state, ZIP" className="input" />
          </div>
        </div>

        {error && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>}

        <button type="submit" disabled={saving} className="btn-primary w-fit">
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
          {saved && <CheckCircleIcon size={16} />}
        </button>
      </form>

      <div className="card space-y-4 p-6">
        <div className="text-sm font-semibold text-ink">Preferences</div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{t("auth.theme")}</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{t("auth.language")}</span>
          <LanguageSwitch />
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <LockIcon size={18} className="text-brand" /> Security
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-ink">Transaction PIN</div>
            <p className="text-xs text-muted">A 4-digit PIN is required to authorize transfers and withdrawals.</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${hasPin ? "bg-success/15 text-success" : "bg-warn/15 text-warn"}`}>
            {hasPin ? "Set" : "Not set"}
          </span>
        </div>

        {pinEditing ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  className="input text-center tracking-[0.5em]"
                />
              </div>
              <div>
                <label className="label">Confirm PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  className="input text-center tracking-[0.5em]"
                />
              </div>
            </div>
            {pinError && <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">{pinError}</div>}
            <div className="flex gap-3">
              <button type="button" onClick={savePin} disabled={pinSaving} className="btn-primary">
                {pinSaving ? "Saving…" : "Save PIN"}
              </button>
              <button
                type="button"
                onClick={() => { setPinEditing(false); setPin(""); setPinConfirm(""); setPinError(""); }}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setPinEditing(true)} className="btn-ghost w-fit">
            {hasPin ? "Change PIN" : "Set a PIN"}
            {pinSaved && <CheckCircleIcon size={16} className="text-success" />}
          </button>
        )}
      </div>
    </div>
  );
}
