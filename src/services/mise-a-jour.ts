/// <reference types="vite-plugin-pwa/client" />
/* ==========================================================================
   🔄 MISES À JOUR DE L'APP (service worker)
   Une nouvelle version déployée reste en attente ("waiting") tant qu'on ne
   l'active pas : sur une app installée (surtout iPhone), les fenêtres ne sont
   presque jamais toutes fermées, donc sans ce module l'ancienne version
   (failles comprises) survivrait des jours.
   On n'active JAMAIS d'office (pas de skipWaiting automatique) : la page
   ne se recharge que
     1. en silence, quand l'app est en arrière-plan ET qu'aucune saisie
        n'est en cours (voir rechargementSansRisque) ;
     2. quand l'utilisateur appuie sur « Mettre à jour » dans le bandeau.
   ========================================================================== */
import { registerSW } from "virtual:pwa-register";

const INTERVALLE_VERIF_MAJ_MS = 30 * 60 * 1000;

// Champs dont la valeur est une vraie saisie (on ignore cases à cocher, etc.)
const TYPES_SAISIE = new Set(["text", "search", "email", "tel", "url", "password", "number"]);

let activerVersionEnAttente: ((rechargerPage?: boolean) => Promise<void>) | null = null;
let enregistrement: ServiceWorkerRegistration | undefined;
let versionEnAttente = false;
let activationLancee = false;
let bandeau: HTMLElement | null = null;

/** Une fenêtre modale est ouverte (convention de l'app : .modal-overlay sans .hidden). */
function uneModaleEstOuverte(): boolean {
  return !!document.querySelector(".modal-overlay:not(.hidden)");
}

/** Relevé de présence en cours ou récap non envoyé : la progression ne vit
 *  qu'en mémoire, un rechargement la perdrait. */
function comptageEnCours(): boolean {
  return ["comptage-workspace", "comptage-report-screen"].some((id) => {
    const el = document.getElementById(id);
    return !!el && !el.classList.contains("hidden");
  });
}

function saisieEnCours(): boolean {
  const el = document.activeElement;
  if (el instanceof HTMLTextAreaElement) return el.value.trim() !== "";
  if (el instanceof HTMLInputElement) return TYPES_SAISIE.has(el.type) && el.value.trim() !== "";
  return false;
}

function rechargementSansRisque(): boolean {
  return !uneModaleEstOuverte() && !comptageEnCours() && !saisieEnCours();
}

function activerNouvelleVersion(): void {
  if (activationLancee || !activerVersionEnAttente) return;
  activationLancee = true;
  // Envoie SKIP_WAITING au SW en attente ; vite-plugin-pwa recharge la page
  // dès qu'il prend le contrôle (événement "controlling" / controllerchange).
  activerVersionEnAttente(true).catch(() => {
    activationLancee = false;
  });
}

function tenterActivationSilencieuse(): boolean {
  if (!versionEnAttente || document.visibilityState !== "hidden" || !rechargementSansRisque()) return false;
  activerNouvelleVersion();
  return true;
}

function afficherBandeau(): void {
  if (!bandeau) {
    bandeau = document.createElement("div");
    bandeau.className = "maj-bandeau";
    bandeau.setAttribute("role", "status");

    const texte = document.createElement("span");
    texte.className = "maj-bandeau-texte";
    texte.textContent = "Nouvelle version disponible";

    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "maj-bandeau-bouton";
    bouton.textContent = "Mettre à jour";
    bouton.addEventListener("click", () => {
      bouton.disabled = true;
      bouton.setAttribute("aria-busy", "true");
      bouton.setAttribute("aria-label", "Mise à jour en cours");
      const spinner = document.createElement("span");
      spinner.className = "maj-spinner";
      bouton.replaceChildren(spinner);
      activerNouvelleVersion();
    });

    bandeau.append(texte, bouton);
    document.body.appendChild(bandeau);
  }
  // Reflow forcé : pose l'état initial avant l'animation d'entrée (pas de
  // requestAnimationFrame, suspendu tant que l'app est en arrière-plan).
  void bandeau.offsetWidth;
  bandeau.classList.add("visible");
}

function verifierNouvelleVersion(): void {
  if (!enregistrement || enregistrement.installing || !navigator.onLine) return;
  enregistrement.update().catch(() => {
    /* hors-ligne ou serveur injoignable : on retentera au prochain passage */
  });
}

export function initMiseAJour(): void {
  if (!("serviceWorker" in navigator)) return;

  activerVersionEnAttente = registerSW({
    immediate: true,
    onNeedRefresh() {
      versionEnAttente = true;
      // Même trouvée en arrière-plan, une version bloquée par une saisie
      // affiche le bandeau : l'utilisateur le verra en revenant.
      if (!tenterActivationSilencieuse()) afficherBandeau();
    },
    onRegisteredSW(_url, registration) {
      enregistrement = registration;
      setInterval(verifierNouvelleVersion, INTERVALLE_VERIF_MAJ_MS);
    },
    onRegisterError(err) {
      console.error("🛑 Permia : Échec SW", err);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") verifierNouvelleVersion();
    else tenterActivationSilencieuse();
  });
}
