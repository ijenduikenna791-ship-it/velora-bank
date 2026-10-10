import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const sha256 = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");

/**
 * Generate a 6-digit transfer verification code for the signed-in user,
 * store it HASHED with a 5-minute expiry, and email it via Resend.
 * If Resend isn't configured, the code is returned in the response so the
 * demo stays usable (clearly flagged as demo mode) — never do this in prod.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const admin = createAdminClient();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // Invalidate any earlier unconsumed codes, then store the new one.
  await admin.from("transfer_otps").delete().eq("user_id", user.id).eq("consumed", false);
  const { error: insErr } = await admin.from("transfer_otps").insert({
    user_id: user.id, code_hash: sha256(code), expires_at: expires,
  });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });

  // Fetch the recipient email + name.
  const { data: profile } = await admin.from("profiles").select("email, full_name").eq("id", user.id).single();
  const email = profile?.email || user.email;

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Velora Bank <onboarding@resend.dev>";

  if (!key || !email) {
    // Demo mode: no mailer configured — surface the code so it can be tested.
    return NextResponse.json({ sent: false, demo: true, code });
  }

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,sans-serif;max-width:460px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#A78BFA,#7C3AED 55%,#D946EF);padding:22px 24px;border-radius:14px 14px 0 0">
        <div style="color:#fff;font-weight:800;font-size:20px">Velora</div>
      </div>
      <div style="border:1px solid #eee;border-top:none;border-radius:0 0 14px 14px;padding:22px 24px;color:#1a1324">
        <p style="margin:0 0 10px;font-size:15px">Hi ${profile?.full_name || "there"}, here is your transfer verification code:</p>
        <div style="font-size:34px;font-weight:800;letter-spacing:8px;text-align:center;margin:18px 0;color:#7C3AED">${code}</div>
        <p style="margin:0;color:#8a8a99;font-size:12px">This code expires in 5 minutes. If you didn't start a transfer, you can ignore this email.</p>
      </div>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email], subject: "Your Velora transfer code", html }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ sent: false, error: data?.message || "Could not send code" }, { status: 200 });
    }
    return NextResponse.json({ sent: true, to: email });
  } catch (e) {
    return NextResponse.json({ sent: false, error: String(e) }, { status: 200 });
  }
}
