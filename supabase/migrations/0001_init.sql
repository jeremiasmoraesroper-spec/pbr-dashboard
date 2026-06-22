-- ==========================================================================
--  PBR Instagram Dashboard — schema inicial
--  Rode este SQL no Supabase (SQL Editor) UMA vez para criar as tabelas.
-- ==========================================================================

-- 1) Snapshot diário de seguidores e métricas de conta (1 linha por dia).
create table if not exists public.daily_snapshots (
  date           date primary key,
  followers      bigint not null,           -- total de seguidores no dia (followers_count)
  new_followers  integer,                   -- novos seguidores do dia (follower_count); null = lag
  reach          bigint,                    -- alcance do dia (reach)
  profile_views  bigint,                    -- visualizações de perfil (profile_views)
  media_count    integer,                   -- total de publicações da conta no dia
  created_at     timestamptz not null default now()
);

-- 2) Posts com métricas de engajamento.
create table if not exists public.posts (
  media_id       text primary key,
  timestamp      timestamptz not null,
  type           text not null,             -- REELS | CAROUSEL | IMAGE | VIDEO
  permalink      text,
  caption        text,
  thumbnail_url  text,
  likes          integer default 0,
  comments       integer default 0,
  views          bigint  default 0,
  reach          bigint  default 0,
  saved          integer default 0,
  shares         integer default 0,
  interactions   bigint  default 0,
  updated_at     timestamptz not null default now()
);

create index if not exists posts_timestamp_idx on public.posts (timestamp desc);

-- 3) Atletas/peões para o ranking (cruzados com a legenda dos posts).
create table if not exists public.athletes (
  id         text primary key,
  name       text not null,
  instagram  text not null,                 -- @handle
  hashtags   text[] not null default '{}'
);

-- ==========================================================================
--  RLS: leitura pública (link aberto) + escrita só pelo service_role.
--  O service_role usado pelo script de coleta IGNORA o RLS (bypass),
--  então só precisamos liberar SELECT para o público.
-- ==========================================================================
alter table public.daily_snapshots enable row level security;
alter table public.posts          enable row level security;
alter table public.athletes       enable row level security;

drop policy if exists "leitura publica snapshots" on public.daily_snapshots;
create policy "leitura publica snapshots" on public.daily_snapshots
  for select using (true);

drop policy if exists "leitura publica posts" on public.posts;
create policy "leitura publica posts" on public.posts
  for select using (true);

drop policy if exists "leitura publica athletes" on public.athletes;
create policy "leitura publica athletes" on public.athletes
  for select using (true);
