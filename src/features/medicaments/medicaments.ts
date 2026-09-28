import { state } from "@/state/store";
import { sauvegarderToutesLesDonnees } from "@/services/storage";
import { synchroniserDonnees } from "@/services/sync";
import { retour } from "@/services/feedback";
import { openMenu } from "@/features/navigation/navigation";
import { iconeAlerte } from "@/ui/icons";
import { securiserTexte } from "@/ui/dom-utils";
import type { MedLog } from "@/types/medication";

/** "  Élodie   MARTIN " → "elodie martin" : un même jeune saisi avec une casse, des accents ou des espaces différents reste reconnu. */
function normaliserNom(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function estParacetamol(medicament: string): boolean {
  const m = normaliserNom(medicament);
  return m.includes("doliprane") || m.includes("paracetamol");
}

export function openMedicaments(): void {
  document.getElementById("home-menu")?.classList.add("hidden");
  document.getElementById("med-app")?.classList.remove("hidden");
}

export function checkMedAutre(): void {
  const select = document.getElementById("med-type") as HTMLSelectElement;
  const containerAutre = document.getElementById("med-type-autre-container");
  const inputAutre = document.getElementById("med-type-autre") as HTMLTextAreaElement;

  if (select.value === "Autre") {
    containerAutre?.classList.remove("hidden");
  } else {
    containerAutre?.classList.add("hidden");
    inputAutre.value = "";
    inputAutre.style.height = "54px"; // Réinitialise la hauteur
  }
}

export function checkMotifAutre(): void {
  const select = document.getElementById("med-motif") as HTMLSelectElement;
  const containerAutre = document.getElementById("med-motif-autre-container");
  const inputAutre = document.getElementById("med-motif-autre") as HTMLTextAreaElement;

  if (select.value === "Autre") {
    containerAutre?.classList.remove("hidden");
  } else {
    containerAutre?.classList.add("hidden");
    inputAutre.value = "";
    inputAutre.style.height = "54px"; // Réinitialise la hauteur
  }
}

export function effacerMedAutre(): void {
  const textarea = document.getElementById("med-type-autre") as HTMLTextAreaElement;
  textarea.value = "";
  textarea.style.height = "54px";
  textarea.focus();
}

export function effacerMotifAutre(): void {
  const textarea = document.getElementById("med-motif-autre") as HTMLTextAreaElement;
  textarea.value = "";
  textarea.style.height = "54px";
  textarea.focus();
}

export function validerMedicament(): void {
  const educateur = localStorage.getItem("coallia_pro_prenom") || "";
  const nomJeune = (document.getElementById("med-nom-jeune") as HTMLInputElement).value.trim();

  const typeSelect = document.getElementById("med-type") as HTMLSelectElement;
  const motifSelect = document.getElementById("med-motif") as HTMLSelectElement;
  let typeMed = typeSelect.value;
  let symptome = motifSelect.value;

  const inputMedAutre = (document.getElementById("med-type-autre") as HTMLTextAreaElement).value.trim();
  const inputSymptomeAutre = (document.getElementById("med-motif-autre") as HTMLTextAreaElement).value.trim();

  if (typeMed === "Autre") typeMed = inputMedAutre;
  if (symptome === "Autre") symptome = inputSymptomeAutre;

  const nomJeuneEl = document.getElementById("med-nom-jeune") as HTMLInputElement;
  nomJeuneEl.classList.remove("input-error");
  typeSelect.classList.remove("input-error");
  motifSelect.classList.remove("input-error");

  let error = false;
  if (!nomJeune) {
    nomJeuneEl.classList.add("input-error");
    error = true;
  }
  if (!typeMed) {
    typeSelect.classList.add("input-error");
    error = true;
  }
  if (!symptome) {
    motifSelect.classList.add("input-error");
    error = true;
  }

  if (error) {
    const errorBubble = document.getElementById("med-error-bubble");
    if (errorBubble) {
      errorBubble.classList.add("bulle-erreur");
      errorBubble.innerHTML = `${iconeAlerte(16)}<span>Veuillez remplir tous les champs obligatoires</span>`;
      errorBubble.classList.remove("hidden");
    }

    retour("erreur");

    setTimeout(() => errorBubble?.classList.add("hidden"), 3000);
    return;
  }

  const nomJeuneClean = normaliserNom(nomJeune);

  // 🧹 Nettoyage des logs
  state.medLogs = state.medLogs.filter((log) => log.resident && log.resident.trim() !== "");

  // --- 🛡️ VÉRIFICATION DOLIPRANE (6H) ---
  if (estParacetamol(typeMed)) {
    const prisesJeune = state.medLogs.filter((log) => normaliserNom(log.resident) === nomJeuneClean && estParacetamol(log.medicament));

    if (prisesJeune.length > 0) {
      // La plus récente par horodatage (l'ordre du tableau n'est pas une garantie après fusion du coffre)
      const timeDernierePrise = new Date(Math.max(...prisesJeune.map((log) => log.timestamp)));
      const diffHeures = (new Date().getTime() - timeDernierePrise.getTime()) / (1000 * 60 * 60);

      if (diffHeures < 6) {
        const nextTime = new Date(timeDernierePrise.getTime() + 6 * 60 * 60 * 1000);
        const heurePossible = nextTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

        const alertText = document.getElementById("med-alert-text");
        if (alertText) {
          alertText.innerHTML = `
                    <b>${securiserTexte(nomJeune)}</b> a déjà pris du Doliprane/Paracétamol récemment.<br><br>
                    Prochaine prise autorisée à :<br>
                    <span style="display:inline-block; margin-top:15px; font-size: 26px; font-weight: 800; color: var(--text-dark); background: var(--input-bg); padding: 10px 20px; border-radius: 12px;">
                        ${heurePossible}
                    </span>
                `;
        }

        document.getElementById("med-alert-modal")?.classList.remove("hidden");
        retour("alerte");
        return;
      }
    }
  }

  // --- 💾 ENREGISTREMENT ---
  const timestamp = new Date();
  const heureExacte = timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = timestamp.toLocaleDateString("fr-FR");

  const dataToExport: MedLog = {
    timestamp: timestamp.getTime(),
    date: date,
    heure: heureExacte,
    educateur: educateur,
    resident: nomJeune,
    medicament: typeMed,
    symptome: symptome,
    synced: false
  };

  state.medLogs.push(dataToExport);
  sauvegarderToutesLesDonnees();
  synchroniserDonnees();
  retour("succes");

  // --- ✨ RÉINITIALISATION DE L'INTERFACE ---
  (document.getElementById("med-nom-jeune") as HTMLInputElement).value = "";
  typeSelect.value = "";
  motifSelect.value = "";
  checkMedAutre();
  checkMotifAutre();

  const recordedTime = document.getElementById("modal-recorded-time");
  if (recordedTime) recordedTime.innerText = "à " + heureExacte;
  document.getElementById("med-success-modal")?.classList.remove("hidden");

  setTimeout(() => {
    document.getElementById("med-success-modal")?.classList.add("hidden");
    openMenu();
  }, 2500);
}

// ==========================================
// 🕒 HORLOGE TEMPS RÉEL
// ==========================================
export function startClock(): void {
  setInterval(() => {
    const clockEl = document.getElementById("real-time-clock");
    if (clockEl && !document.getElementById("med-app")?.classList.contains("hidden")) {
      const now = new Date();
      clockEl.innerText = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }
  }, 1000);
}

/** Câble l'écran médicaments (retour, formulaire). */
export function initMedicamentsListeners(): void {
  document.getElementById("btn-medicaments-retour")?.addEventListener("click", openMenu);

  document.getElementById("med-type")?.addEventListener("change", checkMedAutre);
  document.getElementById("btn-effacer-med-autre")?.addEventListener("click", effacerMedAutre);
  document.getElementById("med-motif")?.addEventListener("change", checkMotifAutre);
  document.getElementById("btn-effacer-motif-autre")?.addEventListener("click", effacerMotifAutre);
  document.getElementById("btn-valider-medicament")?.addEventListener("click", validerMedicament);
}
