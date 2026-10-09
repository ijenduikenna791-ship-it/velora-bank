-- ============================================================
--  VELORA BANK — MIGRATION v8  (admin tools)
--  - admin_adjust: credit (+) or debit (-) a user account, with a
--    balance guard and a proper transaction record.
--  - admin_set_kyc: set a customer's KYC level (1–3).
--  Run AFTER migration_v7.sql, once. Safe to re-run.
-- ============================================================

create or replace function public.admin_adjust(
  p_account uuid, p_amount numeric, p_note text
)
returns public.transactions
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_acct public.accounts;
  v_txn public.transactions;
  v_new numeric;
begin
  if not public.is_admin(v_uid) then raise exception 'Admin only'; end if;
  if p_amount is null or p_amount = 0 then raise exception 'Enter a non-zero amount'; end if;

  select * into v_acct from public.accounts where id = p_account for update;
  if not found then raise exception 'Account not found'; end if;

  v_new := v_acct.balance + p_amount;
  if v_new < 0 then raise exception 'Insufficient balance for this debit'; end if;

  update public.accounts set balance = v_new where id = v_acct.id;

  insert into public.transactions
    (reference, from_account, to_account, initiator, type, status, amount, currency, note, metadata)
  values (
    public.gen_reference(),
    case when p_amount < 0 then v_acct.id else null end,
    case when p_amount < 0 then null else v_acct.id end,
    v_uid, 'adjustment', 'completed', abs(p_amount), v_acct.currency,
    coalesce(p_note, case when p_amount < 0 then 'Admin debit' else 'Admin credit' end),
    jsonb_build_object('admin', true, 'direction', case when p_amount < 0 then 'debit' else 'credit' end)
  )
  returning * into v_txn;

  return v_txn;
end $$;

create or replace function public.admin_set_kyc(p_user uuid, p_level int)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then raise exception 'Admin only'; end if;
  if p_level < 1 or p_level > 3 then raise exception 'KYC level must be between 1 and 3'; end if;
  update public.profiles set kyc_level = p_level, updated_at = now() where id = p_user;
end $$;

grant execute on function public.admin_adjust(uuid, numeric, text) to authenticated;
grant execute on function public.admin_set_kyc(uuid, int)        to authenticated;
