import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin-only: add an administrator.
 * - If a profile already exists for the email, promote it to admin.
 * - Otherwise create a new auth user (email pre-confirmed) and set role=admin.
 * Verifies the caller is an admin before doing anything.
 */
export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { fullName, email, password } = body;
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const admin = createAdminClient();
  const cleanEmail = String(email).trim().toLowerCase();

  // Already a user? Promote in place.
  const { data: existing } = await admin
    .from("profiles")
    .select("id, role")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existing) {
    if (existing.role === "admin") {
      return NextResponse.json({ error: "That user is already an administrator." }, { status: 400 });
    }
    const { error: upErr } = await admin.from("profiles").update({ role: "admin" }).eq("id", existing.id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });
    return NextResponse.json({ ok: true, userId: existing.id, promoted: true });
  }

  // New administrator — a password is required to create the account.
  if (!password || String(password).length < 6) {
    return NextResponse.json({ error: "A password of at least 6 characters is required for a new administrator." }, { status: 400 });
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || null },
  });
  if (createErr) return NextResponse.json({ error: createErr.message }, { status: 400 });

  const newId = created.user.id;
  const { error: roleErr } = await admin
    .from("profiles")
    .update({ full_name: fullName || "Administrator", role: "admin" })
    .eq("id", newId);
  if (roleErr) return NextResponse.json({ error: roleErr.message }, { status: 400 });

  return NextResponse.json({ ok: true, userId: newId, promoted: false });
}
