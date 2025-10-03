-- Profiles: onboarding tracking
alter table if not exists public.profiles
  add column if not exists onboarded boolean not null default false,
  add column if not exists onboarded_at timestamp with time zone,
  add column if not exists onboarding_data jsonb;

-- Roadmaps: NSQF rating
alter table if not exists public.roadmaps
  add column if not exists nsqf_level integer,
  add column if not exists nsqf_description text;

-- Index for nsqf_level (safe if already created)
create index if not exists idx_roadmaps_nsqf_level on public.roadmaps(nsqf_level);
