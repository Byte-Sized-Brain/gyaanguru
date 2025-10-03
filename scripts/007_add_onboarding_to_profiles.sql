-- Profiles: onboarding tracking
alter table if exists public.profiles
  add column if not exists onboarded boolean not null default false,
  add column if not exists onboarded_at timestamp with time zone,
  add column if not exists onboarding_data jsonb;

-- Index for filtering onboarded users
create index if not exists idx_profiles_onboarded on public.profiles(onboarded);
