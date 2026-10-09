import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin-only: send a real email to a customer via Resend.
 * Verifies the caller is an admin. If RESEND_API_KEY isn't configured,
 * returns sent:false with reason "not-configured" (no error thrown).
 */
export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const { email, subject, message } = body;
  if (!email || !subject || !message) {
    return NextResponse.json({ error: "Recipient, subject and message are required" }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Velora Bank <onboarding@resend.dev>";
  if (!key) {
    return NextResponse.json({ sent: false, reason: "not-configured" });
  }

  const safe = String(message).replace(/</g, "&lt;").replace(/\n/g, "<br/>");
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#A78BFA,#7C3AED 55%,#D946EF);padding:22px 24px;border-radius:14px 14px 0 0">
        <div style="color:#fff;font-weight:800;font-size:20px">Velora</div>
      </div>
      <div style="border:1px solid #eee;border-top:none;border-radius:0 0 14px 14px;padding:22px 24px;color:#1a1324">
        <p style="margin:0 0 12px;font-size:15px">${safe}</p>
        <p style="margin:18px 0 0;color:#8a8a99;font-size:12px">Sent by the Velora Bank team.</p>
      </div>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email], subject, html }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ sent: false, error: data?.message || "Send failed" }, { status: 200 });
    return NextResponse.json({ sent: true, id: data?.id || null });
  } catch (e) {
    return NextResponse.json({ sent: false, error: String(e) }, { status: 200 });
  }
}
