import { vibrer } from "@/services/feedback";

/**
 * Confirmation in-app : confirm() natif est bloqué par iOS hors geste
 * utilisateur direct (ex. appel depuis un setTimeout) — on passe par une
 * modale maison partagée par tous les modules (purge médicaments, purge
 * frigos, etc.).
 */
let actionAConfirmer: (() => void) | null = null;

export function demanderConfirmation(titre: string, texte: string, callback: () => void): void {
  actionAConfirmer = callback;
  const titreEl = document.getElementById("confirm-titre");
  const texteEl = document.getElementById("confirm-texte");
  if (titreEl) titreEl.innerText = titre;
  if (texteEl) texteEl.innerText = texte;
  document.getElementById("confirm-modal")?.classList.remove("hidden");
  vibrer([60, 40, 60]);
}

export function annulerConfirmation(): void {
  actionAConfirmer = null;
  document.getElementById("confirm-modal")?.classList.add("hidden");
  console.log("🛡️ Action annulée par le professionnel.");
}

export function validerConfirmation(): void {
  document.getElementById("confirm-modal")?.classList.add("hidden");
  const action = actionAConfirmer;
  actionAConfirmer = null;
  action?.();
}

/** Câble les deux boutons de la modale de confirmation générique. */
export function initConfirmModalListeners(): void {
  document.getElementById("btn-annuler-confirmation")?.addEventListener("click", annulerConfirmation);
  document.getElementById("btn-valider-confirmation")?.addEventListener("click", validerConfirmation);
}
