
-- Run this script in your Supabase SQL Editor

-- 1. Create the table to store the entire portal state
create table if not exists council_portal_state (
  council_name text primary key,
  data jsonb not null,
  last_updated timestamptz default now()
);

-- 2. Enable Row Level Security (RLS) is good practice
alter table council_portal_state enable row level security;

-- 3. Create a policy to allow public access (Development Mode)
-- WARN: In a real production app with auth, you would restrict this to authenticated users.
create policy "Public Access"
on council_portal_state
for all
using (true)
with check (true);

-- 4. (Optional) If you want to verify it works, insert a dummy record
insert into council_portal_state (council_name, data)
values ('Test Council', '{"status": "connected"}')
on conflict (council_name) do nothing;
