import { state } from "@/state/store";
import { getCleAuth, getCleMaitresse } from "./crypto";
import { envoyerPayload } from "./permia-relay";
import { sauvegarderToutesLesDonnees } from "./storage";
import type { PowerAutomatePayload } from "@/types/relay";

/**
 * Synchronisation 100% invisible : chaque journal non encore transmis est
 * poussé vers le Worker (qui relaie à Power Automate). Une entrée n'est
 * marquée "synced" que si le Worker a réellement accepté l'envoi (HTTP 2xx) :
 * sinon elle reste en attente et sera retentée au prochain passage — une
 * erreur serveur ne doit jamais faire disparaître un registre réglementaire.
 * Un échec interrompt uniquement la catégorie en cours (les suivantes sont
 * quand même tentées), sauf un refus d'accès qui arrête tout.
 */

// 🛡️ GARDE ANTI-DOUBLON : cette fonction est déclenchée depuis une bonne
// dizaine d'endroits indépendants (retour en ligne, minuteur 60s, retour au
// premier plan, et juste après chaque nouvelle saisie dans 5 modules
// différents). Sans ce verrou, deux déclencheurs qui se chevauchent peuvent
// tous les deux filtrer la MÊME entrée `synced: false` avant que la première
// requête n'ait eu le temps de la marquer comme envoyée, et donc la
// transmettre deux fois au registre institutionnel (médicament, présence…).
let synchronisationEnCours = false;
let resynchronisationDemandee = false;

export async function synchroniserDonnees(): Promise<void> {
  if (synchronisationEnCours) {
    // Une synchro tourne déjà : on redemande un passage juste après plutôt
    // que de risquer un envoi en double en la relançant par-dessus.
    resynchronisationDemandee = true;
    return;
  }

  // 🛡️ GARDE : si le coffre est verrouillé, on n'envoie RIEN au serveur
  const cleSync = getCleMaitresse();
  if (!cleSync) {
    console.warn("🛡️ Synchronisation annulée : coffre verrouillé.");
    return;
  }
  const cleAuth = getCleAuth();
  if (!cleAuth) return;

  synchronisationEnCours = true;
  try {
    await executerSynchronisation(cleAuth);
  } finally {
    synchronisationEnCours = false;
    if (resynchronisationDemandee) {
      resynchronisationDemandee = false;
      void synchroniserDonnees();
    }
  }
}

type ResultatEnvoi = "envoye" | "reessayer" | "acces-refuse";

async function envoyer(cleAuth: string, payload: PowerAutomatePayload): Promise<ResultatEnvoi> {
  try {
    const reponse = await envoyerPayload(cleAuth, payload);
    if (reponse.ok) return "envoye";
    // 🛑 Code refusé / trop de tentatives : insister ferait grimper le compteur
    // anti-force brute du Worker et finirait par bloquer le téléphone.
    if (reponse.status === 401 || reponse.status === 403 || reponse.status === 429) return "acces-refuse";
    return "reessayer";
  } catch {
    return "reessayer"; // réseau indisponible
  }
}

/**
 * Envoie une catégorie de journaux dans l'ordre. Renvoie false si l'accès a
 * été refusé (la synchronisation entière doit alors s'arrêter).
 */
async function envoyerCategorie<T extends { synced: boolean }>(
  cleAuth: string,
  journaux: T[],
  versPayload: (log: T) => PowerAutomatePayload,
  apresEnvoi: (log: T) => void = () => {}
): Promise<{ changement: boolean; accesRefuse: boolean }> {
  let changement = false;
  for (const log of journaux.filter((l) => !l.synced)) {
    const resultat = await envoyer(cleAuth, versPayload(log));
    if (resultat === "acces-refuse") return { changement, accesRefuse: true };
    if (resultat === "reessayer") break;
    log.synced = true;
    apresEnvoi(log);
    changement = true;
  }
  return { changement, accesRefuse: false };
}

async function executerSynchronisation(cleAuth: string): Promise<void> {
  const categories: (() => Promise<{ changement: boolean; accesRefuse: boolean }>)[] = [
    // 1. Médicaments
    () => envoyerCategorie(cleAuth, state.medLogs, (log) => ({ type: "medicament", ...log })),

    // 2. Suivi Frigos
    () =>
      envoyerCategorie(cleAuth, state.frigoLogs, (log) => ({
        type: "frigo_eval",
        date: log.date,
        heure: log.heure,
        educateur: log.educateur,
        frigoId: log.frigoId,
        nomFrigo: log.nomFrigo,
        cadenas: log.cadenas,
        hygiene: log.hygiene,
        contenu: log.contenu,
        observations: log.observations
      })),

    // 3. Suivi Pain (Boîte Noire)
    () =>
      envoyerCategorie(cleAuth, state.painLogs, (log) => ({
        type: "pain",
        educateur: log.educateur,
        date: log.date,
        heure: log.heure,
        quantite_restante: log.quantite_restante,
        observations: log.observations
      })),

    // 4. Bilan Comptage MECS (Boîte Noire)
    () =>
      envoyerCategorie(
        cleAuth,
        state.mecsComptageLogs,
        (log) => ({ ...log, type: "comptage_mecs" }),
        (log) => {
          // 🧹 Le PDF a été transmis : on le retire du coffre pour ne pas saturer l'appareil
          delete log.pdfBase64;
          delete log.nomFichier;
        }
      ),

    // 5. Historique Multimédia
    () => envoyerCategorie(cleAuth, state.mediaLogs, (log) => ({ type: "multimedia_log", ...log }))
  ];

  let changementEffectue = false;
  for (const envoyerSuivante of categories) {
    const { changement, accesRefuse } = await envoyerSuivante();
    changementEffectue = changementEffectue || changement;
    if (accesRefuse) {
      console.warn("🛑 Synchronisation interrompue : accès refusé par le serveur.");
      break;
    }
  }

  // 👑 On n'écrase le Cloud QUE si on a envoyé un nouveau truc
  if (changementEffectue) {
    sauvegarderToutesLesDonnees();
  }
}
