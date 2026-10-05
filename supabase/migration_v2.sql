-- ============================================================
--  VELORA BANK — MIGRATION v2
--  Adds: Savings accounts, debit-card applications (admin-approved),
--        and withdrawal requests (admin-approved).
--  Run this AFTER schema.sql + policies.sql + seed.sql, once.
--  Safe to re-run (idempotent where possible).
-- ============================================================

-- ---------- ENUMS ----------
do $$ begin
  create type card_status as enum ('pending','approved','rejected','frozen');
exception when duplicate_object then null; end $$;

do $$ begin
  create type withdrawal_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

-- ---------- SAVINGS: update auto-provisioning + backfill ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  starting_balance numeric := 25000.00;  -- demo starting balance (checking)
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
  values (new.id, public.gen_account_number(), 'Checking', 'USD', starting_balance);

  insert into public.accounts (user_id, account_number, account_type, currency, balance)
  values (new.id, public.gen_account_number(), 'Savings', 'USD', 0);

  return new;
end $$;

-- Backfill a Savings account for existing users who don't have one.
insert into public.accounts (user_id, account_number, account_type, currency, balance)
select p.id, public.gen_account_number(), 'Savings', 'USD', 0
from public.profiles p
where not exists (
  select 1 from public.accounts a where a.user_id = p.id and a.account_type = 'Savings'
);

-- ---------- CARDS ----------
create or replace function public.gen_card_number()
returns text language sql as $$
  select '4' || lpad((floor(random()*1000000000000000))::numeric::bigint::text, 15, '0');
$$;

create table if not exists public.cards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  account_id   uuid references public.accounts(id) on delete cascade,
  card_number  text not null,
  card_holder  text,
  card_type    text not null default 'Debit',
  status       card_status not null default 'pending',
  created_at   timestamptz not null default now(),
  reviewed_by  uuid references public.profiles(id) on delete set null,
  reviewed_at  timestamptz
);
create index if not exists cards_user_idx on public.cards(user_id);
create index if not exists cards_status_idx on public.cards(status);

alter table public.cards enable row level security;

drop policy if exists "cards owner read" on public.cards;
create policy "cards owner read" on public.cards
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "cards admin all" on public.cards;
create policy "cards admin all" on public.cards
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- User applies for a debit card on one of their accounts.
create or replace function public.request_card(p_account uuid)
returns public.cards
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_acct public.accounts;
  v_name text;
  v_card public.cards;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select * into v_acct from public.accounts where id = p_account;
  if not found or v_acct.user_id <> v_uid then
    raise exception 'Account not found';
  end if;
  -- prevent duplicate pending/approved cards on the same account
  if exists (select 1 from public.cards c where c.account_id = p_account and c.status in ('pending','approved')) then
    raise exception 'You already have a card or pending application on this account';
  end if;
  select full_name into v_name from public.profiles where id = v_uid;

  insert into public.cards (user_id, account_id, card_number, card_holder, status)
  values (v_uid, p_account, public.gen_card_number(), coalesce(v_name,'Velora Member'), 'pending')
  returning * into v_card;
  return v_card;
end $$;

-- Admin approves/rejects a card application.
create or replace function public.admin_review_card(p_card uuid, p_approve boolean)
returns public.cards
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_card public.cards;
begin
  if not public.is_admin(v_uid) then raise exception 'Admin only'; end if;
  update public.cards
     set status = case when p_approve then 'approved'::card_status else 'rejected'::card_status end,
         reviewed_by = v_uid,
         reviewed_at = now()
   where id = p_card
   returning * into v_card;
  if not found then raise exception 'Card not found'; end if;
  return v_card;
end $$;

-- ---------- WITHDRAWALS ----------
create table if not exists public.withdrawals (
  id            uuid primary key default gen_random_uuid(),
  reference     text unique not null default public.gen_reference(),
  user_id       uuid references public.profiles(id) on delete cascade,
  account_id    uuid references public.accounts(id) on delete cascade,
  amount        numeric(18,2) not null check (amount > 0),
  currency      char(3) not null default 'USD',
  method        txn_type not null default 'local',
  destination   text,
  note          text,
  status        withdrawal_status not null default 'pending',
  created_at    timestamptz not null default now(),
  processed_by  uuid references public.profiles(id) on delete set null,
  processed_at  timestamptz
);
create index if not exists wd_user_idx on public.withdrawals(user_id);
create index if not exists wd_status_idx on public.withdrawals(status);

alter table public.withdrawals enable row level security;

drop policy if exists "wd owner read" on public.withdrawals;
create policy "wd owner read" on public.withdrawals
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "wd admin all" on public.withdrawals;
create policy "wd admin all" on public.withdrawals
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- User requests a withdrawal (funds are NOT moved until admin approves).
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
  if v_acct.balance < p_amount then raise exception 'Insufficient balance'; end if;

  insert into public.withdrawals (user_id, account_id, amount, currency, method, destination, note, status)
  values (v_uid, p_account, p_amount, v_acct.currency, p_method, p_destination, p_note, 'pending')
  returning * into v_wd;
  return v_wd;
end $$;

-- Admin approves (debits + records a transaction) or rejects a withdrawal.
create or replace function public.admin_review_withdrawal(p_id uuid, p_approve boolean)
returns public.withdrawals
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_wd public.withdrawals;
  v_acct public.accounts;
begin
  if not public.is_admin(v_uid) then raise exception 'Admin only'; end if;
  select * into v_wd from public.withdrawals where id = p_id for update;
  if not found then raise exception 'Request not found'; end if;
  if v_wd.status <> 'pending' then raise exception 'Request already processed'; end if;

  if p_approve then
    select * into v_acct from public.accounts where id = v_wd.account_id for update;
    if v_acct.balance < v_wd.amount then raise exception 'Insufficient balance to approve'; end if;
    update public.accounts set balance = balance - v_wd.amount where id = v_acct.id;
    insert into public.transactions
      (reference, from_account, to_account, initiator, type, status, amount, currency, recipient_label, note, metadata)
    values
      (v_wd.reference, v_acct.id, null, v_uid, v_wd.method, 'completed', v_wd.amount, v_wd.currency,
       v_wd.destination, coalesce(v_wd.note,'Withdrawal'), jsonb_build_object('withdrawal', true));
    update public.withdrawals
       set status='approved', processed_by=v_uid, processed_at=now()
     where id = v_wd.id returning * into v_wd;
  else
    update public.withdrawals
       set status='rejected', processed_by=v_uid, processed_at=now()
     where id = v_wd.id returning * into v_wd;
  end if;
  return v_wd;
end $$;

-- ---------- GRANTS ----------
grant execute on function public.request_card(uuid) to authenticated;
grant execute on function public.admin_review_card(uuid, boolean) to authenticated;
grant execute on function public.request_withdrawal(uuid, numeric, txn_type, text, text) to authenticated;
grant execute on function public.admin_review_withdrawal(uuid, boolean) to authenticated;
