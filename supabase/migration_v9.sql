-- ============================================================
--  VELORA BANK — MIGRATION v9
--  Adds:
--   1) app_settings  — admin-managed key/value config (public read)
--   2) loans         — loan applications + admin review/disburse
--  Run AFTER migration_v8.sql, once. Safe to re-run.
--  DEMO ONLY: approving a loan credits demo balance, like a deposit.
-- ============================================================

-- ------------------------------------------------------------
--  1) APP SETTINGS  (key -> jsonb)
-- ------------------------------------------------------------
create table if not exists public.app_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles(id) on delete set null
);

alter table public.app_settings enable row level security;

-- Appearance / app config may be needed app-wide, so reads are open.
drop policy if exists "settings read" on public.app_settings;
create policy "settings read" on public.app_settings
  for select using (true);

drop policy if exists "settings admin write" on public.app_settings;
create policy "settings admin write" on public.app_settings
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Upsert a settings section (admin only).
create or replace function public.admin_save_settings(p_key text, p_value jsonb)
returns public.app_settings
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_row public.app_settings;
begin
  if not public.is_admin(v_uid) then raise exception 'Admin only'; end if;
  insert into public.app_settings (key, value, updated_at, updated_by)
  values (p_key, coalesce(p_value, '{}'::jsonb), now(), v_uid)
  on conflict (key) do update
    set value = excluded.value, updated_at = now(), updated_by = v_uid
  returning * into v_row;
  return v_row;
end $$;

-- Seed sensible defaults (only if missing).
insert into public.app_settings (key, value) values
  ('app', '{"bank_name":"Velora Bank","support_email":"support@velora.demo","maintenance_mode":false,"min_transfer":1,"max_transfer":1000000}'::jsonb),
  ('payment', '{"channels":{"local":true,"wire":true,"paypal":true,"bitcoin":true,"zelle":true,"cashapp":true},"wire_fee":15,"bitcoin_fee_pct":1}'::jsonb),
  ('appearance', '{"brand":"velora","default_theme":"system","show_converter":true}'::jsonb),
  ('security', '{"require_2fa":false,"session_timeout_min":30,"allowed_ips":[]}'::jsonb),
  ('loans', '{"enabled":true,"interest_rate":5,"max_amount":50000,"terms":[6,12,24,36]}'::jsonb)
on conflict (key) do nothing;

-- ------------------------------------------------------------
--  2) LOANS
-- ------------------------------------------------------------
do $$ begin
  create type loan_status as enum ('pending','approved','rejected','active','paid');
exception when duplicate_object then null; end $$;

create table if not exists public.loans (
  id              uuid primary key default gen_random_uuid(),
  reference       text unique not null default public.gen_reference(),
  user_id         uuid references public.profiles(id) on delete cascade,
  account_id      uuid references public.accounts(id) on delete set null,
  amount          numeric(18,2) not null check (amount > 0),
  currency        char(3) not null default 'USD',
  term_months     int not null default 12,
  interest_rate   numeric(5,2) not null default 5.0,
  monthly_payment numeric(18,2),
  purpose         text,
  status          loan_status not null default 'pending',
  created_at      timestamptz not null default now(),
  reviewed_by     uuid references public.profiles(id) on delete set null,
  reviewed_at     timestamptz
);
create index if not exists loans_user_idx on public.loans(user_id);
create index if not exists loans_status_idx on public.loans(status);

alter table public.loans enable row level security;

drop policy if exists "loans owner read" on public.loans;
create policy "loans owner read" on public.loans
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "loans admin all" on public.loans;
create policy "loans admin all" on public.loans
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Simple demo repayment estimate: principal + flat interest over the term.
create or replace function public.calc_monthly_payment(p_amount numeric, p_rate numeric, p_term int)
returns numeric language sql immutable as $$
  select round((p_amount * (1 + (coalesce(p_rate,0) / 100.0))) / greatest(coalesce(p_term,1), 1), 2);
$$;

