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
  purgerToutAutosave();

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
  purgerToutAutosave();
  location.reload();
}

// ==========================================
// 24. AUTOSAVE DES FORMULAIRES
// ==========================================
// La Demande d'Intervention a été retirée de Permia (elle vit désormais
// exclusivement dans Habita) : seuls les champs de transmissions restent
// dans cette liste, exactement comme avant leur retrait.
const champsASauvegarder = ["trans-type", "trans-titre", "trans-desc"];

export function initialiserAutosave(): void {
  champsASauvegarder.forEach((id) => {
    const champ = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
    if (champ) {
      // 1. Restauration au démarrage si une sauvegarde existe
      const sauvegarde = localStorage.getItem("autosave_" + id);
      if (sauvegarde) {
        champ.value = sauvegarde;
        // Si c'est une zone de texte, on ajuste sa hauteur automatiquement
        if (champ.tagName.toLowerCase() === "textarea") {
          champ.style.height = "auto";
          champ.style.height = champ.scrollHeight + "px";
        }
      }

      // 2. Sauvegarde à chaque fois que l'utilisateur tape ou change une valeur
      champ.addEventListener("input", () => {
        localStorage.setItem("autosave_" + id, champ.value);
      });
      champ.addEventListener("change", () => {
        localStorage.setItem("autosave_" + id, champ.value);
      });
    }
  });
}

/** Vide la mémoire une fois le message envoyé. */
export function purgerAutosave(typeFormulaire: "trans"): void {
  let champsAVider: string[] = [];
  if (typeFormulaire === "trans") {
    champsAVider = ["trans-type", "trans-titre", "trans-desc"];
  }

  champsAVider.forEach((id) => {
    localStorage.removeItem("autosave_" + id);
  });
}

/** 🛡️ SÉCURITÉ RGPD : Efface TOUS les brouillons en clair du localStorage. */
export function purgerToutAutosave(): void {
  champsASauvegarder.forEach((id) => {
    localStorage.removeItem("autosave_" + id);
  });
}

/** Câble le bouton de confirmation de déconnexion ("Rester connecté" est un data-close-modal générique). */
export function initSessionListeners(): void {
  document.getElementById("btn-confirmer-deconnexion")?.addEventListener("click", confirmerDeconnexion);
}
