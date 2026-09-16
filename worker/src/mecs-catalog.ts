import type { DateNaissanceRow, Env, MecsJeuneCompile, NomsJeunesBrut, NomsJeunesRow } from "./types";

// ==========================================================================
// 📇 CATALOGUE DES JEUNES — sources Supabase (partagées avec Habita)
//    - app_config.nomsJeunes (via la vue "mecs_noms_jeunes") : structure de
//      logement, gérée par Habita, toujours à jour.
//    - dates_naissance : table dédiée à Permia, jointe par nom complet exact.
// ⚠️ Données nominatives de mineurs : jamais dans le code source, jamais en Git.
// ==========================================================================

interface PersonneBrute {
  nomComplet: string;
  bat: string;
  apt?: string;
  ch: string;
}

function supabaseHeaders(env: Env): HeadersInit {
  return { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` };
}

async function chargerNomsJeunes(env: Env): Promise<NomsJeunesBrut> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/mecs_noms_jeunes?select=noms_jeunes`, {
    headers: supabaseHeaders(env)
  });
  if (!res.ok) throw new Error("Lecture nomsJeunes (Supabase) impossible : " + res.status);
  const rows = (await res.json()) as NomsJeunesRow[];
  return rows[0]?.noms_jeunes || {};
}

async function chargerDatesNaissance(env: Env): Promise<Map<string, string>> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/dates_naissance?select=nom_complet,date_naissance`, {
    headers: supabaseHeaders(env)
  });
  if (!res.ok) throw new Error("Lecture dates_naissance (Supabase) impossible : " + res.status);
  const rows = (await res.json()) as DateNaissanceRow[];
  const table = new Map<string, string>();
  rows.forEach((r) => table.set(r.nom_complet.trim(), r.date_naissance));
  return table;
}

/** "Bâtiment C" → "C" ; "Capitainerie" → "Capitainerie" (inchangé). */
function extraireBat(cleBrute: string): string {
  return cleBrute.replace(/^Bâtiment\s+/i, "").trim();
}

/**
 * Aplati la structure imbriquée (Bâtiment → [Appartement →] Chambre → [noms])
 * en une liste plate d'une entrée par jeune. La présence ou non du niveau
 * "Appartement" est détectée dynamiquement (tableau = pas d'appartement,
 * objet = un niveau Chambre en dessous) plutôt que codée en dur sur
 * "Capitainerie", pour rester robuste si Habita ajoute un jour un bâtiment
 * similaire à la Capitainerie.
 */
function aplatirNomsJeunes(brut: NomsJeunesBrut): PersonneBrute[] {
  const personnes: PersonneBrute[] = [];

  for (const [cleBat, valeurBat] of Object.entries(brut)) {
    const bat = extraireBat(cleBat);
    if (!valeurBat || typeof valeurBat !== "object") continue;

    for (const [cle1, valeur1] of Object.entries(valeurBat)) {
      if (Array.isArray(valeur1)) {
        // Pas de niveau appartement : cle1 est directement la chambre.
        valeur1.forEach((nom) => {
          if (typeof nom === "string" && nom.trim()) {
            personnes.push({ nomComplet: nom.trim(), bat, ch: cle1 });
          }
        });
      } else if (valeur1 && typeof valeur1 === "object") {
        // cle1 est l'appartement, on descend d'un niveau pour la chambre.
        for (const [ch, valeurCh] of Object.entries(valeur1 as Record<string, unknown>)) {
          if (Array.isArray(valeurCh)) {
            valeurCh.forEach((nom) => {
              if (typeof nom === "string" && nom.trim()) {
                personnes.push({ nomComplet: nom.trim(), bat, apt: cle1, ch });
              }
            });
          }
        }
      }
    }
  }

  return personnes;
}

/** "NOM Prénom(s)" → { nom, prenom } — le nom de famille est la suite de mots en MAJUSCULES en tête de chaîne. */
function splitNomPrenom(nomComplet: string): { nom: string; prenom: string } {
  const mots = nomComplet.trim().split(/\s+/);
  let i = 0;
  while (i < mots.length && estMotEnMajuscules(mots[i])) i++;
  if (i === 0) i = 1;
  if (i >= mots.length) i = mots.length - 1 || 1;
  return { nom: mots.slice(0, i).join(" "), prenom: mots.slice(i).join(" ") };
}

function estMotEnMajuscules(mot: string): boolean {
  const lettres = mot.replace(/[^\p{L}]/gu, "");
  return lettres.length > 0 && lettres === lettres.toUpperCase() && lettres !== lettres.toLowerCase();
}

export async function compilerCatalogueJeunes(env: Env): Promise<MecsJeuneCompile[]> {
  const [nomsJeunesBrut, datesNaissance] = await Promise.all([chargerNomsJeunes(env), chargerDatesNaissance(env)]);
  const personnes = aplatirNomsJeunes(nomsJeunesBrut);
  const aujourdhui = new Date();

  return personnes.map((p, index) => {
    const { nom, prenom } = splitNomPrenom(p.nomComplet);
    const dateNaissanceStr = datesNaissance.get(p.nomComplet);

    // 🛡️ Par défaut, tant que la date de naissance n'est pas renseignée dans
    // Supabase : traité comme MINEUR (hypothèse la plus prudente pour un
    // outil de sécurité), avec un avertissement serveur pour suivi.
    let age = 0;
    let isMajor = false;

    if (dateNaissanceStr) {
      const dateNaissance = new Date(dateNaissanceStr);
      age = aujourdhui.getFullYear() - dateNaissance.getFullYear();
      const moisDiff = aujourdhui.getMonth() - dateNaissance.getMonth();
      if (moisDiff < 0 || (moisDiff === 0 && aujourdhui.getDate() < dateNaissance.getDate())) age--;
      isMajor = age >= 18;
    } else {
      console.warn(`⚠️ Date de naissance manquante pour "${p.nomComplet}" — traité comme mineur par défaut.`);
    }

    const chambreLabel = p.apt ? `Apt ${p.apt} - Ch. ${p.ch}` : `Ch. ${p.ch}`;
    const batimentPrefix = p.bat === "Capitainerie" ? "⚓ Capitainerie" : `🏢 Bât. ${p.bat}`;

    return {
      id: index + 1,
      prenom,
      nom,
      age,
      isMajor,
      chambre: `${batimentPrefix} │ ${chambreLabel}`,
      initiales: (prenom.charAt(0) + nom.charAt(0)).toUpperCase() || "?",
      bat: p.bat,
      apt: p.apt,
      chambreNum: p.ch
    };
  });
}
