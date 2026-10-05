-- ============================================================
--  VELORA BANK — DATABASE SCHEMA  (Supabase / PostgreSQL)
--  Run order: 1) schema.sql  2) policies.sql  3) seed.sql
--
--  IMPORTANT: This is a DEMO bank. No real money ever moves.
--  All "transfers" only shuffle demo balances between Velora
--  demo accounts and are recorded for display/confirmation.
-- ============================================================

-- Extensions ---------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums --------------------------------------------------------
do $$ begin
  create type user_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type account_status as enum ('active', 'frozen', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type txn_type as enum (
    'local','wire','paypal','bitcoin','skrill','cashapp','zelle','revolut','venmo','deposit','adjustment'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type txn_status as enum ('pending','completed','failed','reversed');
exception when duplicate_object then null; end $$;

-- Profiles -----------------------------------------------------
-- One row per auth user. Mirrors auth.users.id.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default 'New Customer',
  email       text unique,
  phone       text,
  country     text,            -- ISO-3166 alpha-2 (e.g. 'US')
  avatar_url  text,
  role        user_role not null default 'user',
  kyc_level   int not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Accounts -----------------------------------------------------
create table if not exists public.accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete cascade,
  account_number  text unique not null,
  account_type    text not null default 'Checking',
  currency        char(3) not null default 'USD',
  balance         numeric(18,2) not null default 0 check (balance >= 0),
  is_demo_pool    boolean not null default false,  -- shared demo counterparties
  status          account_status not null default 'active',
  created_at      timestamptz not null default now()
);
create index if not exists accounts_user_idx on public.accounts(user_id);

-- Transactions -------------------------------------------------
create table if not exists public.transactions (
  id              uuid primary key default gen_random_uuid(),
  reference       text unique not null,
  from_account    uuid references public.accounts(id) on delete set null,
  to_account      uuid references public.accounts(id) on delete set null,
  initiator       uuid references public.profiles(id) on delete set null,
  type            txn_type not null,
  status          txn_status not null default 'completed',
  amount          numeric(18,2) not null check (amount > 0),
  fee             numeric(18,2) not null default 0,
  currency        char(3) not null default 'USD',
  recipient_name  text,
  recipient_label text,          -- human string: email / wallet / tag etc.
  note            text,
  metadata        jsonb not null default '{}'::jsonb, -- channel-specific fields
  created_at      timestamptz not null default now()
);
create index if not exists txn_from_idx on public.transactions(from_account);
create index if not exists txn_to_idx on public.transactions(to_account);
create index if not exists txn_initiator_idx on public.transactions(initiator);
create index if not exists txn_created_idx on public.transactions(created_at desc);

-- Beneficiaries (saved recipients) ----------------------------
create table if not exists public.beneficiaries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  label       text not null,
  channel     txn_type not null default 'local',
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists beneficiaries_user_idx on public.beneficiaries(user_id);

-- Helpers ------------------------------------------------------
create or replace function public.is_admin(uid uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$;

-- Generate a readable account number
create or replace function public.gen_account_number()
returns text language sql as $$
  select 'VLR' || lpad((floor(random()*1000000000))::bigint::text, 10, '0');
$$;

-- Generate a transaction reference
create or replace function public.gen_reference()
returns text language sql as $$
  select 'TXN-' || to_char(now(),'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
$$;

-- ============================================================
--  AUTO-PROVISIONING
--  When a new auth user is created, make a profile + a funded
--  demo checking account so the app has data to show.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_acct_number text;
  starting_balance numeric := 25000.00;  -- demo starting balance
begin
  insert into public.profiles (id, email, full_name, country)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'country', null)
  )
  on conflict (id) do nothing;

  new_acct_number := public.gen_account_number();
  insert into public.accounts (user_id, account_number, account_type, currency, balance)
  values (new.id, new_acct_number, 'Checking', 'USD', starting_balance);

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  DEMO TRANSFER ENGINE  (the ONLY way money "moves")
--  Atomically debits the sender's demo account and credits a
--  shared Velora demo-pool account for the chosen channel, then
--  records a transaction and returns it. SECURITY DEFINER so it
--  can update balances under RLS, but it re-checks ownership.
-- ============================================================
create or replace function public.perform_demo_transfer(
  p_from_account uuid,
  p_type         txn_type,
  p_amount       numeric,
  p_recipient_name text,
  p_recipient_label text,
  p_note         text,
  p_metadata     jsonb
)
returns public.transactions
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_from public.accounts;
  v_pool public.accounts;
  v_fee numeric := 0;
  v_total numeric;
  v_txn public.transactions;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  select * into v_from from public.accounts where id = p_from_account for update;
  if not found then
    raise exception 'Source account not found';
  end if;

  -- Ownership check (admins may also initiate on behalf; see admin route)
  if v_from.user_id <> v_uid and not public.is_admin(v_uid) then
    raise exception 'You do not own this account';
  end if;
  if v_from.status <> 'active' then
    raise exception 'Source account is not active';
  end if;

  -- Simple demo fee model
  v_fee := case p_type
    when 'wire' then 15.00
    when 'bitcoin' then round(p_amount * 0.01, 2)
    else 0 end;
  v_total := p_amount + v_fee;

  if v_from.balance < v_total then
    raise exception 'Insufficient demo balance';
  end if;

  -- Find (or create) the shared demo-pool counterparty for this channel
  select * into v_pool from public.accounts
    where is_demo_pool = true and account_type = ('POOL-' || p_type::text) limit 1;
  if not found then
    insert into public.accounts (user_id, account_number, account_type, currency, balance, is_demo_pool)
    values (null, 'POOL-' || upper(p_type::text) || '-' || substr(md5(random()::text),1,6),
            'POOL-' || p_type::text, v_from.currency, 0, true)
    returning * into v_pool;
  end if;

  -- Move demo money
  update public.accounts set balance = balance - v_total where id = v_from.id;
  update public.accounts set balance = balance + p_amount where id = v_pool.id;

  insert into public.transactions
    (reference, from_account, to_account, initiator, type, status, amount, fee, currency,
     recipient_name, recipient_label, note, metadata)
  values
    (public.gen_reference(), v_from.id, v_pool.id, v_uid, p_type, 'completed', p_amount, v_fee,
     v_from.currency, p_recipient_name, p_recipient_label, p_note, coalesce(p_metadata,'{}'::jsonb))
  returning * into v_txn;

  return v_txn;
end $$;

-- Admin credit/adjust a user account (demo deposit) -----------
create or replace function public.admin_adjust_balance(
  p_account uuid,
  p_amount  numeric,
  p_note    text
)
returns public.transactions
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_acct public.accounts;
  v_txn public.transactions;
begin
  if not public.is_admin(v_uid) then
    raise exception 'Admin only';
  end if;
  select * into v_acct from public.accounts where id = p_account for update;
  if not found then raise exception 'Account not found'; end if;

  update public.accounts set balance = balance + p_amount where id = v_acct.id;

  insert into public.transactions
    (reference, from_account, to_account, initiator, type, status, amount, currency, note, metadata)
  values
    (public.gen_reference(), null, v_acct.id, v_uid, 'deposit', 'completed', abs(p_amount),
     v_acct.currency, coalesce(p_note,'Admin demo credit'), jsonb_build_object('admin', true))
  returning * into v_txn;

  return v_txn;
end $$;
