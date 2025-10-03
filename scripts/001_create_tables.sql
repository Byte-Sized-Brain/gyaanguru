-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create roadmaps table
create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  topic text not null,
  experience_level text not null,
  goal text not null,
  time_commitment text not null,
  additional_info text,
  content jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on roadmaps
alter table public.roadmaps enable row level security;

-- Roadmaps policies
create policy "Users can view their own roadmaps"
  on public.roadmaps for select
  using (auth.uid() = user_id);

create policy "Users can insert their own roadmaps"
  on public.roadmaps for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own roadmaps"
  on public.roadmaps for update
  using (auth.uid() = user_id);

create policy "Users can delete their own roadmaps"
  on public.roadmaps for delete
  using (auth.uid() = user_id);

-- Create progress table
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  module_index integer not null,
  topic_index integer not null,
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(user_id, roadmap_id, module_index, topic_index)
);

-- Enable RLS on progress
alter table public.progress enable row level security;

-- Progress policies
create policy "Users can view their own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.progress for update
  using (auth.uid() = user_id);

create policy "Users can delete their own progress"
  on public.progress for delete
  using (auth.uid() = user_id);

-- Create indexes for better query performance
create index if not exists idx_roadmaps_user_id on public.roadmaps(user_id);
create index if not exists idx_progress_user_id on public.progress(user_id);
create index if not exists idx_progress_roadmap_id on public.progress(roadmap_id);
