import { createClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY admin client using the service-role key.
 * Never import this into a client component. Bypasses RLS — only
 * use inside route handlers after you've verified the caller.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
