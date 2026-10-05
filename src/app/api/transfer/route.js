import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
