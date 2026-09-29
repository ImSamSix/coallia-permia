/** Bouton en cours de chargement : spinner devant le texte, clics bloqués.
 *  Le spinner tourne en `transform` (animé hors du fil principal) : il
 *  continue de tourner pendant un calcul lourd qui gèle le thread (PBKDF2,
 *  rendu d'un PDF...). */
export function afficherChargementBouton(btn: HTMLButtonElement, texte: string): void {
  const spinner = document.createElement("span");
  spinner.className = "btn-spinner";
  spinner.setAttribute("aria-hidden", "true");
  const libelle = document.createElement("span");
  libelle.textContent = texte;
  btn.replaceChildren(spinner, libelle);
  btn.classList.add("btn-chargement");
  btn.setAttribute("aria-busy", "true");
  btn.disabled = true;
}

export function retirerChargementBouton(btn: HTMLButtonElement, texte: string): void {
  btn.textContent = texte;
  btn.classList.remove("btn-chargement");
  btn.removeAttribute("aria-busy");
  btn.disabled = false;
}
