import { state } from "@/state/store";
import { sauvegarderToutesLesDonnees } from "@/services/storage";
import { synchroniserDonnees } from "@/services/sync";
import { fermerModals } from "@/ui/modals";
import type { PainLog } from "@/types/pain";

let painQty = 0;

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
  if (painQty + delta >= 0) {
    painQty += delta;
    updatePainDisplay();
  }
}

function updatePainDisplay(): void {
  const displayEl = document.getElementById("pain-qty-display");
  if (!displayEl) return;

  displayEl.innerText = String(painQty);

  // Application stricte de tes règles de couleur
  if (painQty === 0) {
    displayEl.style.backgroundColor = "var(--success)"; // Vert
  } else if (painQty >= 1 && painQty <= 5) {
    displayEl.style.backgroundColor = "var(--warning)"; // Orange
  } else {
    displayEl.style.backgroundColor = "var(--danger)"; // Rouge
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

  // Déclenchement de la notification verte de confirmation
  const recordedTime = document.getElementById("modal-recorded-time");
  if (recordedTime) recordedTime.innerText = "à " + heureExacte;
  document.getElementById("med-success-modal")?.classList.remove("hidden");

  setTimeout(() => {
    document.getElementById("med-success-modal")?.classList.add("hidden");
  }, 2200);
}

let painIntervalId: ReturnType<typeof setInterval> | null = null; // Stocke l'identifiant du compteur de temps

export function startPainInterval(delta: number): void {
  if (painIntervalId) return; // Sécurité : évite de lancer plusieurs compteurs en même temps

  // 1. On applique le premier changement immédiatement au clic
  changePainQty(delta);

  // 2. On lance la boucle automatique tant que le doigt reste posé (toutes les 150 millisecondes)
  painIntervalId = setInterval(() => {
    // Sécurité : On bloque l'augmentation automatique si on dépasse 50 pains
    if (delta === 1 && painQty >= 50) {
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

  const btnPlus = document.getElementById("btn-pain-plus");
  btnPlus?.addEventListener("mousedown", () => startPainInterval(1));
  btnPlus?.addEventListener("mouseup", stopPainInterval);
  btnPlus?.addEventListener("mouseleave", stopPainInterval);
  btnPlus?.addEventListener("touchstart", (e) => { e.preventDefault(); startPainInterval(1); });
  btnPlus?.addEventListener("touchend", stopPainInterval);

  document.getElementById("pain-obs-effacer")?.addEventListener("click", effacerObsPain);
  document.getElementById("btn-valider-pain")?.addEventListener("click", validerPain);
}
