begin;

-- Roadmaps: NSQF rating
alter table if exists public.roadmaps
  add column if not exists nsqf_level integer,
  add column if not exists nsqf_description text;

-- Index for nsqf_level
create index if not exists idx_roadmaps_nsqf_level on public.roadmaps(nsqf_level);

-- Force PostgREST (Supabase) schema cache reload to avoid PGRST204 immediately after migration
do $$
begin
  perform pg_notify('pgrst', 'reload schema');
exception
  when others then
    -- ignore if the channel is unavailable in this environment
    null;
end $$;

commit;
