-- ============================================================
--  VELORA BANK — MIGRATION v4
--  Adds deposit requests (user requests → admin approves → credited).
--  Run AFTER migration_v3.sql, once. Safe to re-run.
-- ============================================================

create table if not exists public.deposits (
  id            uuid primary key default gen_random_uuid(),
  reference     text unique not null default public.gen_reference(),
  user_id       uuid references public.profiles(id) on delete cascade,
  account_id    uuid references public.accounts(id) on delete cascade,
  amount        numeric(18,2) not null check (amount > 0),
  currency      char(3) not null default 'USD',
  method        txn_type not null default 'local',
  source        text,
  note          text,
  status        withdrawal_status not null default 'pending',
  created_at    timestamptz not null default now(),
  processed_by  uuid references public.profiles(id) on delete set null,
  processed_at  timestamptz
);
create index if not exists dep_user_idx on public.deposits(user_id);
create index if not exists dep_status_idx on public.deposits(status);

alter table public.deposits enable row level security;

drop policy if exists "dep owner read" on public.deposits;
create policy "dep owner read" on public.deposits
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "dep admin all" on public.deposits;
create policy "dep admin all" on public.deposits
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- User requests a deposit (credited only after admin approval).
create or replace function public.request_deposit(
  p_account uuid, p_amount numeric, p_method txn_type, p_source text, p_note text
)
returns public.deposits
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_acct public.accounts;
  v_dep public.deposits;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Enter a valid amount'; end if;
  select * into v_acct from public.accounts where id = p_account;
  if not found or v_acct.user_id <> v_uid then raise exception 'Account not found'; end if;
  if v_acct.status <> 'active' then raise exception 'This account is frozen. Contact support.'; end if;

  insert into public.deposits (user_id, account_id, amount, currency, method, source, note, status)
  values (v_uid, p_account, p_amount, v_acct.currency, p_method, p_source, p_note, 'pending')
  returning * into v_dep;
  return v_dep;
end $$;

-- Admin approves (credits the account + records a transaction) or rejects.
create or replace function public.admin_review_deposit(p_id uuid, p_approve boolean)
returns public.deposits
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_dep public.deposits;
  v_acct public.accounts;
begin
  if not public.is_admin(v_uid) then raise exception 'Admin only'; end if;
  select * into v_dep from public.deposits where id = p_id for update;
  if not found then raise exception 'Request not found'; end if;
  if v_dep.status <> 'pending' then raise exception 'Request already processed'; end if;

  if p_approve then
    select * into v_acct from public.accounts where id = v_dep.account_id for update;
    update public.accounts set balance = balance + v_dep.amount where id = v_acct.id;
    insert into public.transactions
      (reference, from_account, to_account, initiator, type, status, amount, currency, recipient_label, note, metadata)
    values
      (v_dep.reference, null, v_acct.id, v_uid, v_dep.method, 'completed', v_dep.amount, v_dep.currency,
       v_dep.source, coalesce(v_dep.note,'Deposit'), jsonb_build_object('deposit', true));
    update public.deposits set status='approved', processed_by=v_uid, processed_at=now()
      where id = v_dep.id returning * into v_dep;
  else
    update public.deposits set status='rejected', processed_by=v_uid, processed_at=now()
      where id = v_dep.id returning * into v_dep;
  end if;
  return v_dep;
end $$;

grant execute on function public.request_deposit(uuid, numeric, txn_type, text, text) to authenticated;
grant execute on function public.admin_review_deposit(uuid, boolean) to authenticated;
