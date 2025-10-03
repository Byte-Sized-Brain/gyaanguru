alter table if exists public.profiles
  add column if not exists points integer not null default 0;
