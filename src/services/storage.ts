import { state } from "@/state/store";
import { chiffrer, getCleAuth, getCleLegacy, getCleMaitresse, tenterDechiffrement } from "./crypto";
import { pushCloudSync, pushEtatOperationnel } from "./permia-relay";
import { retour } from "./feedback";
import { iconeAlerte } from "@/ui/icons";
import type { VaultData } from "@/types/vault";
import type { MediaKey } from "@/types/media";

function versIso(valeur: string | number | Date | null): string | null {
  if (!valeur) return null;
  const d = new Date(valeur);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

const VAULT_STORAGE_KEY = "coallia_secure_vault";

/**
 * "Karim BEN ALI" → "K. B. A." : minimisation RGPD pour le miroir Supabase,
 * stocké hors coffre chiffré. Les noms complets des jeunes (en majorité
 * mineurs) ne quittent plus l'appareil que chiffrés ; les initiales
 * suffisent à retrouver un prêt en cas de perte du téléphone.
 */
export function initiales(nom: string | null | undefined): string {
  const mots = (nom || "").trim().split(/\s+/).filter((m) => /\p{L}/u.test(m));
  if (mots.length === 0) return (nom || "").trim() === "-" ? "-" : "";
  return mots.map((m) => (m.match(/\p{L}/u)?.[0] ?? "").toUpperCase() + ".").join(" ");
}

// 🛡️ Nettoyage de sécurité : anciennes clés localStorage en clair, remplacées
// par le coffre unique chiffré. Exécuté une fois, au chargement du module
// (équivalent du nettoyage en tête de script.js).
localStorage.removeItem("coallia_inventory");
localStorage.removeItem("coallia_generic_loans");
localStorage.removeItem("coallia_med_logs");
localStorage.removeItem("coallia_trans_logs");
// Anciens brouillons en clair du formulaire "Transmissions" (fonctionnalité retirée).
["trans-type", "trans-titre", "trans-desc"].forEach((id) => localStorage.removeItem("autosave_" + id));

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
    frigoLogs: state.frigoLogs,
    painLogs: state.painLogs,
    frigosData: state.frigosData,
    mecsComptageLogs: state.mecsComptageLogs,
    mediaData: state.mediaData,
    annuaireData: state.annuaireData,
    mediaLogs: state.mediaLogs,
    majLe: Date.now()
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
      badge.classList.remove("succes");
      badge.classList.add("danger");
      badge.innerHTML = `<span class="status-pill-icone">${iconeAlerte(13)}</span><span>Mémoire pleine — sauvegarde locale impossible</span>`;
      badge.classList.remove("hidden");
    }
    retour("alerte");
    // On NE s'arrête pas : l'envoi cloud reste la meilleure chance de conserver les données.
  }

  // ☁️ SAUVEGARDE INSTANTANÉE SUR LE CLOUD (PUSH)
  if (navigator.onLine) {
    const cleAuth = getCleAuth();
    if (cleAuth) {
      pushCloudSync(cleAuth, donneesCryptees).catch(() => console.log("Sauvegarde Cloud reportée (Hors-ligne)"));

      // 📋 Miroir lisible (hors coffre) : matériel/frigos/média, pour ne pas
      // perdre le suivi opérationnel en cas de souci avec le téléphone unique.
      // Jeunes réduits à leurs initiales (voir initiales()).
      pushEtatOperationnel(cleAuth, {
        materiel: state.inventory.map((i) => ({
          id: i.id,
          category: i.category,
          name: i.name,
          status: i.status,
          jeune: initiales(i.jeune),
          pro: i.pro,
          time: versIso(i.time)
        })),
        frigos: state.frigosData.map((f) => ({
          id: f.id,
          name: f.name,
          cadenas: f.cad,
          hygiene: f.hyg,
          contenu: f.cont,
          time: versIso(f.time),
          pro: f.pro,
          residents: (f.residents || []).map(initiales)
        })),
        media: (Object.keys(state.mediaData) as MediaKey[]).map((key) => {
          const m = state.mediaData[key];
          return {
            id: key,
            name: m.name,
            status: m.status,
            jeune: initiales(m.jeune),
            pro: m.pro,
            time: versIso(m.time),
            last_jeune: initiales(m.lastJeune),
            last_time: m.lastTime
          };
        })
      }).catch(() => console.log("Miroir Supabase reporté (Hors-ligne)"));
    }
  }

  apresSauvegarde?.();
}

interface CoffreLu {
  donnees: VaultData;
  /** Chiffré avec l'ancienne clé faible : à réécrire avec la clé forte. */
  legacy: boolean;
}

/** Déchiffre un coffre avec la clé forte, ou à défaut l'ancienne clé faible (SHA-256). */
function lireCoffre(coffre: string): CoffreLu | null {
  const cleVault = getCleMaitresse();
  if (!cleVault) return null;

  const donnees = tenterDechiffrement<VaultData>(coffre, cleVault);
  if (donnees) return { donnees, legacy: false };

  const cleLegacy = getCleLegacy();
  const donneesLegacy = cleLegacy ? tenterDechiffrement<VaultData>(coffre, cleLegacy) : null;
  return donneesLegacy ? { donnees: donneesLegacy, legacy: true } : null;
}

