-- ============================================================
--  VELORA BANK — MIGRATION v7
--  Transaction PIN (4 digits) to authorize transfers & withdrawals.
--
--  The PIN is NEVER stored in plain text. It is hashed with bcrypt
--  (pgcrypto) and only ever compared inside SECURITY DEFINER
--  functions, so the client can set/verify a PIN but can never read
--  it back.
--
--  Run AFTER migration_v6.sql, once. Safe to re-run.
-- ============================================================

-- pgcrypto provides crypt() / gen_salt(). It is already installed by
-- schema.sql; this is just a safety net. (In Supabase it usually lives
-- in the "extensions" schema, which the functions below include in
-- their search_path.)
create extension if not exists pgcrypto;

-- Column to hold the bcrypt hash of the user's transaction PIN.
alter table public.profiles add column if not exists transaction_pin_hash text;

-- Has the signed-in user set a transaction PIN yet?
create or replace function public.has_transaction_pin()
returns boolean
language sql security definer set search_path = public, extensions as $$
  select transaction_pin_hash is not null
  from public.profiles
  where id = auth.uid();
$$;

-- Set (or change) the signed-in user's transaction PIN.
create or replace function public.set_transaction_pin(p_pin text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if p_pin is null or p_pin !~ '^[0-9]{4}$' then
    raise exception 'PIN must be exactly 4 digits';
  end if;
  update public.profiles
     set transaction_pin_hash = crypt(p_pin, gen_salt('bf'))
   where id = auth.uid();
end;
$$;

-- Verify a PIN against the signed-in user's stored hash.
create or replace function public.verify_transaction_pin(p_pin text)
returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_hash text;
begin
  if auth.uid() is null then
    return false;
  end if;
  select transaction_pin_hash into v_hash
    from public.profiles
   where id = auth.uid();
  if v_hash is null then
    return false;
  end if;
  return v_hash = crypt(coalesce(p_pin, ''), v_hash);
end;
$$;

grant execute on function public.has_transaction_pin()        to authenticated;
grant execute on function public.set_transaction_pin(text)    to authenticated;
grant execute on function public.verify_transaction_pin(text) to authenticated;
