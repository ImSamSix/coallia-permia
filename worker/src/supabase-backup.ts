import type { Env, EtatFrigoLigne, EtatMaterielLigne, EtatMediaLigne } from "./types";

/**
 * Miroir lisible (hors coffre chiffré) de l'état opérationnel courant :
 * matériel disponible/emprunté, état des frigos, prêts multimédia rendus ou
 * non. Écrit avec la clé service_role (jamais exposée au client) car
 * l'accès est déjà filtré en amont par X-Permia-Key ; aucune policy RLS
 * anon n'existe sur ces tables.
 */
async function upsert(env: Env, table: string, lignes: unknown[]): Promise<void> {
  if (lignes.length === 0) return;

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(lignes)
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Upsert ${table} échoué (${res.status}) : ${detail}`);
  }
}

export async function sauvegarderEtatOperationnel(
  env: Env,
  materiel: EtatMaterielLigne[],
  frigos: EtatFrigoLigne[],
  media: EtatMediaLigne[]
): Promise<void> {
  await Promise.all([upsert(env, "permia_materiel", materiel), upsert(env, "permia_frigos", frigos), upsert(env, "permia_media", media)]);
}
