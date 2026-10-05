-- ============================================================
--  VELORA BANK — SEED DATA  (run after schema.sql + policies.sql)
--
--  HOW TO CREATE THE ADMIN + DEMO USERS
--  ------------------------------------
--  Supabase won't let you insert into auth.users directly from
--  SQL with a password hash easily, so create the two accounts
--  in the Dashboard (Authentication > Users > "Add user",
--  tick "Auto confirm"), then run the UPDATE at the bottom to
--  promote the admin. Suggested credentials (CHANGE THEM):
--
--    ADMIN:  admin@velora.bank   /  Admin@12345
--    DEMO:   demo@velora.bank    /  Demo@12345
--
--  The on_auth_user_created trigger auto-creates a profile and a
--  funded demo Checking account for each of them.
-- ============================================================

-- Pre-create the shared demo-pool counterparties (optional; the
-- transfer engine will also create them on demand).
insert into public.accounts (user_id, account_number, account_type, currency, balance, is_demo_pool)
values
  (null, 'POOL-LOCAL-000001',   'POOL-local',   'USD', 0, true),
  (null, 'POOL-WIRE-000001',    'POOL-wire',    'USD', 0, true),
  (null, 'POOL-PAYPAL-000001',  'POOL-paypal',  'USD', 0, true),
  (null, 'POOL-BITCOIN-000001', 'POOL-bitcoin', 'USD', 0, true),
  (null, 'POOL-SKRILL-000001',  'POOL-skrill',  'USD', 0, true),
  (null, 'POOL-CASHAPP-000001', 'POOL-cashapp', 'USD', 0, true),
  (null, 'POOL-ZELLE-000001',   'POOL-zelle',   'USD', 0, true),
  (null, 'POOL-REVOLUT-000001', 'POOL-revolut', 'USD', 0, true),
  (null, 'POOL-VENMO-000001',   'POOL-venmo',   'USD', 0, true)
on conflict (account_number) do nothing;

-- Promote the admin (run AFTER creating admin@velora.bank in Auth):
update public.profiles
   set role = 'admin', full_name = 'Velora Admin'
 where email = 'admin@velora.bank';

-- Give the demo user a little transaction history to look at:
-- (safe to run once the demo user exists)
do $$
declare
  v_acct uuid;
begin
  select a.id into v_acct from public.accounts a
    join public.profiles p on p.id = a.user_id
   where p.email = 'demo@velora.bank' limit 1;

  if v_acct is not null then
    insert into public.transactions (reference, to_account, initiator, type, status, amount, currency, recipient_name, note)
    values (public.gen_reference(), v_acct, null, 'deposit', 'completed', 5000, 'USD', 'Velora Demo', 'Welcome demo credit')
    on conflict do nothing;
  end if;
end $$;
