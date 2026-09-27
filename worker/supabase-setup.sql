-- ==========================================================================
-- À exécuter dans Supabase → SQL Editor (projet jgfwnatspdjvnxmbsgls)
-- N'affecte PAS la structure ni les policies existantes de app_config :
-- la vue ci-dessous lit app_config avec les droits de son propriétaire,
-- donc aucune RLS à activer/modifier sur app_config lui-même. Zéro risque
-- pour Habita.
--
-- 🛡️ Données nominatives de mineurs : seul le service_role (utilisé
-- exclusivement par le Worker, jamais exposé au client) peut les lire. La
-- clé anon est publique par conception (embarquée dans le front d'Habita) :
-- elle ne doit donner accès NI aux noms NI aux dates de naissance.
-- ==========================================================================

-- 1. Vue en lecture seule : expose uniquement la valeur de la clé
--    'nomsJeunes', rien d'autre de app_config.
--    Colonnes réelles de app_config : cle (text), valeur (jsonb).
create or replace view public.mecs_noms_jeunes as
select valeur as noms_jeunes
from public.app_config
where cle = 'nomsJeunes';

-- Les privilèges par défaut de Supabase accordent tout nouvel objet du
-- schéma public à anon/authenticated : on les retire explicitement.
revoke all on public.mecs_noms_jeunes from anon, authenticated;
grant select on public.mecs_noms_jeunes to service_role;

-- 2. Nouvelle table, indépendante de app_config : une ligne par jeune,
--    reliée à nomsJeunes par correspondance exacte sur le nom complet
--    (même chaîne "NOM Prénom" que dans nomsJeunes, espaces en trop
--    ignorés mais casse et accents doivent correspondre).
create table if not exists public.dates_naissance (
  nom_complet text primary key,
  date_naissance date not null
);

-- RLS activé, AUCUNE policy : anon/authenticated ne voient rien, le
-- service_role (Worker) contourne RLS.
alter table public.dates_naissance enable row level security;
revoke all on public.dates_naissance from anon, authenticated;

-- 3. MIGRATION (base déjà configurée avec l'ancienne version de ce script) :
--    l'ancienne policy donnait la lecture des dates de naissance à anon.
--    ⚠️ À exécuter APRÈS avoir déployé le Worker qui lit avec service_role.
drop policy if exists "Lecture anon dates_naissance" on public.dates_naissance;

-- Exemple d'insertion (à répéter pour chaque jeune, ou via l'éditeur de table) :
-- insert into public.dates_naissance (nom_complet, date_naissance)
-- values ('NOM Prenom', '2010-04-12');
