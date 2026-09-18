import { getCleMaitresse } from "@/services/crypto";
import { compterEnAttente } from "@/services/storage";
import { iconeAlerte, iconeEnvoiCloud } from "@/ui/icons";

/** Compteur d'éléments en attente : rend visible ce qui n'a pas encore atteint les registres institutionnels. */
export function rafraichirBadgeAttente(): void {
  const badge = document.getElementById("pending-badge");
  const texte = document.getElementById("pending-texte");
  const icone = document.getElementById("pending-badge-icone");
  if (!badge || !texte || !icone) return;

  // Masqué si personne n'est connecté
  if (!getCleMaitresse()) {
    badge.classList.add("hidden");
    return;
  }

  // 📡 Avec une connexion, une saisie ne reste "en attente" que quelques
  // instants (synchronisation quasi immédiate) : afficher la bulle quand
  // même donnerait l'impression, à tort, que l'app peine à envoyer les
  // données. Elle ne sert donc plus qu'à signaler un vrai mode hors-ligne
  // (réseau coupé ou avion) — c'est là qu'une file d'attente a un sens.
  if (navigator.onLine) {
    badge.classList.add("hidden");
    return;
  }

  const n = compterEnAttente();
  if (n === 0) {
    badge.classList.add("hidden");
    return;
  }

  texte.innerText = n === 1 ? "1 saisie en attente d'envoi" : n + " saisies en attente d'envoi";
  // Au-delà de 20 saisies, l'attente devient anormale : l'icône bascule sur
  // un avertissement plutôt que la simple icône d'envoi.
  const surcharge = n >= 20;
  badge.classList.toggle("alerte", surcharge);
  icone.innerHTML = surcharge ? iconeAlerte(13) : iconeEnvoiCloud(13);
  badge.classList.remove("hidden");
}
