import { state } from "@/state/store";
import { sauvegarderToutesLesDonnees } from "@/services/storage";
import { synchroniserDonnees } from "@/services/sync";
import { fermerModals } from "@/ui/modals";
import { retour } from "@/services/feedback";
import type { PainLog } from "@/types/pain";

let painQty = 0;
const PAIN_QTY_MAX = 50;

export function ouvrirPainModal(): void {
  painQty = 0;
  updatePainDisplay();

  const obsInput = document.getElementById("pain-obs") as HTMLTextAreaElement | null;
  if (obsInput) {
    obsInput.value = "";
    obsInput.style.height = "54px";
  }
  document.getElementById("pain-modal")?.classList.remove("hidden");
}

function changePainQty(delta: number): void {
  const nouvelleQty = painQty + delta;
  if (nouvelleQty >= 0 && nouvelleQty <= PAIN_QTY_MAX) {
    painQty += delta;
    updatePainDisplay();
  }
}

function updatePainDisplay(): void {
  const displayEl = document.getElementById("pain-qty-display");
  if (!displayEl) return;

  displayEl.innerText = String(painQty);
  appliquerCouleurQty(displayEl, painQty);
}

// Application stricte de tes règles de couleur, en tons pastel (fond
// teinté + texte dans la couleur pleine) plutôt qu'un aplat saturé.
function appliquerCouleurQty(el: HTMLElement, qty: number): void {
  if (qty === 0) {
    el.style.backgroundColor = "rgba(52, 199, 89, 0.14)"; // Vert
    el.style.color = "var(--success)";
  } else if (qty >= 1 && qty <= 5) {
    el.style.backgroundColor = "rgba(255, 149, 0, 0.14)"; // Orange
    el.style.color = "var(--warning)";
  } else {
    el.style.backgroundColor = "rgba(255, 59, 48, 0.14)"; // Rouge
    el.style.color = "var(--danger)";
  }
}

export function validerPain(): void {
  const pro = localStorage.getItem("coallia_pro_prenom") || "";
  const timestamp = new Date();
  const heureExacte = timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const obsInput = document.getElementById("pain-obs") as HTMLTextAreaElement | null;
  const obsText = obsInput ? obsInput.value.trim() : "";

  const newLog: PainLog = {
    timestamp: timestamp.getTime(),
    date: timestamp.toLocaleDateString("fr-FR"),
    heure: heureExacte,
    educateur: pro,
    quantite_restante: painQty,
    observations: obsText,
    synced: false
  };

  state.painLogs.push(newLog);
  sauvegarderToutesLesDonnees();
  synchroniserDonnees();

  fermerModals(); // La pop-up se referme immédiatement
  retour("succes");

  // Confirmation dédiée : rappelle la quantité saisie (même code couleur
  // que le compteur) et l'heure d'enregistrement.
  const qtyEl = document.getElementById("pain-success-qty");
  if (qtyEl) {
    qtyEl.innerText = painQty === 0 ? "Aucun pain restant" : `${painQty} pain${painQty > 1 ? "s" : ""} restant${painQty > 1 ? "s" : ""}`;
    appliquerCouleurQty(qtyEl, painQty);
  }
  const timeEl = document.getElementById("pain-success-time");
  if (timeEl) timeEl.innerText = `Relevé de ${heureExacte} sécurisé dans le registre.`;
  document.getElementById("pain-success-modal")?.classList.remove("hidden");

  setTimeout(() => {
    document.getElementById("pain-success-modal")?.classList.add("hidden");
  }, 2200);
}

let painIntervalId: ReturnType<typeof setInterval> | null = null; // Stocke l'identifiant du compteur de temps

export function startPainInterval(delta: number): void {
  if (painIntervalId) return; // Sécurité : évite de lancer plusieurs compteurs en même temps

  // 1. On applique le premier changement immédiatement au clic
  changePainQty(delta);

  // 2. On lance la boucle automatique tant que le doigt reste posé (toutes les 150 millisecondes)
  painIntervalId = setInterval(() => {
    // Sécurité : on arrête la répétition automatique une fois la borne atteinte
    if ((delta > 0 && painQty >= PAIN_QTY_MAX) || (delta < 0 && painQty <= 0)) {
      stopPainInterval();
      return;
    }
    changePainQty(delta);
  }, 150);
}

export function stopPainInterval(): void {
  if (painIntervalId) {
    clearInterval(painIntervalId); // On détruit le compteur de temps
    painIntervalId = null;
  }
}

export function effacerObsPain(): void {
  const textarea = document.getElementById("pain-obs") as HTMLTextAreaElement | null;
  if (textarea) {
    textarea.value = "";
    textarea.style.height = "54px";
    textarea.focus();
  }
}

/** Câble la modale "Suivi du Pain" (boutons +/- à appui long, formulaire). */
export function initPainListeners(): void {
  const btnMoins = document.getElementById("btn-pain-moins");
  btnMoins?.addEventListener("mousedown", () => startPainInterval(-1));
  btnMoins?.addEventListener("mouseup", stopPainInterval);
  btnMoins?.addEventListener("mouseleave", stopPainInterval);
  btnMoins?.addEventListener("touchstart", (e) => { e.preventDefault(); startPainInterval(-1); });
  btnMoins?.addEventListener("touchend", stopPainInterval);
  btnMoins?.addEventListener("touchcancel", stopPainInterval);

  const btnPlus = document.getElementById("btn-pain-plus");
  btnPlus?.addEventListener("mousedown", () => startPainInterval(1));
  btnPlus?.addEventListener("mouseup", stopPainInterval);
  btnPlus?.addEventListener("mouseleave", stopPainInterval);
  btnPlus?.addEventListener("touchstart", (e) => { e.preventDefault(); startPainInterval(1); });
  btnPlus?.addEventListener("touchend", stopPainInterval);
  btnPlus?.addEventListener("touchcancel", stopPainInterval);

  document.getElementById("pain-obs-effacer")?.addEventListener("click", effacerObsPain);
  document.getElementById("btn-valider-pain")?.addEventListener("click", validerPain);
}
