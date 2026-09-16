/** Échappe un texte pour une insertion sûre dans innerHTML (anti-XSS). */
export function securiserTexte(texte: string | null | undefined): string {
  if (!texte) return "";
  const div = document.createElement("div");
  div.textContent = texte;
  return div.innerHTML;
}

/** Zone de texte intelligente : hauteur ajustée automatiquement au contenu. */
export function autoResize(textarea: HTMLTextAreaElement): void {
  textarea.style.height = "auto"; // Réinitialise la hauteur
  textarea.style.height = textarea.scrollHeight + "px"; // Ajuste au texte
}

/** Câble l'auto-redimensionnement sur toutes les zones de texte de l'app (une fois au démarrage). */
export function initAutoResizeListeners(): void {
  document.querySelectorAll<HTMLTextAreaElement>("textarea").forEach((textarea) => {
    textarea.addEventListener("input", () => autoResize(textarea));
  });
}
