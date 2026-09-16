/**
 * Retour tactile partagé : contraction légère au clic/appui, relâchée ensuite.
 * Remplace les dizaines de `onmousedown="this.style.transform='scale(...)'"`
 * dupliqués dans l'ancien HTML par un seul utilitaire réutilisable.
 */
export function attacherEffetAppui(el: Element | null, scale = 0.95): void {
  if (!el) return;
  const appliquer = () => {
    (el as HTMLElement).style.transform = `scale(${scale})`;
  };
  const relacher = () => {
    (el as HTMLElement).style.transform = "scale(1)";
  };
  el.addEventListener("mousedown", appliquer);
  el.addEventListener("mouseup", relacher);
  el.addEventListener("mouseleave", relacher);
  el.addEventListener("touchstart", appliquer, { passive: true });
  el.addEventListener("touchend", relacher);
}
