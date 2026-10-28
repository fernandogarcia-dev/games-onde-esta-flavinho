-- Trava apelido por aparelho: impede alguém de se passar pelo dono do placar.
-- Rodar no Supabase → SQL Editor → Run (uma vez).

alter table public.leaderboard
  add column if not exists device_key text;

comment on column public.leaderboard.device_key is
  'Token do aparelho dono do apelido (localStorage). Null = legado, pode ser reivindicado só com score maior.';
