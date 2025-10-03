-- NSQF Reference Table (Levels 3–6)
create table if not exists public.nsqf_reference (
  level integer primary key,
  qualification_requirement text not null,
  example_job_roles text[] not null,
  courses text[] not null
);

-- Enable RLS
alter table public.nsqf_reference enable row level security;

-- Public read access for reference data
create policy "NSQF reference is publicly readable"
  on public.nsqf_reference
  for select
  using (true);

-- Upsert reference rows for MVP levels 3–6
insert into public.nsqf_reference (level, qualification_requirement, example_job_roles, courses)
values
  (3, 'Class 10–12 or equivalent', ARRAY['Data Entry Operator','Field Sales Trainee'], ARRAY['Spreadsheet Fundamentals','Customer Interaction Basics']),
  (4, 'Class 12 + Certificate/Diploma', ARRAY['Technician','Support Engineer (L1)'], ARRAY['Technical Support Foundations','Networking Essentials']),
  (5, 'Diploma/Advanced Certificate', ARRAY['Assistant Engineer','Team Lead (Entry)'], ARRAY['Systems Administration Basics','Quality Assurance Methods']),
  (6, 'Undergraduate Degree or Advanced Diploma', ARRAY['Junior Engineer','Operations Supervisor'], ARRAY['Applied Project Management','Advanced Data Analysis'])
on conflict (level) do update
set qualification_requirement = excluded.qualification_requirement,
    example_job_roles = excluded.example_job_roles,
    courses = excluded.courses;
