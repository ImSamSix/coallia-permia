import { retour } from "@/services/feedback";

/**
 * Retour par glissement : un swipe vers la droite depuis n'importe quel point
 * de l'écran (pas seulement le bord) déclenche le même bouton "retour" que
 * celui déjà câblé en haut de chaque écran — un simple clic simulé une fois
 * le geste reconnu, sans animation propre à ce geste : l'écran réagit
 * exactement comme si on avait appuyé sur le bouton.
 */
const ID_BOUTON_RETOUR_PAR_VUE: Record<string, string> = {
  "cgu-view": "btn-cgu-retour",
  "plan-foyer-view": "btn-plan-foyer-retour",
  "main-app": "btn-materiel-retour",
  "med-app": "btn-medicaments-retour",
  "comptage-app": "comptage-back-btn",
  "media-app": "btn-media-retour",
  "notfound-app": "btn-404-retour"
};

const SEUIL_DISTANCE = 90; // px à parcourir pour valider le retour
const TOLERANCE_DEPART = 10; // px avant de trancher entre geste horizontal et scroll vertical
const RATIO_VERTICAL_MAX = 0.6; // au-delà, le geste est trop vertical pour être un retour

let boutonRetour: HTMLElement | null = null;
let depX = 0;
let depY = 0;
let dxCourant = 0;
let gesteHorizontalConfirme = false;
let gesteEnCoursDecision = false;
let gesteDejaDeclenche = false;

/** Comptage en cours ou récap final du relevé : le retour par geste est désactivé,
 *  exactement comme le bouton "← Retour" lui-même y est déjà masqué. */
function navigationBloqueeParComptage(): boolean {
  const workspace = document.getElementById("comptage-workspace");
  const rapport = document.getElementById("comptage-report-screen");
  const workspaceVisible = !!workspace && !workspace.classList.contains("hidden");
  const rapportVisible = !!rapport && !rapport.classList.contains("hidden");
  return workspaceVisible || rapportVisible;
}

function uneModaleEstOuverte(): boolean {
  return !!document.querySelector(".modal-overlay:not(.hidden)");
}

/** Zones où un glissement horizontal a déjà un sens propre (dessin, défilement
 *  latéral…) : on laisse le geste leur appartenir plutôt que de le capter. */
function zoneExclueDuRetour(cible: HTMLElement): boolean {
  if (cible.closest("canvas, input[type='range'], [data-no-swipe-back]")) return true;
  const scrollableHorizontal = cible.closest<HTMLElement>("[style*='overflow-x'], .filter-scroll-container");
  if (scrollableHorizontal && scrollableHorizontal.scrollWidth > scrollableHorizontal.clientWidth) return true;
  return false;
}

function trouverBoutonRetour(): HTMLElement | null {
  const vue = document.querySelector<HTMLElement>(".view:not(.hidden)");
  if (!vue) return null;
  const idBouton = ID_BOUTON_RETOUR_PAR_VUE[vue.id];
  if (!idBouton) return null; // écran sans retour possible (accueil, connexion, maintenance…)
  const bouton = document.getElementById(idBouton);
  if (!bouton || bouton.classList.contains("hidden")) return null; // ex. comptage : masqué pendant la tournée
  return bouton;
}

function reinitialiserGeste(): void {
  boutonRetour = null;
  dxCourant = 0;
  gesteHorizontalConfirme = false;
  gesteEnCoursDecision = false;
  gesteDejaDeclenche = false;
}

function onTouchStart(e: TouchEvent): void {
  if (e.touches.length !== 1) return;
  if (navigationBloqueeParComptage() || uneModaleEstOuverte()) return;

  const cible = e.target as HTMLElement;
  if (zoneExclueDuRetour(cible)) return;

  const bouton = trouverBoutonRetour();
  if (!bouton) return;

  boutonRetour = bouton;
  depX = e.touches[0].clientX;
  depY = e.touches[0].clientY;
  dxCourant = 0;
  gesteHorizontalConfirme = false;
  gesteDejaDeclenche = false;
  gesteEnCoursDecision = true;
}

function onTouchMove(e: TouchEvent): void {
  if (!gesteEnCoursDecision || !boutonRetour || gesteDejaDeclenche) return;

  const touche = e.touches[0];
  const dx = touche.clientX - depX;
  const dy = touche.clientY - depY;

  if (!gesteHorizontalConfirme) {
    if (Math.abs(dx) < TOLERANCE_DEPART && Math.abs(dy) < TOLERANCE_DEPART) return;

    // Un swipe vers la gauche ou un geste trop vertical ne concerne pas le
    // retour : on lâche prise immédiatement pour ne jamais gêner le scroll.
    if (dx <= 0 || Math.abs(dy) > Math.abs(dx) * RATIO_VERTICAL_MAX) {
      reinitialiserGeste();
      return;
    }

    gesteHorizontalConfirme = true;
  }

  // On empêche le scroll de page une fois le retour confirmé, comme sur iOS.
  e.preventDefault();
  dxCourant = Math.max(0, dx);

  // Dès que le seuil est franchi, on déclenche tout de suite (aussi réactif
  // qu'un appui direct sur le bouton), pas besoin d'attendre le relâchement.
  if (dxCourant > SEUIL_DISTANCE) {
    gesteDejaDeclenche = true;
    const bouton = boutonRetour;
    retour("appui");
    bouton.click();
  }
}

function onTouchEnd(): void {
  reinitialiserGeste();
}

/** Câble le retour par glissement sur tout l'écran, une seule fois au démarrage. */
export function initSwipeBack(): void {
  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("touchend", onTouchEnd, { passive: true });
  document.addEventListener("touchcancel", reinitialiserGeste, { passive: true });
}
