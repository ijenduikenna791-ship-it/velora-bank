import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import TxnList from "@/components/dashboard/TxnList";

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage() {
  const supabase = await createClient();
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    admin = supabase;
  }

  const { data: transactions } = await admin
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Transactions</h1>
        <p className="text-sm text-muted">All demo transfers across the platform.</p>
      </div>
      <TxnList transactions={transactions || []} ownAccountIds={[]} />
    </div>
  );
}
