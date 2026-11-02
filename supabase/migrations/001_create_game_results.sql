-- Kos-Kosan Survival - penyimpanan hasil akhir permainan.
-- Jalankan file ini sekali di Supabase SQL Editor atau melalui Supabase CLI.

create table if not exists public.game_results (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  player_name varchar(30) not null check (char_length(trim(player_name)) between 1 and 30),
  rank smallint not null check (rank between 1 and 5),
  final_balance bigint not null check (final_balance between -100000000 and 100000000),
  total_rezeki bigint not null default 0 check (total_rezeki between 0 and 100000000),
  total_pengeluaran bigint not null default 0 check (total_pengeluaran between 0 and 100000000),
  player_count smallint not null check (player_count between 2 and 5),
  created_at timestamptz not null default now(),
  constraint game_results_session_rank_unique unique (session_id, rank)
);

create index if not exists game_results_final_balance_idx
  on public.game_results (final_balance desc, created_at desc);

create index if not exists game_results_session_id_idx
  on public.game_results (session_id);

alter table public.game_results enable row level security;

-- Browser tidak berbicara langsung ke tabel ini.
-- Akses dilakukan melalui Vercel Function menggunakan secret key Supabase.
revoke all on table public.game_results from anon, authenticated;
grant all on table public.game_results to service_role;
