import { state } from "@/state/store";
import { chiffrer, getCleAuth, getCleMaitresse, tenterDechiffrement } from "./crypto";
import { pushCloudSync } from "./permia-relay";
import type { VaultData } from "@/types/vault";

const VAULT_STORAGE_KEY = "coallia_secure_vault";

// 🛡️ Nettoyage de sécurité : anciennes clés localStorage en clair, remplacées
// par le coffre unique chiffré. Exécuté une fois, au chargement du module
// (équivalent du nettoyage en tête de script.js).
localStorage.removeItem("coallia_inventory");
localStorage.removeItem("coallia_generic_loans");
localStorage.removeItem("coallia_med_logs");
localStorage.removeItem("coallia_trans_logs");

/**
 * Callback exécuté après chaque sauvegarde (rafraîchit le badge "en attente").
 * Enregistré depuis main.ts au démarrage : évite un import circulaire entre
 * ce module et src/ui/pending-badge.ts (qui lit lui-même l'état persisté).
 */
let apresSauvegarde: (() => void) | null = null;
export function definirCallbackApresSauvegarde(callback: () => void): void {
  apresSauvegarde = callback;
}

export function sauvegarderToutesLesDonnees(): void {
  const dataToSave: VaultData = {
    inventory: state.inventory,
    genericLoans: state.genericLoans,
    medLogs: state.medLogs,
    transLogs: state.transLogs,
    frigoLogs: state.frigoLogs,
    painLogs: state.painLogs,
    frigosData: state.frigosData,
    mecsComptageLogs: state.mecsComptageLogs,
    mediaData: state.mediaData,
    annuaireData: state.annuaireData,
    mediaLogs: state.mediaLogs
  };

  const jsonString = JSON.stringify(dataToSave);
  const cle = getCleMaitresse();
  if (!cle) {
    console.error("🛡️ Sécurité : Sauvegarde bloquée car le coffre est verrouillé.");
    return;
  }
  const donneesCryptees = chiffrer(jsonString, cle);

  // 💾 Sauvegarde locale (mode hors-ligne)
  // ⚠️ localStorage plafonne à ~5 Mo. Sans ce garde, une saturation
  //    interromprait la fonction AVANT l'envoi cloud, sans aucun signal.
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, donneesCryptees);
  } catch (err) {
    console.error("🛑 Mémoire locale saturée :", err);

    const badge = document.getElementById("offline-badge");
    if (badge) {
      badge.innerText = "⚠️ Mémoire pleine — sauvegarde locale impossible";
      badge.classList.remove("hidden");
    }
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    // On NE s'arrête pas : l'envoi cloud reste la meilleure chance de conserver les données.
  }

  // ☁️ SAUVEGARDE INSTANTANÉE SUR LE CLOUD (PUSH)
  if (navigator.onLine) {
    const cleAuth = getCleAuth();
    if (cleAuth) {
      pushCloudSync(cleAuth, donneesCryptees).catch(() => console.log("Sauvegarde Cloud reportée (Hors-ligne)"));
    }
  }

  apresSauvegarde?.();
}

export function dechiffrerCoffreLocal(): boolean {
  const coffreFort = localStorage.getItem(VAULT_STORAGE_KEY);
  if (!coffreFort) return false;

  const cleVault = getCleMaitresse();
  if (!cleVault) return false;

  // 1. Tentative avec la clé forte
  let donnees = tenterDechiffrement<VaultData>(coffreFort, cleVault);
  let migrationNecessaire = false;

  // 2. Repli : ancien coffre chiffré avec la clé faible (SHA-256)
  if (!donnees) {
    const cleLegacy = getCleAuth();
    if (cleLegacy) {
      donnees = tenterDechiffrement<VaultData>(coffreFort, cleLegacy);
      if (donnees) migrationNecessaire = true;
    }
  }

  if (!donnees) {
    console.error("🛑 Erreur : Clé invalide ou coffre corrompu.");
    return false;
  }

  state.mecsComptageLogs = donnees.mecsComptageLogs || [];
  if (donnees.inventory && donnees.inventory.length >= 32) {
    // 32 = ancien socle, à ne pas relever
    const inventaireActuel = state.inventory;
    state.inventory = donnees.inventory;

    // 🔄 FUSION : on réinjecte les articles ajoutés depuis la dernière sauvegarde
    //    (ex. nouveaux cuiseurs à riz) sans toucher aux prêts en cours.
    inventaireActuel.forEach((ref) => {
      if (!state.inventory.some((i) => i.id === ref.id)) {
        state.inventory.push({ ...ref });
      }
    });
    state.inventory.sort((a, b) => a.id - b.id);
  }
  state.genericLoans = donnees.genericLoans || [];
  state.medLogs = donnees.medLogs || [];
  state.transLogs = donnees.transLogs || [];
  state.frigoLogs = donnees.frigoLogs || [];
  state.painLogs = donnees.painLogs || [];
  state.mediaLogs = donnees.mediaLogs || [];
  state.frigosData = donnees.frigosData || state.frigosData;
  state.mediaData = donnees.mediaData || state.mediaData;
  state.annuaireData = donnees.annuaireData || state.annuaireData;

  // 🔄 Migration transparente vers le chiffrement renforcé
  if (migrationNecessaire) {
    console.log("🔄 Migration du coffre vers le chiffrement renforcé (PBKDF2)...");
    sauvegarderToutesLesDonnees();
  }

  return true;
}