function appliquerCoffre(donnees: VaultData): void {
  state.mecsComptageLogs = donnees.mecsComptageLogs || [];
  // Un relevé resté "PDF en attente" vient d'une génération interrompue
  // (app fermée pendant le rendu) : on l'envoie sans pièce jointe plutôt
  // que de le bloquer indéfiniment.
  state.mecsComptageLogs.forEach((log) => delete log.pdfEnAttente);
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
  state.frigoLogs = donnees.frigoLogs || [];
  state.painLogs = donnees.painLogs || [];
  state.mediaLogs = donnees.mediaLogs || [];
  state.frigosData = donnees.frigosData || state.frigosData;
  state.mediaData = donnees.mediaData || state.mediaData;
  state.annuaireData = donnees.annuaireData || state.annuaireData;
}

export function dechiffrerCoffreLocal(): boolean {
  const coffreFort = localStorage.getItem(VAULT_STORAGE_KEY);
  if (!coffreFort) return false;

  const lu = lireCoffre(coffreFort);
  if (!lu) {
    console.error("🛑 Erreur : Clé invalide ou coffre corrompu.");
    return false;
  }

  appliquerCoffre(lu.donnees);

  // 🔄 Migration transparente vers le chiffrement renforcé
  if (lu.legacy) {
    console.log("🔄 Migration du coffre vers le chiffrement renforcé (PBKDF2)...");
    sauvegarderToutesLesDonnees();
  }

  return true;
}

type JournalCle = "medLogs" | "frigoLogs" | "painLogs" | "mediaLogs" | "mecsComptageLogs";
const JOURNAUX: JournalCle[] = ["medLogs", "frigoLogs", "painLogs", "mediaLogs", "mecsComptageLogs"];

/**
 * Réinjecte dans `cible` les saisies de `source` qu'elle ne connaît pas
 * encore (faites hors-ligne, jamais parvenues au cloud), et reporte les
 * envois déjà confirmés par `source` (évite un double envoi au registre).
 * Renvoie true si `cible` a changé.
 */
function reporterJournaux(cible: VaultData, source: VaultData): boolean {
  let change = false;
  JOURNAUX.forEach((cle) => {
    const journalCible = (cible[cle] || []) as LogAvecDate[];
    const parDate = new Map<number, LogAvecDate>();
    journalCible.forEach((log) => {
      const d = dateDuLog(log);
      if (d !== null) parDate.set(d, log);
    });

    ((source[cle] || []) as LogAvecDate[]).forEach((log) => {
      const d = dateDuLog(log);
      if (d === null) return;
      const connu = parDate.get(d);
      if (!connu) {
        if (log.synced === false) {
          journalCible.push(log);
          change = true;
        }
      } else if (log.synced === true && connu.synced === false) {
        connu.synced = true;
        change = true;
      }
    });

    journalCible.sort((a, b) => (dateDuLog(a) ?? 0) - (dateDuLog(b) ?? 0));
    (cible as unknown as Record<JournalCle, LogAvecDate[]>)[cle] = journalCible;
  });
  return change;
}

/**
 * Adopte le coffre distant (connexion, rechargement) SANS écraser le travail
 * local : le coffre le plus récent sert de base (matériel, frigos,
 * annuaire…), puis les saisies locales jamais parvenues au cloud y sont
 * réinjectées. Avant, le coffre distant remplaçait tout : une saisie faite
 * hors-ligne puis suivie d'un verrouillage était perdue à la reconnexion.
 * Renvoie true si un coffre (local ou distant) a pu être ouvert.
 */
export function adopterCoffreDistant(coffreDistant: string | null | undefined): boolean {
  const distantExiste = !!coffreDistant && coffreDistant !== "null";
  const distant = distantExiste ? lireCoffre(coffreDistant as string) : null;
  if (!distant) {
    if (distantExiste) console.warn("⚠️ Coffre distant illisible : mémoire locale conservée.");
    return dechiffrerCoffreLocal();
  }

  const coffreLocal = localStorage.getItem(VAULT_STORAGE_KEY);
  const local = coffreLocal ? lireCoffre(coffreLocal) : null;

  let retenu: VaultData;
  let aReecrire: boolean;
  if (local && (local.donnees.majLe ?? 0) > (distant.donnees.majLe ?? 0)) {
    // Le téléphone a travaillé depuis la dernière sauvegarde cloud : sa
    // version sert de base, complétée par ce que le cloud a de plus.
    retenu = local.donnees;
    reporterJournaux(retenu, distant.donnees);
    aReecrire = true;
  } else {
    retenu = distant.donnees;
    aReecrire = distant.legacy;
    if (local && reporterJournaux(retenu, local.donnees)) aReecrire = true;
  }

  appliquerCoffre(retenu);

  if (aReecrire) {
    sauvegarderToutesLesDonnees(); // chiffre l'état fusionné, localement et vers le cloud
  } else {
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, coffreDistant as string);
    } catch (err) {
      console.error("🛑 Mémoire locale saturée :", err);
    }
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

  // 1. On garde les médicaments 4 jours (largement suffisant pour le Doliprane)
  const medAvant = state.medLogs.length;
  state.medLogs = state.medLogs.filter((log) => log.synced === false || now - log.timestamp <= QUATRE_JOURS_MS);

  // 2. 🛡️ MINIMISATION RGPD : les autres journaux nominatifs suivent la même règle.
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
  const totalAvant = medAvant + frigoAvant + painAvant + mediaAvant + mecsAvant;
  const totalApres =
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
  const journaux: SyncedLike[][] = [state.medLogs, state.frigoLogs, state.painLogs, state.mediaLogs, state.mecsComptageLogs];
  let total = 0;
  journaux.forEach((j) => {
    if (Array.isArray(j)) total += j.filter((l) => l && l.synced === false).length;
  });
  return total;
}
