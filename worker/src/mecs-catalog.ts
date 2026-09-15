import type { Env, MecsJeuneBrut, MecsJeuneCompile } from "./types";

// ==========================================================================
// 📇 CATALOGUE DES JEUNES — source unique : KV (clé "mecs_database")
// ⚠️ Données nominatives de mineurs : jamais dans le code source, jamais en Git.
// ==========================================================================
export async function compilerCatalogueJeunes(env: Env): Promise<MecsJeuneCompile[]> {
  const brut = await env.PERMIA_DB.get<MecsJeuneBrut[]>("mecs_database", { type: "json" });
  if (!Array.isArray(brut)) return [];

  const aujourdhui = new Date();

  return brut.map((j, index) => {
    const dateNaissance = new Date(j.nais);
    let age = aujourdhui.getFullYear() - dateNaissance.getFullYear();
    const moisDiff = aujourdhui.getMonth() - dateNaissance.getMonth();

    if (moisDiff < 0 || (moisDiff === 0 && aujourdhui.getDate() < dateNaissance.getDate())) {
      age--;
    }

    const chambreLabel = j.apt ? `Apt ${j.apt} - Ch. ${j.ch}` : `Ch. ${j.ch}`;
    const batimentPrefix = j.bat === "Capitainerie" ? "⚓ Capitainerie" : `🏢 Bât. ${j.bat}`;

    return {
      id: index + 1,
      prenom: j.prenom,
      nom: j.nom,
      age: age,
      isMajor: age >= 18,
      chambre: `${batimentPrefix} │ ${chambreLabel}`,
      initiales: j.prenom.charAt(0) + j.nom.charAt(0)
    };
  });
}
