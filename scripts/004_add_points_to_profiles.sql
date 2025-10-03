-- Add points column to profiles table for gamification
alter table if exists public.profiles
  add column if not exists points integer not null default 0;

-- Index for leaderboard queries
create index if not exists idx_profiles_points on public.profiles(points desc);
