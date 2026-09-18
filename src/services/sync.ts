import { state } from "@/state/store";
import { getCleAuth, getCleMaitresse } from "./crypto";
import { envoyerPayload } from "./permia-relay";
import { sauvegarderToutesLesDonnees } from "./storage";

/**
 * Synchronisation 100% invisible : chaque journal non encore transmis est
 * poussé vers le Worker (qui relaie à Power Automate). Comme dans l'ancien
 * script.js, l'échec réseau interrompt (`break`) uniquement la catégorie en
 * cours — les catégories suivantes sont quand même tentées — et l'envoi ne
 * vérifie pas le code HTTP : toute réponse reçue (même une erreur serveur)
 * marque l'entrée comme "synced". C'est un comportement existant, conservé
 * à l'identique plutôt que corrigé silencieusement.
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

async function executerSynchronisation(cleAuth: string): Promise<void> {
  let changementEffectue = false;

  // 1. Envoi Médicaments
  const medLogsAEnvoyer = state.medLogs.filter((log) => !log.synced);
  for (const log of medLogsAEnvoyer) {
    try {
      await envoyerPayload(cleAuth, { type: "medicament", ...log });
      log.synced = true;
      changementEffectue = true;
    } catch {
      break;
    }
  }

  // 3. Envoi Suivi Frigos
  const frigoLogsAEnvoyer = state.frigoLogs.filter((log) => !log.synced);
  for (const log of frigoLogsAEnvoyer) {
    try {
      await envoyerPayload(cleAuth, {
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
      });
      log.synced = true;
      changementEffectue = true;
    } catch {
      break;
    }
  }

  // 4. Envoi Suivi Pain (Boîte Noire)
  const painLogsAEnvoyer = state.painLogs.filter((log) => !log.synced);
  for (const log of painLogsAEnvoyer) {
    try {
      await envoyerPayload(cleAuth, {
        type: "pain",
        educateur: log.educateur,
        date: log.date,
        heure: log.heure,
        quantite_restante: log.quantite_restante,
        observations: log.observations
      });
      log.synced = true;
      changementEffectue = true;
    } catch {
      break;
    }
  }

  // 5. Envoi Bilan Comptage MECS (Boîte Noire)
  const mecsLogsAEnvoyer = state.mecsComptageLogs.filter((log) => !log.synced);
  for (const log of mecsLogsAEnvoyer) {
    try {
      await envoyerPayload(cleAuth, { ...log, type: "comptage_mecs" });
      log.synced = true;
      // 🧹 Le PDF a été transmis : on le retire du coffre pour ne pas saturer l'appareil
      delete log.pdfBase64;
      delete log.nomFichier;
      changementEffectue = true;
    } catch {
      break;
    }
  }

  // 6. Envoi Historique Multimédia (Power Automate)
  const mediaLogsAEnvoyer = state.mediaLogs.filter((log) => !log.synced);
  for (const log of mediaLogsAEnvoyer) {
    try {
      await envoyerPayload(cleAuth, { type: "multimedia_log", ...log });
      log.synced = true;
      changementEffectue = true;
    } catch {
      break;
    }
  }

  // 👑 On n'écrase le Cloud QUE si on a envoyé un nouveau truc
  if (changementEffectue) {
    sauvegarderToutesLesDonnees();
  }
}
