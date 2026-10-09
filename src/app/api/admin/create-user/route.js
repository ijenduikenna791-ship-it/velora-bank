import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin-only: create a new customer account.
 * Verifies the caller is an admin, then uses the service-role client to
 * create the auth user (email pre-confirmed). The handle_new_user trigger
 * provisions their Checking + Savings accounts. An optional opening
 * balance is credited to the Checking account and recorded.
 */
function reference() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `TXN-${ymd}-${rand}`;
}

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

  const { fullName, email, phone, country, password, startingBalance } = body;
  if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  if (String(password).length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

  const admin = createAdminClient();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || null, country: country || null, phone: phone || null },
  });
  if (createErr) return NextResponse.json({ error: createErr.message }, { status: 400 });

  const newId = created.user.id;

  // Make sure the profile reflects the details (trigger reads metadata, but be explicit).
  await admin
    .from("profiles")
    .update({ full_name: fullName || "New Customer", country: country || null, phone: phone || null })
    .eq("id", newId);

  // Optional opening balance → Checking account.
  const bal = Number(startingBalance);
  if (bal && bal > 0) {
    const { data: accts } = await admin
      .from("accounts")
      .select("id, account_type, currency")
      .eq("user_id", newId);
    const checking = (accts || []).find((a) => a.account_type === "Checking") || accts?.[0];
    if (checking) {
      await admin.from("accounts").update({ balance: bal }).eq("id", checking.id);
      await admin.from("transactions").insert({
        reference: reference(),
        to_account: checking.id,
        initiator: user.id,
        type: "adjustment",
        status: "completed",
        amount: bal,
        currency: checking.currency || "USD",
        note: "Opening balance",
        metadata: { admin: true, direction: "credit", opening: true },
      });
    }
  }

  return NextResponse.json({ ok: true, userId: newId });
}
