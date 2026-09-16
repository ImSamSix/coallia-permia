-- ==========================================================================
-- À exécuter dans Supabase → SQL Editor (projet jgfwnatspdjvnxmbsgls)
-- N'affecte PAS la structure ni les policies existantes de app_config :
-- la vue ci-dessous lit app_config avec les droits de son propriétaire,
-- donc aucune RLS à activer/modifier sur app_config lui-même. Zéro risque
-- pour Habita.
-- ==========================================================================

-- 1. Vue en lecture seule : expose uniquement la valeur de la clé
--    'nomsJeunes', rien d'autre de app_config n'est accessible via anon.
create or replace view public.mecs_noms_jeunes as
select value as noms_jeunes
from public.app_config
where key = 'nomsJeunes';

grant select on public.mecs_noms_jeunes to anon;

-- 2. Nouvelle table, indépendante de app_config : une ligne par jeune,
--    reliée à nomsJeunes par correspondance exacte sur le nom complet
--    (même chaîne "NOM Prénom" que dans nomsJeunes, espaces en trop
--    ignorés mais casse et accents doivent correspondre).
create table if not exists public.dates_naissance (
  nom_complet text primary key,
  date_naissance date not null
);

alter table public.dates_naissance enable row level security;

create policy "Lecture anon dates_naissance"
  on public.dates_naissance
  for select
  to anon
  using (true);

-- Exemple d'insertion (à répéter pour chaque jeune, ou via l'éditeur de table) :
-- insert into public.dates_naissance (nom_complet, date_naissance)
-- values ('NOM Prenom', '2010-04-12');
