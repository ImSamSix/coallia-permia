import { jouerSon } from "./sound";

/** Signature créateur : bannière d'amour + pluie de cœurs (5 clics rapides). */
export function afficherBanniereAmour(): void {
  if (document.getElementById("easter-banner")) return;

  const banner = document.createElement("div");
  banner.id = "easter-banner";
  banner.innerText = "💙 V•C•D•N•S 💙";
  banner.style.position = "fixed";
  banner.style.top = "20px";
  banner.style.left = "50%";
  banner.style.transform = "translateX(-50%)";
  banner.style.background = "linear-gradient(135deg, #ff2d55 0%, #ff3b30 100%)";
  banner.style.color = "white";
  banner.style.padding = "12px 24px";
  banner.style.borderRadius = "20px";
  banner.style.fontWeight = "800";
  banner.style.fontSize = "15px";
  banner.style.boxShadow = "0 8px 20px rgba(255, 45, 85, 0.4)";
  banner.style.zIndex = "999999";
  banner.style.whiteSpace = "nowrap";
  banner.style.animation = "slideDownBanner 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

  document.body.appendChild(banner);

  jouerSon("success");

  setTimeout(() => {
    banner.style.animation = "slideUpBanner 0.5s ease-in forwards";
    setTimeout(() => banner.remove(), 500);
  }, 4000);
}

export function creerPluieDeCoeurs(): void {
  const nbCoeurs = 40;
  for (let i = 0; i < nbCoeurs; i++) {
    setTimeout(() => {
      const coeur = document.createElement("div");
      coeur.innerHTML = "❤️";
      coeur.className = "coeur-tombant";
      coeur.style.left = Math.random() * 100 + "vw";
      coeur.style.fontSize = Math.random() * 20 + 15 + "px";
      coeur.style.animationDuration = Math.random() * 2 + 2 + "s";
      document.body.appendChild(coeur);

      setTimeout(() => {
        coeur.remove();
      }, 5000);
    }, i * 80);
  }
}

let easterEggClicks = 0;
let easterEggTimer: ReturnType<typeof setTimeout>;

export function clicEasterEggAccueil(): void {
  easterEggClicks++;
  clearTimeout(easterEggTimer);

  // Si on arrête de cliquer pendant 2 secondes, ça retombe à zéro
  easterEggTimer = setTimeout(() => {
    easterEggClicks = 0;
  }, 2000);

  if (easterEggClicks === 5) {
    afficherBanniereAmour();
    creerPluieDeCoeurs();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    easterEggClicks = 0;
  }
}
