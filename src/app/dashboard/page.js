import { createClient } from "@/lib/supabase/server";
import BalanceCard from "@/components/dashboard/BalanceCard";
import QuickActions from "@/components/dashboard/QuickActions";
import TxnList from "@/components/dashboard/TxnList";
import MiniChart from "@/components/dashboard/MiniChart";
import AccountsPanel from "@/components/dashboard/AccountsPanel";
import { formatCurrency } from "@/lib/utils";
import { LockIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, account_number, account_type, currency, balance, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const primary = (accounts || []).find((a) => a.account_type === "Checking") || accounts?.[0];
  const ownIds = (accounts || []).map((a) => a.id);
  const frozen = (accounts || []).filter((a) => a.status && a.status !== "active");

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  const totalBalance = (accounts || []).reduce((s, a) => s + Number(a.balance || 0), 0);

  const series = (transactions || [])
    .slice()
    .reverse()
    .map((t) => Number(t.amount || 0))
    .slice(-10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="text-sm text-muted">Here&apos;s what&apos;s happening with your money.</p>
      </div>

      {frozen.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/10 px-5 py-4">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger">
            <LockIcon size={18} />
          </span>
          <div className="text-sm">
            <div className="font-semibold text-ink">
              {frozen.length === 1 ? "An account is frozen" : "Some accounts are frozen"}
            </div>
            <p className="mt-0.5 text-muted">
              Your {frozen.map((a) => a.account_type).join(" and ")}{" "}
              {frozen.length === 1 ? "account is" : "accounts are"} currently frozen, so
              withdrawals and transfers from {frozen.length === 1 ? "it" : "them"} are paused.
              Please contact support to restore access.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <BalanceCard
            balance={primary?.balance ?? totalBalance}
            currency={primary?.currency || "USD"}
            accountNumber={primary?.account_number}
            accountType={primary?.account_type}
          />
          <QuickActions />

          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">Activity</h3>
                <p className="text-xs text-muted">Recent transfer volume</p>
              </div>
              <span className="text-sm font-semibold text-ink">
                {formatCurrency(totalBalance, primary?.currency || "USD")}
              </span>
            </div>
            <MiniChart data={series} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent activity</h3>
          </div>
          <TxnList transactions={transactions || []} ownAccountIds={ownIds} />
        </div>
      </div>

      <AccountsPanel accounts={accounts || []} />
    </div>
  );
}
