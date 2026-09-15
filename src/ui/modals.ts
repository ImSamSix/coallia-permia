/** Ferme toutes les fenêtres modales ouvertes (utilitaire partagé par toutes les fonctionnalités). */
export function fermerModals(): void {
  document.querySelectorAll(".modal-overlay").forEach((m) => m.classList.add("hidden"));
}
