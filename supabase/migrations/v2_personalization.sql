-- Questlog v2 — Personalization Migration
-- Run this in the Supabase SQL Editor on top of an existing v1 deployment.
-- Idempotent: safe to re-run.

-- 1.1 USERS — onboarding profile columns
alter table users
  add column if not exists life_stage text,
  add column if not exists daily_state text,
  add column if not exists interests text[] not null default '{}',
  add column if not exists quest_pref text;

-- Validate daily_state values when present (allow null for legacy rows).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_daily_state_check'
  ) then
    alter table users
      add constraint users_daily_state_check
      check (daily_state is null or daily_state in ('monotonous','busy','balanced','unmotivated'));
  end if;
end$$;

-- 1.2 QUESTS — replace category with quest_type
alter table quests
  add column if not exists quest_type text;

-- Best-effort backfill from legacy `category` column (if it still exists).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'quests' and column_name = 'category'
  ) then
    update quests
       set quest_type = case
         when category in ('relation','community') then 'connection'
         when category = 'goal' then 'challenge'
         when category = 'expand' then 'challenge'
         else 'challenge'
       end
     where quest_type is null;
  end if;
end$$;

-- Anything still null gets the default.
update quests set quest_type = 'challenge' where quest_type is null;

alter table quests alter column quest_type set not null;
alter table quests alter column quest_type set default 'challenge';

-- Drop the old check constraint on category, then drop the column itself.
do $$
declare
  r record;
begin
  for r in
    select conname from pg_constraint
     where conrelid = 'quests'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%category%'
  loop
    execute format('alter table quests drop constraint %I', r.conname);
  end loop;
end$$;

alter table quests drop column if exists category;

-- Add the new check constraint on quest_type.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'quests_quest_type_check'
  ) then
    alter table quests
      add constraint quests_quest_type_check
      check (quest_type in ('challenge','connection','sharing'));
  end if;
end$$;

create index if not exists quests_user_type_created_idx
  on quests (user_id, quest_type, created_at desc);

-- 1.3 DAILY SHARING QUESTS — one global quest per day
create table if not exists daily_sharing_quests (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

alter table daily_sharing_quests enable row level security;

drop policy if exists "demo_all_daily_sharing" on daily_sharing_quests;
create policy "demo_all_daily_sharing" on daily_sharing_quests
  for all using (true) with check (true);
