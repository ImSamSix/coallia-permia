import { state } from "@/state/store";
import { sauvegarderToutesLesDonnees } from "@/services/storage";
import { fermerModals } from "@/ui/modals";
import { jouerSon } from "@/ui/sound";
import type { AnnuaireRole } from "@/types/annuaire";

export function ouvrirAnnuaire(): void {
  fermerModals(); // Ferme le menu Pro
  document.getElementById("annuaire-modal")?.classList.remove("hidden");
}

export function retourMenuPro(): void {
  fermerModals(); // Ferme l'annuaire
  document.getElementById("pro-menu-modal")?.classList.remove("hidden");
}

// --- LOGIQUE D'APPUI LONG ET ÉDITION ANNUAIRE ---
let contactTimer: ReturnType<typeof setTimeout>;
let isContactLongPress = false;
let currentEditRole: AnnuaireRole | "" = "";

export function startContactTimer(role: AnnuaireRole): void {
  isContactLongPress = false;
  contactTimer = setTimeout(() => {
    isContactLongPress = true; // Empêche l'appel classique de se lancer
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
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
    alert("⚠️ Aucun numéro n'est enregistré pour ce contact. Restez appuyé 5s pour l'ajouter.");
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

  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  jouerSon("success");
}