interface LogAvecDate {
  synced?: boolean;
  timestamp?: number;
  idLog?: number;
  timestampDebut?: number;
}

function dateDuLog(log: LogAvecDate): number | null {
  return log.timestamp ?? log.idLog ?? log.timestampDebut ?? null;
}

function estRecent(log: LogAvecDate, now: number, fenetreMs: number): boolean {
  // 🛡️ On ne purge JAMAIS une entrée qui n'a pas atteint les registres
  //    institutionnels : sinon une panne réseau prolongée la ferait
  //    disparaître définitivement.
  if (log.synced === false) return true;

  const d = dateDuLog(log);
  if (!d) return true; // date inconnue → on garde par sécurité
  return now - d <= fenetreMs;
}

/** Nettoyage automatique (allège l'app) : conserve 4 jours de journaux. */
export function purgerDonneesAnciennes(): void {
  const QUATRE_JOURS_MS = 4 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // 1. On garde uniquement les transmissions des 4 derniers jours
  const transAvant = state.transLogs.length;
  state.transLogs = state.transLogs.filter((log) => log.synced === false || now - log.timestamp <= QUATRE_JOURS_MS);

  // 2. On garde les médicaments 4 jours (largement suffisant pour le Doliprane)
  const medAvant = state.medLogs.length;
  state.medLogs = state.medLogs.filter((log) => log.synced === false || now - log.timestamp <= QUATRE_JOURS_MS);

  // 3. 🛡️ MINIMISATION RGPD : les autres journaux nominatifs suivent la même règle.
  //    ⚠️ Chaque journal a son propre champ de date : timestamp / idLog / timestampDebut.
  //    En l'absence de date exploitable, on CONSERVE l'entrée (jamais de suppression à l'aveugle).
  const frigoAvant = state.frigoLogs.length;
  state.frigoLogs = state.frigoLogs.filter((log) => estRecent(log, now, QUATRE_JOURS_MS));

  const painAvant = state.painLogs.length;
  state.painLogs = state.painLogs.filter((log) => estRecent(log, now, QUATRE_JOURS_MS));

  const mediaAvant = state.mediaLogs.length;
  state.mediaLogs = state.mediaLogs.filter((log) => estRecent(log, now, QUATRE_JOURS_MS));

  const mecsAvant = state.mecsComptageLogs.length;
  state.mecsComptageLogs = state.mecsComptageLogs.filter((log) => estRecent(log, now, QUATRE_JOURS_MS));

  // Si le nettoyeur a effacé des choses, on met la sauvegarde secrète à jour
  const totalAvant = transAvant + medAvant + frigoAvant + painAvant + mediaAvant + mecsAvant;
  const totalApres =
    state.transLogs.length +
    state.medLogs.length +
    state.frigoLogs.length +
    state.painLogs.length +
    state.mediaLogs.length +
    state.mecsComptageLogs.length;

  if (totalAvant !== totalApres) {
    console.log(`🧹 Nettoyage auto : ${totalAvant - totalApres} entrées purgées (4 jours).`);
    sauvegarderToutesLesDonnees();
  }
}

interface SyncedLike {
  synced?: boolean;
}

/** Compteur d'éléments en attente : rend visible ce qui n'a pas encore atteint les registres institutionnels. */
export function compterEnAttente(): number {
  const journaux: SyncedLike[][] = [state.medLogs, state.transLogs, state.frigoLogs, state.painLogs, state.mediaLogs, state.mecsComptageLogs];
  let total = 0;
  journaux.forEach((j) => {
    if (Array.isArray(j)) total += j.filter((l) => l && l.synced === false).length;
  });
  return total;
}
