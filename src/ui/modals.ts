/** Ferme toutes les fenêtres modales ouvertes (utilitaire partagé par toutes les fonctionnalités). */
export function fermerModals(): void {
  document.querySelectorAll(".modal-overlay").forEach((m) => m.classList.add("hidden"));
}

/**
 * Câble en une seule fois tous les boutons "Annuler / Fermer / J'ai compris"
 * (marqués `data-close-modal` dans le HTML) sur fermerModals(). Remplace les
 * ~17 `onclick="fermerModals()"` dupliqués dans l'ancien HTML.
 */
export function initFermetureModals(): void {
  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", fermerModals);
  });
}
