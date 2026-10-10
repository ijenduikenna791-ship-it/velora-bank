-- ============================================================
--  VELORA BANK — MIGRATION v11
--  Card application fee (admin-controlled).
--  When the admin sets Card Settings → "Application fee" above 0,
--  applying for a debit card debits that fee from the chosen demo
--  account and records it as a transaction. Fee = 0 → free (old
--  behaviour). Run AFTER migration_v9.sql, once. Safe to re-run.
-- ============================================================

create or replace function public.request_card(p_account uuid)
returns public.cards
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_acct public.accounts;
  v_name text;
  v_card public.cards;
  v_fee  numeric := coalesce(
    (select (value->>'application_fee')::numeric from public.app_settings where key = 'cards'), 0);
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  select * into v_acct from public.accounts where id = p_account for update;
  if not found or v_acct.user_id <> v_uid then
    raise exception 'Account not found';
  end if;

  -- One active/pending card per account.
  if exists (select 1 from public.cards c where c.account_id = p_account and c.status in ('pending','approved')) then
    raise exception 'You already have a card or pending application on this account';
  end if;

  -- Charge the admin-configured issuance fee, if any.
  if v_fee > 0 then
    if v_acct.balance < v_fee then
      raise exception 'Insufficient balance to cover the card issuance fee of %', v_fee;
    end if;
    update public.accounts set balance = balance - v_fee where id = v_acct.id;
    insert into public.transactions
      (reference, from_account, to_account, initiator, type, status, amount, currency, recipient_label, note, metadata)
    values
      (public.gen_reference(), v_acct.id, null, v_uid, 'adjustment', 'completed', v_fee, v_acct.currency,
       'Card issuance fee', 'Debit card application fee', jsonb_build_object('card_fee', true));
  end if;

  select full_name into v_name from public.profiles where id = v_uid;
  insert into public.cards (user_id, account_id, card_number, card_holder, status)
  values (v_uid, p_account, public.gen_card_number(), coalesce(v_name, 'Velora Member'), 'pending')
  returning * into v_card;

  return v_card;
end $$;

grant execute on function public.request_card(uuid) to authenticated;
