import { state } from "@/state/store";
import { sauvegarderToutesLesDonnees } from "@/services/storage";
import { fermerModals } from "@/ui/modals";
import { retour } from "@/services/feedback";
import { afficherToast } from "@/ui/toast";
import type { AnnuaireRole } from "@/types/annuaire";

export function ouvrirAnnuaire(): void {
  fermerModals(); // Ferme le menu Pro
  document.getElementById("annuaire-modal")?.classList.remove("hidden");
}

// --- LOGIQUE D'APPUI LONG ET ÉDITION ANNUAIRE ---
let contactTimer: ReturnType<typeof setTimeout>;
let isContactLongPress = false;
let currentEditRole: AnnuaireRole | "" = "";

export function startContactTimer(role: AnnuaireRole): void {
  isContactLongPress = false;
  contactTimer = setTimeout(() => {
    isContactLongPress = true; // Empêche l'appel classique de se lancer
    retour("succes");
    ouvrirEditContact(role);
  }, 5000); // 5 secondes
}

export function cancelContactTimer(): void {
  clearTimeout(contactTimer);
}

export function appelerContact(role: AnnuaireRole): void {
  if (isContactLongPress) return; // Si on a fait un appui long, on annule l'appel

  const numero = state.annuaireData[role];
  if (!numero || numero.trim() === "") {
    afficherToast("Aucun numéro n'est enregistré pour ce contact. Restez appuyé 5s pour l'ajouter.", "erreur");
    return;
  }
  // Lance l'appel téléphonique nativement
  window.location.href = "tel:" + numero;
}

function ouvrirEditContact(role: AnnuaireRole): void {
  currentEditRole = role;
  let titre = "";
  if (role === "tech") titre = "Agent Technique";
  if (role === "coordF") titre = "Coordinatrice";
  if (role === "coordM") titre = "Coordinateur";
  if (role === "chef") titre = "Chef de service";
  if (role === "astreinte1") titre = "Astreinte N°1";
  if (role === "astreinte2") titre = "Astreinte N°2";

  // Prépare la fenêtre
  const titleEl = document.getElementById("edit-contact-title");
  if (titleEl) titleEl.innerText = "Modifier : " + titre;
  (document.getElementById("edit-contact-input") as HTMLInputElement).value = state.annuaireData[role] || "";

  // Bascule des fenêtres
  document.getElementById("annuaire-modal")?.classList.add("hidden");
  document.getElementById("edit-contact-modal")?.classList.remove("hidden");
}

export function validerEditContact(): void {
  const newNum = (document.getElementById("edit-contact-input") as HTMLInputElement).value.trim();

  // Sauvegarde en mémoire et dans le coffre crypté
  if (currentEditRole) state.annuaireData[currentEditRole] = newNum;
  sauvegarderToutesLesDonnees();

  // Retour à l'annuaire
  document.getElementById("edit-contact-modal")?.classList.add("hidden");
  document.getElementById("annuaire-modal")?.classList.remove("hidden");

  retour("succes");
}

function fermerAnnuaire(): void {
  document.getElementById("annuaire-modal")?.classList.add("hidden");
}

function annulerEditContact(): void {
  document.getElementById("edit-contact-modal")?.classList.add("hidden");
  document.getElementById("annuaire-modal")?.classList.remove("hidden");
}

const ROLES_ANNUAIRE: AnnuaireRole[] = ["astreinte1", "astreinte2", "coordF", "coordM", "chef", "tech"];

/** Câble l'annuaire d'urgence : fermeture, appui long par contact, édition. */
export function initAnnuaireListeners(): void {
  document.getElementById("ann-fermer")?.addEventListener("click", fermerAnnuaire);

  ROLES_ANNUAIRE.forEach((role) => {
    const el = document.getElementById(`ann-contact-${role}`);
    if (!el) return;
    el.addEventListener("mousedown", () => startContactTimer(role));
    el.addEventListener("mouseup", cancelContactTimer);
    el.addEventListener("mouseleave", cancelContactTimer);
    el.addEventListener("touchstart", () => startContactTimer(role), { passive: true });
    el.addEventListener("touchend", cancelContactTimer);
    el.addEventListener("click", () => appelerContact(role));
  });

  document.getElementById("btn-annuler-edit-contact")?.addEventListener("click", annulerEditContact);
  document.getElementById("btn-valider-edit-contact")?.addEventListener("click", validerEditContact);
}
