import { createClient } from "@/lib/supabase/client";

/**
 * Read one admin-managed settings section (app_settings key -> jsonb),
 * merged over the given defaults. Safe before migration_v9 is run or if
 * the row is missing: returns the defaults. Never throws.
 */
export async function getSettings(key, defaults = {}) {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("app_settings").select("value").eq("key", key).maybeSingle();
    return { ...defaults, ...(data?.value || {}) };
  } catch {
    return { ...defaults };
  }
}
