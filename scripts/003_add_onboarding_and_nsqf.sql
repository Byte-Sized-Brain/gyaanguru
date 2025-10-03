-- Roadmaps: NSQF rating
alter table if not exists public.roadmaps
  add column if not exists nsqf_level integer,
  add column if not exists nsqf_description text;

-- fix typo in index column name from nsqqf_level to nsqf_level
create index if not exists idx_roadmaps_nsqf_level on public.roadmaps(nsqf_level);

-- Profiles: onboarding tracking
alter table if not exists public.profiles
  add column if not exists onboarded boolean not null default false,
  add column if not exists onboarded_at timestamp with time zone,
  add column if not exists onboarding_data jsonb;

-- RLS: existing policies allow users to update their own profile; no change needed.
