import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import TxnList from "@/components/dashboard/TxnList";
import { formatCurrency } from "@/lib/utils";
import { UsersIcon, ReceiptIcon, TrendingUpIcon, BankIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon size={20} />
        </span>
      </div>
      <div className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink">{value}</div>
      <div className="mt-0.5 text-xs text-muted">{label}</div>
    </div>
  );
}

export default async function AdminOverview() {
  const supabase = await createClient();

  // Use service-role client for aggregate reads (safe: this page is already
  // behind the admin-only layout guard).
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    admin = supabase;
  }

  const { count: userCount } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: txnCount } = await admin
    .from("transactions")
    .select("*", { count: "exact", head: true });

  const { data: volumeRows } = await admin.from("transactions").select("amount");
  const volume = (volumeRows || []).reduce((s, r) => s + Number(r.amount || 0), 0);

  const { data: recent } = await admin
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Admin overview</h1>
        <p className="text-sm text-muted">Platform-wide demo activity at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={UsersIcon} label="Total users" value={userCount ?? 0} />
        <StatCard icon={ReceiptIcon} label="Transactions" value={txnCount ?? 0} />
        <StatCard icon={TrendingUpIcon} label="Total volume" value={formatCurrency(volume)} />
        <StatCard icon={BankIcon} label="Status" value="Operational" />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Latest transactions</h3>
        <TxnList transactions={recent || []} ownAccountIds={[]} />
      </div>
    </div>
  );
}
