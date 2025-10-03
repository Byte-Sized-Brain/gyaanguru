-- Upsert marketing-focused examples for NSQF levels 4–6
insert into public.nsqf_reference (level, qualification_requirement, example_job_roles, courses)
values
  (4, 'Class 12 + Certificate/Diploma', ARRAY['Digital Marketing Intern','Social Media Assistant'], ARRAY['Digital Marketing Basics','Social Media Fundamentals']),
  (5, 'Diploma/Advanced Certificate', ARRAY['SEO Specialist','Content Marketer'], ARRAY['SEO Specialist Course','Content Marketing L5']),
  (6, 'Undergraduate Degree or Advanced Diploma', ARRAY['Digital Marketing Manager','Marketing Analyst'], ARRAY['Digital Marketing Advanced L6','Analytics & Strategy L6'])
on conflict (level) do update
set qualification_requirement = excluded.qualification_requirement,
    example_job_roles = excluded.example_job_roles,
    courses = excluded.courses;
