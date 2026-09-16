export function ouvrirCGU(): void {
  document.getElementById("login-screen")?.classList.add("hidden");
  document.getElementById("cgu-view")?.classList.remove("hidden");
}

export function fermerCGU(): void {
  document.getElementById("cgu-view")?.classList.add("hidden");
  document.getElementById("login-screen")?.classList.remove("hidden");
}

/** Câble le lien "Conditions d'utilisation" (login) et le bouton retour (en-tête CGU). */
export function initCguListeners(): void {
  document.getElementById("lien-cgu")?.addEventListener("click", ouvrirCGU);
  document.getElementById("btn-cgu-retour")?.addEventListener("click", fermerCGU);
}
