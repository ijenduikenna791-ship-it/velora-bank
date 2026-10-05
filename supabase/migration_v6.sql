-- ============================================================
--  VELORA BANK — MIGRATION v6
--  Capture the phone number entered at sign-up into the profile.
--  Run AFTER migration_v5.sql, once. Safe to re-run.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, country, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'country', null),
    coalesce(new.raw_user_meta_data->>'phone', null)
  )
  on conflict (id) do nothing;

  insert into public.accounts (user_id, account_number, account_type, currency, balance)
  values (new.id, public.gen_account_number(), 'Checking', 'USD', 0);

  insert into public.accounts (user_id, account_number, account_type, currency, balance)
  values (new.id, public.gen_account_number(), 'Savings', 'USD', 0);

  return new;
end $$;
