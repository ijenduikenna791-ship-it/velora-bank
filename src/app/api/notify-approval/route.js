import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Best-effort email notification (used when an admin approves/rejects a
 * card, withdrawal or deposit). Sends via Resend's REST API if
 * RESEND_API_KEY is configured; otherwise it quietly no-ops so the admin
 * flow never breaks. Only admins may call it.
 */
export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ sent: false, reason: "unauthorized" }, { status: 401 });

  // Verify caller is an admin.
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ sent: false, reason: "forbidden" }, { status: 403 });

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Velora Bank <onboarding@resend.dev>";

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ sent: false }, { status: 400 }); }
  const { email, subject, text } = body;

  if (!key || !email) {
    // Email isn't configured — that's fine, the approval still succeeded.
    return NextResponse.json({ sent: false, reason: "not-configured" });
  }

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#A78BFA,#7C3AED 55%,#D946EF);padding:22px 24px;border-radius:14px 14px 0 0">
        <div style="color:#fff;font-weight:800;font-size:20px">Velora</div>
      </div>
      <div style="border:1px solid #eee;border-top:none;border-radius:0 0 14px 14px;padding:22px 24px;color:#1a1324">
        <p style="margin:0 0 12px;font-size:15px">${(text || "").replace(/</g, "&lt;")}</p>
        <p style="margin:18px 0 0;color:#8a8a99;font-size:12px">This is an automated message from Velora Bank.</p>
      </div>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email], subject: subject || "Velora update", html }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ sent: false, error: data }, { status: 200 });
    return NextResponse.json({ sent: true });
  } catch (e) {
    return NextResponse.json({ sent: false, error: String(e) }, { status: 200 });
  }
}
