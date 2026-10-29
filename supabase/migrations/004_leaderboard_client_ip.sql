-- Dono do apelido: aparelho + IP (reclaim se for a mesma pessoa).
-- Também garante device_key e mode se as migrations 002/003 ainda não rodaram.
-- Rodar no Supabase → SQL Editor → Run (uma vez).

alter table public.leaderboard
  add column if not exists device_key text;

alter table public.leaderboard
  add column if not exists mode text;

alter table public.leaderboard
  add column if not exists client_ip text;

-- mode default + check (idempotente)
update public.leaderboard
set mode = 'mestre'
where mode is null or mode = '';

do $$
begin
  begin
    alter table public.leaderboard
      alter column mode set default 'mestre';
  exception when others then null;
  end;

  begin
    alter table public.leaderboard
      alter column mode set not null;
  exception when others then null;
  end;

  if not exists (
    select 1 from pg_constraint
    where conname = 'leaderboard_mode_check'
  ) then
    alter table public.leaderboard
      add constraint leaderboard_mode_check
      check (mode in ('mestre', 'rua', 'parca'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'leaderboard_name_mode_unique'
  ) then
    alter table public.leaderboard
      drop constraint if exists leaderboard_name_key_unique;
    alter table public.leaderboard
      add constraint leaderboard_name_mode_unique unique (name_key, mode);
  end if;
end $$;

create index if not exists leaderboard_mode_score_idx
  on public.leaderboard (mode, score desc, updated_at asc);

create index if not exists leaderboard_client_ip_idx
  on public.leaderboard (client_ip)
  where client_ip is not null and client_ip <> '';

comment on column public.leaderboard.device_key is
  'Token do aparelho dono do apelido (localStorage).';
comment on column public.leaderboard.mode is
  'Modo do placar: mestre | rua | parca';
comment on column public.leaderboard.client_ip is
  'IP do cliente na última gravação — permite reivindicar o nick no mesmo IP.';
