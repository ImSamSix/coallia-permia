import { getCleMaitresse } from "@/services/crypto";
import { compterEnAttente } from "@/services/storage";

/** Compteur d'éléments en attente : rend visible ce qui n'a pas encore atteint les registres institutionnels. */
export function rafraichirBadgeAttente(): void {
  const badge = document.getElementById("pending-badge");
  const texte = document.getElementById("pending-texte");
  if (!badge || !texte) return;

  // Masqué si personne n'est connecté
  if (!getCleMaitresse()) {
    badge.classList.add("hidden");
    return;
  }

  const n = compterEnAttente();
  if (n === 0) {
    badge.classList.add("hidden");
    return;
  }

  texte.innerText = n === 1 ? "1 saisie en attente d'envoi" : n + " saisies en attente d'envoi";
  badge.classList.toggle("alerte", n >= 20);
  badge.classList.remove("hidden");
}
