-- Ranking mundial por modo (mestre / rua / parca).
-- Rodar no Supabase → SQL Editor → Run (uma vez).

alter table public.leaderboard
  add column if not exists mode text not null default 'mestre';

alter table public.leaderboard
  drop constraint if exists leaderboard_name_key_unique;

-- Uma linha por apelido + modo
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'leaderboard_name_mode_unique'
  ) then
    alter table public.leaderboard
      add constraint leaderboard_name_mode_unique unique (name_key, mode);
  end if;
end $$;

alter table public.leaderboard
  drop constraint if exists leaderboard_mode_check;

alter table public.leaderboard
  add constraint leaderboard_mode_check
  check (mode in ('mestre', 'rua', 'parca'));

create index if not exists leaderboard_mode_score_idx
  on public.leaderboard (mode, score desc, updated_at asc);

comment on column public.leaderboard.mode is
  'Modo do placar: mestre | rua | parca';
