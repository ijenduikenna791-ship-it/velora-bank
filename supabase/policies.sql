-- ============================================================
--  VELORA BANK — ROW LEVEL SECURITY POLICIES
--  Run after schema.sql
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.accounts       enable row level security;
alter table public.transactions   enable row level security;
alter table public.beneficiaries  enable row level security;

-- ---------- PROFILES ----------
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles
  for update using (public.is_admin(auth.uid()));

-- ---------- ACCOUNTS ----------
drop policy if exists "accounts owner read" on public.accounts;
create policy "accounts owner read" on public.accounts
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Balances are only ever changed by SECURITY DEFINER functions,
-- so no direct INSERT/UPDATE policy is granted to end users.
drop policy if exists "accounts admin all" on public.accounts;
create policy "accounts admin all" on public.accounts
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ---------- TRANSACTIONS ----------
drop policy if exists "txn participant read" on public.transactions;
create policy "txn participant read" on public.transactions
  for select using (
    public.is_admin(auth.uid())
    or initiator = auth.uid()
    or exists (select 1 from public.accounts a
               where a.id in (transactions.from_account, transactions.to_account)
                 and a.user_id = auth.uid())
  );

drop policy if exists "txn admin all" on public.transactions;
create policy "txn admin all" on public.transactions
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ---------- BENEFICIARIES ----------
drop policy if exists "beneficiaries owner all" on public.beneficiaries;
create policy "beneficiaries owner all" on public.beneficiaries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Allow authenticated users to execute the demo engine functions
grant execute on function public.perform_demo_transfer(uuid, txn_type, numeric, text, text, text, jsonb) to authenticated;
grant execute on function public.admin_adjust_balance(uuid, numeric, text) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
