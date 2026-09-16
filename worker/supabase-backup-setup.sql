-- ==========================================================================
-- Sauvegarde lisible (hors coffre chiffré) de l'état opérationnel courant :
-- matériel disponible/emprunté, état des frigos, prêts multimédia rendus ou non.
-- À exécuter dans Supabase → SQL Editor (projet jgfwnatspdjvnxmbsgls).
--
-- RLS activé, AUCUNE policy pour anon/authenticated : seul le service_role
-- (utilisé exclusivement par le Worker, jamais exposé au client) peut lire
-- ou écrire ces tables. Toi, en te connectant au Dashboard Supabase avec
-- ton compte, tu les vois quand même normalement (le Studio contourne RLS).
-- ==========================================================================

create table if not exists public.permia_materiel (
  id integer primary key,
  category text not null,
  name text not null,
  status text not null,           -- 'available' | 'borrowed'
  jeune text,
  pro text,
  time timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.permia_materiel enable row level security;

create table if not exists public.permia_frigos (
  id integer primary key,
  name text not null,
  cadenas text,                   -- 'ok' | 'open' | 'lost'
  hygiene text,                   -- 'clean' | 'med' | 'dirty'
  contenu text,                   -- 'ok' | 'sort'
  time timestamptz,
  pro text,
  updated_at timestamptz not null default now()
);
alter table public.permia_frigos enable row level security;

create table if not exists public.permia_media (
  id text primary key,            -- 'manette' | 'telecommande' | 'ordinateur1' | 'ordinateur2'
  name text not null,
  status text not null,           -- 'available' | 'borrowed'
  jeune text,
  pro text,
  time timestamptz,
  last_jeune text,
  last_time text,
  updated_at timestamptz not null default now()
);
alter table public.permia_media enable row level security;
