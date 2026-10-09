"use client";

import { createClient } from "@/lib/supabase/client";
import { CheckCircleIcon } from "@/components/ui/icons";

/** Load one settings section (jsonb) by key, merged over defaults. */
export async function loadSection(key, defaults) {
  const supabase = createClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", key).maybeSingle();
  return { ...defaults, ...(data?.value || {}) };
}

/** Save one settings section via the admin RPC. */
export async function saveSection(key, value) {
  const supabase = createClient();
  const { error } = await supabase.rpc("admin_save_settings", { p_key: key, p_value: value });
  return error?.message || null;
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-line px-4 py-3 text-left">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${checked ? "bg-brand" : "bg-line"}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

export function Saved({ show }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success">
      <CheckCircleIcon size={18} /> Settings saved
    </div>
  );
}
