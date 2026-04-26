-- Questlog!!! schema
-- Run this in the Supabase SQL Editor (https://app.supabase.com → SQL Editor → New query)

create extension if not exists "uuid-ossp";

-- USERS
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  nickname text not null unique,
  created_at timestamptz not null default now()
);

-- QUESTS
create table if not exists quests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  category text not null check (category in ('expand','relation','community','goal')),
  description text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists quests_user_created_idx on quests (user_id, created_at desc);

-- SUBMISSIONS
create table if not exists submissions (
  id uuid primary key default uuid_generate_v4(),
  quest_id uuid not null references quests(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists submissions_created_idx on submissions (created_at desc);

-- DEMO MODE: relax RLS so demo can run without auth.
-- For real deployments, lock these down.
alter table users enable row level security;
alter table quests enable row level security;
alter table submissions enable row level security;

drop policy if exists "demo_all_users" on users;
drop policy if exists "demo_all_quests" on quests;
drop policy if exists "demo_all_submissions" on submissions;

create policy "demo_all_users" on users for all using (true) with check (true);
create policy "demo_all_quests" on quests for all using (true) with check (true);
create policy "demo_all_submissions" on submissions for all using (true) with check (true);

-- STORAGE BUCKET
-- 1) Create a public bucket named 'submissions' in Supabase Studio → Storage,
--    OR run this if you have access:
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', true)
on conflict (id) do nothing;

-- 2) Allow anonymous uploads/reads to that bucket for the demo:
drop policy if exists "demo_submissions_read" on storage.objects;
drop policy if exists "demo_submissions_write" on storage.objects;

create policy "demo_submissions_read" on storage.objects
  for select using (bucket_id = 'submissions');

create policy "demo_submissions_write" on storage.objects
  for insert with check (bucket_id = 'submissions');
