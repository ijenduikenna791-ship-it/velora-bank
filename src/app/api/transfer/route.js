import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const sha256 = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");

/**
 * Demo transfer endpoint. Verifies the signed-in user, then calls the
 * SECURITY DEFINER `perform_demo_transfer` DB function, which atomically
 * moves DEMO money from the user's account into the shared Velora demo
 * pool for the chosen channel. No real funds ever move.
 */
export async function POST(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { fromAccount, type, amount, recipientName, recipientLabel, note, metadata } = body;

  const allowed = ["local", "wire", "paypal", "bitcoin", "skrill", "cashapp", "zelle", "revolut", "venmo"];
  if (!allowed.includes(type)) {
    return NextResponse.json({ error: "Unsupported transfer method" }, { status: 400 });
  }
  const amt = Number(amount);
  if (!fromAccount || !amt || amt <= 0) {
    return NextResponse.json({ error: "A source account and a valid amount are required" }, { status: 400 });
  }

  // Two-factor: when the admin has enabled it, a valid emailed code is required.
  const { data: sec } = await supabase.from("app_settings").select("value").eq("key", "security").maybeSingle();
  if (sec?.value?.require_2fa === true) {
    const otp = (body.otp || "").toString().trim();
    if (!otp) {
      return NextResponse.json({ error: "A verification code is required", need2fa: true }, { status: 401 });
    }
    const admin = createAdminClient();
    const { data: row } = await admin
      .from("transfer_otps")
      .select("id")
      .eq("user_id", user.id)
      .eq("consumed", false)
      .eq("code_hash", sha256(otp))
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (!row) {
      return NextResponse.json({ error: "That code is invalid or has expired.", need2fa: true }, { status: 401 });
    }
    await admin.from("transfer_otps").update({ consumed: true }).eq("id", row.id);
  }

  const { data, error } = await supabase.rpc("perform_demo_transfer", {
    p_from_account: fromAccount,
    p_type: type,
    p_amount: amt,
    p_recipient_name: recipientName || null,
    p_recipient_label: recipientLabel || null,
    p_note: note || null,
    p_metadata: metadata || {},
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ transaction: data });
}
