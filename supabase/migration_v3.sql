-- ============================================================
--  VELORA BANK — MIGRATION v3
--  - New users start with $0 (no demo starting balance)
--  - Add profiles.address
--  - Block withdrawals from frozen/closed accounts
--  Run AFTER migration_v2.sql, once. Safe to re-run.
-- ============================================================

-- New users: both Checking and Savings start empty.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, country)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'country', null)
  )
  on conflict (id) do nothing;

  insert into public.accounts (user_id, account_number, account_type, currency, balance)
  values (new.id, public.gen_account_number(), 'Checking', 'USD', 0);

  insert into public.accounts (user_id, account_number, account_type, currency, balance)
  values (new.id, public.gen_account_number(), 'Savings', 'USD', 0);

  return new;
end $$;

-- Address on the customer profile (admin-visible, user-editable).
alter table public.profiles add column if not exists address text;

-- Withdrawals must come from an active account.
create or replace function public.request_withdrawal(
  p_account uuid, p_amount numeric, p_method txn_type, p_destination text, p_note text
)
returns public.withdrawals
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_acct public.accounts;
  v_wd public.withdrawals;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Enter a valid amount'; end if;
  select * into v_acct from public.accounts where id = p_account;
  if not found or v_acct.user_id <> v_uid then raise exception 'Account not found'; end if;
  if v_acct.status <> 'active' then raise exception 'This account is frozen. Contact support.'; end if;
  if v_acct.balance < p_amount then raise exception 'Insufficient balance'; end if;

  insert into public.withdrawals (user_id, account_id, amount, currency, method, destination, note, status)
  values (v_uid, p_account, p_amount, v_acct.currency, p_method, p_destination, p_note, 'pending')
  returning * into v_wd;
  return v_wd;
end $$;
