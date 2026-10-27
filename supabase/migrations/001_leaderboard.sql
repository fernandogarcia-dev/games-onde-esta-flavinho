-- Ranking GLOBAL Cadê Flavinho
-- Cole e rode no Supabase → SQL Editor → Run (uma vez).

create table if not exists public.leaderboard (
  id bigint generated always as identity primary key,
  name text not null,
  name_key text not null,
  score integer not null check (score > 0 and score <= 1000000),
  updated_at timestamptz not null default now(),
  constraint leaderboard_name_key_unique unique (name_key)
);

create index if not exists leaderboard_score_idx
  on public.leaderboard (score desc, updated_at asc);

alter table public.leaderboard enable row level security;

drop policy if exists "leaderboard_read" on public.leaderboard;
create policy "leaderboard_read"
  on public.leaderboard
  for select
  to anon, authenticated
  using (true);

-- Sem policy de INSERT/UPDATE para anon:
-- só a API Next.js com service_role grava no placar.

comment on table public.leaderboard is 'Placar global Cadê Flavinho';
