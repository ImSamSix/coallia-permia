import { effacerClesSession, getCleMaitresse } from "@/services/crypto";
import { sauvegarderToutesLesDonnees } from "@/services/storage";

// ==========================================
// 🔒 VERROUILLAGE AUTOMATIQUE (téléphone partagé)
// ==========================================
const DELAI_INACTIVITE_MS = 15 * 60 * 1000; // 15 minutes sans action
let dernierContact = Date.now();

export function signalerActivite(): void {
  dernierContact = Date.now();
}

export function verrouillerApp(motif: string): void {
  if (!getCleMaitresse()) return; // déjà verrouillé

  // 1. On sauvegarde AVANT de perdre la clé
  try {
    sauvegarderToutesLesDonnees();
  } catch (e) {
    console.error(e);
  }

  // 2. On efface les traces de session
  localStorage.removeItem("coallia_pro_prenom");
  localStorage.removeItem("coallia_session_expire");
  effacerClesSession();

  console.log("🔒 Verrouillage automatique :", motif);
  location.reload();
}

export function verifierSession(): void {
  if (!getCleMaitresse()) return;

  const expire = parseInt(localStorage.getItem("coallia_session_expire") || "0");

  if (expire && Date.now() > expire) {
    verrouillerApp("session de 8h expirée");
    return;
  }
  if (Date.now() - dernierContact > DELAI_INACTIVITE_MS) {
    verrouillerApp("inactivité prolongée");
  }
}

export function ouvrirLogout(): void {
  document.getElementById("logout-modal")?.classList.remove("hidden");
}

export function confirmerDeconnexion(): void {
  localStorage.removeItem("coallia_pro_prenom");
  localStorage.removeItem("coallia_session_expire");
  effacerClesSession();
  location.reload();
}

/** Câble le bouton de confirmation de déconnexion ("Rester connecté" est un data-close-modal générique). */
export function initSessionListeners(): void {
  document.getElementById("btn-confirmer-deconnexion")?.addEventListener("click", confirmerDeconnexion);
}