-- Current configured loan rate (falls back to 5%).
create or replace function public.current_loan_rate()
returns numeric language sql stable set search_path = public as $$
  select coalesce((select (value->>'interest_rate')::numeric from public.app_settings where key = 'loans'), 5);
$$;

-- User applies for a loan.
create or replace function public.request_loan(
  p_account uuid, p_amount numeric, p_term int, p_purpose text
)
returns public.loans
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_acct public.accounts;
  v_rate numeric := public.current_loan_rate();
  v_loan public.loans;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Enter a valid amount'; end if;
  select * into v_acct from public.accounts where id = p_account;
  if not found or v_acct.user_id <> v_uid then raise exception 'Account not found'; end if;

  insert into public.loans (user_id, account_id, amount, currency, term_months, interest_rate, monthly_payment, purpose, status)
  values (v_uid, p_account, p_amount, v_acct.currency, coalesce(p_term,12), v_rate,
          public.calc_monthly_payment(p_amount, v_rate, coalesce(p_term,12)), p_purpose, 'pending')
  returning * into v_loan;
  return v_loan;
end $$;

-- Admin creates a loan on behalf of a customer (starts pending).
create or replace function public.admin_create_loan(
  p_account uuid, p_amount numeric, p_term int, p_purpose text
)
returns public.loans
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_acct public.accounts;
  v_rate numeric := public.current_loan_rate();
  v_loan public.loans;
begin
  if not public.is_admin(v_uid) then raise exception 'Admin only'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Enter a valid amount'; end if;
  select * into v_acct from public.accounts where id = p_account;
  if not found then raise exception 'Account not found'; end if;

  insert into public.loans (user_id, account_id, amount, currency, term_months, interest_rate, monthly_payment, purpose, status)
  values (v_acct.user_id, p_account, p_amount, v_acct.currency, coalesce(p_term,12), v_rate,
          public.calc_monthly_payment(p_amount, v_rate, coalesce(p_term,12)), p_purpose, 'pending')
  returning * into v_loan;
  return v_loan;
end $$;

-- Admin approves (disburses to the account + records a transaction) or rejects.
create or replace function public.admin_review_loan(p_id uuid, p_approve boolean)
returns public.loans
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_loan public.loans;
  v_acct public.accounts;
begin
  if not public.is_admin(v_uid) then raise exception 'Admin only'; end if;
  select * into v_loan from public.loans where id = p_id for update;
  if not found then raise exception 'Loan not found'; end if;
  if v_loan.status <> 'pending' then raise exception 'Loan already processed'; end if;

  if p_approve then
    if v_loan.account_id is not null then
      select * into v_acct from public.accounts where id = v_loan.account_id for update;
      if found then
        update public.accounts set balance = balance + v_loan.amount where id = v_acct.id;
        insert into public.transactions
          (reference, from_account, to_account, initiator, type, status, amount, currency, recipient_label, note, metadata)
        values
          (v_loan.reference, null, v_acct.id, v_uid, 'deposit', 'completed', v_loan.amount, v_loan.currency,
           'Loan disbursement', coalesce(v_loan.purpose, 'Loan'), jsonb_build_object('loan', true));
      end if;
    end if;
    update public.loans set status='active', reviewed_by=v_uid, reviewed_at=now()
      where id = v_loan.id returning * into v_loan;
  else
    update public.loans set status='rejected', reviewed_by=v_uid, reviewed_at=now()
      where id = v_loan.id returning * into v_loan;
  end if;
  return v_loan;
end $$;

-- ------------------------------------------------------------
--  GRANTS
-- ------------------------------------------------------------
grant execute on function public.admin_save_settings(text, jsonb) to authenticated;
grant execute on function public.calc_monthly_payment(numeric, numeric, int) to authenticated;
grant execute on function public.current_loan_rate() to authenticated;
grant execute on function public.request_loan(uuid, numeric, int, text) to authenticated;
grant execute on function public.admin_create_loan(uuid, numeric, int, text) to authenticated;
grant execute on function public.admin_review_loan(uuid, boolean) to authenticated;
