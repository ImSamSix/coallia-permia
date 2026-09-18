import { iconeAlerte, iconeCheckSucces, iconeErreurCercle } from "@/ui/icons";
import { securiserTexte } from "@/ui/dom-utils";
import { retour, type EvenementRetour } from "@/services/feedback";

export type ToastType = "info" | "erreur" | "succes";

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function icone(type: ToastType): string {
  if (type === "erreur") return iconeErreurCercle(18);
  if (type === "succes") return iconeCheckSucces(18);
  return iconeAlerte(18);
}

const EVENEMENT_PAR_TOAST: Record<ToastType, EvenementRetour> = {
  erreur: "erreur",
  succes: "succes",
  info: "appui"
};

/**
 * Notification flottante ponctuelle : remplace les `alert()` natifs, bloqués
 * par iOS hors geste utilisateur direct et de toute façon peu élégants.
 * Un seul élément DOM, créé à la demande et réutilisé pour chaque appel.
 */
export function afficherToast(message: string, type: ToastType = "info"): void {
  let toast = document.getElementById("toast-app");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-app";
    document.body.appendChild(toast);
  }

  toast.className = `toast-app toast-${type}`;
  toast.innerHTML = `${icone(type)}<span>${securiserTexte(message)}</span>`;

  // Relance l'animation même sur deux toasts d'affilée
  void toast.offsetWidth;
  toast.classList.add("visible");

  retour(EVENEMENT_PAR_TOAST[type]);

  if (toastTimer) clearTimeout(toastTimer);
  const toastEl = toast;
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("visible");
  }, 3200);
}
