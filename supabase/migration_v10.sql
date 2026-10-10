-- ============================================================
--  VELORA BANK — MIGRATION v10
--  Two-factor (OTP) verification for transfers.
--  A short-lived, single-use 6-digit code is emailed to the
--  customer and must be entered to authorise a transfer when
--  the admin has turned on Security → "Require 2FA on transfers".
--  Codes are stored HASHED and only ever read by server routes
--  (service role) — there are no client RLS policies on purpose.
--  Run AFTER migration_v9.sql, once. Safe to re-run.
-- ============================================================

create table if not exists public.transfer_otps (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  code_hash   text not null,
  expires_at  timestamptz not null,
  consumed    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists transfer_otps_user_idx on public.transfer_otps(user_id);

-- RLS on, with NO client policies: only the service-role API routes
-- (which bypass RLS) may read or write this table.
alter table public.transfer_otps enable row level security;
