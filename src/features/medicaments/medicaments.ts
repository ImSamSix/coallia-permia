import { state } from "@/state/store";
import { sauvegarderToutesLesDonnees } from "@/services/storage";
import { synchroniserDonnees } from "@/services/sync";
import { demanderConfirmation } from "@/ui/confirm-modal";
import { retour } from "@/services/feedback";
import { openMenu } from "@/features/navigation/navigation";
import { iconeAlerte, iconeCheckSucces } from "@/ui/icons";
import type { MedLog } from "@/types/medication";

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
      errorBubble.classList.remove("bulle-succes");
      errorBubble.classList.add("bulle-erreur");
      errorBubble.innerHTML = `${iconeAlerte(16)}<span>Veuillez remplir tous les champs obligatoires</span>`;
      errorBubble.classList.remove("hidden");
    }

    retour("erreur");

    setTimeout(() => errorBubble?.classList.add("hidden"), 3000);
    return;
  }

  const typeMedClean = typeMed.toLowerCase();
  const nomJeuneClean = nomJeune.toLowerCase();

  // 🧹 Nettoyage des logs
  state.medLogs = state.medLogs.filter((log) => log.resident && log.resident.trim() !== "");

  // --- 🛡️ VÉRIFICATION DOLIPRANE (6H) ---
  if (typeMedClean.includes("doliprane") || typeMedClean.includes("paracétamol") || typeMedClean.includes("paracetamol")) {
    const prisesJeune = state.medLogs.filter(
      (log) =>
        log.resident.toLowerCase() === nomJeuneClean &&
        (log.medicament.toLowerCase().includes("doliprane") || log.medicament.toLowerCase().includes("paracétamol") || log.medicament.toLowerCase().includes("paracetamol"))
    );

    if (prisesJeune.length > 0) {
      const dernierePrise = prisesJeune[prisesJeune.length - 1];
      const timeDernierePrise = new Date(dernierePrise.timestamp);
      const diffHeures = (new Date().getTime() - timeDernierePrise.getTime()) / (1000 * 60 * 60);

      if (diffHeures < 6) {
        const nextTime = new Date(timeDernierePrise.getTime() + 6 * 60 * 60 * 1000);
        const heurePossible = nextTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

        const alertText = document.getElementById("med-alert-text");
        if (alertText) {
          alertText.innerHTML = `
                    <b>${nomJeune}</b> a déjà pris du Doliprane/Paracétamol récemment.<br><br>
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
// 🕒 HORLOGE TEMPS RÉEL + COMMANDE SECRÈTE : PURGE DU REGISTRE (5s)
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

let resetTimer: ReturnType<typeof setTimeout>;

export function startResetTimer(): void {
  resetTimer = setTimeout(() => {
    purgerDonneesSecretement();
  }, 5000);
}

export function stopResetTimer(): void {
  clearTimeout(resetTimer);
}

function purgerDonneesSecretement(): void {
  // 🛡️ GARDE : cette purge est irréversible et se propage au cloud.
  //    Sur un téléphone partagé, un appui long involontaire ne doit jamais
  //    pouvoir effacer un registre réglementaire sans confirmation.
  if (state.medLogs.length === 0) {
    console.log("🤫 Purge demandée mais le registre est déjà vide.");
    return;
  }

  demanderConfirmation(
    "Effacer le registre médicaments ?",
    state.medLogs.length + " entrée(s) seront supprimées définitivement.\n" + "Cette action est irréversible et sera propagée au cloud.",
    executerPurgeMedicaments
  );
}

function executerPurgeMedicaments(): void {
  state.medLogs = [];

  sauvegarderToutesLesDonnees();

  const errorBubble = document.getElementById("med-error-bubble");
  if (errorBubble) {
    errorBubble.classList.remove("bulle-erreur");
    errorBubble.classList.add("bulle-succes");
    errorBubble.innerHTML = `${iconeCheckSucces(16)}<span>Historique médicaments purgé</span>`;
    errorBubble.classList.remove("hidden");

    retour("succes");

    setTimeout(() => {
      errorBubble.classList.add("hidden");
      setTimeout(() => errorBubble.classList.remove("bulle-succes"), 300);
    }, 3000);
  }

  console.log("🤫 Nettoyage des logs médicaments effectué. Inventaire préservé.");
}

/** Câble l'écran médicaments (retour, horloge secrète, formulaire). */
export function initMedicamentsListeners(): void {
  document.getElementById("btn-medicaments-retour")?.addEventListener("click", openMenu);

  const horloge = document.getElementById("real-time-clock");
  horloge?.addEventListener("mousedown", startResetTimer);
  horloge?.addEventListener("mouseup", stopResetTimer);
  horloge?.addEventListener("mouseleave", stopResetTimer);
  horloge?.addEventListener("touchstart", startResetTimer, { passive: true });
  horloge?.addEventListener("touchend", stopResetTimer);

  document.getElementById("med-type")?.addEventListener("change", checkMedAutre);
  document.getElementById("btn-effacer-med-autre")?.addEventListener("click", effacerMedAutre);
  document.getElementById("med-motif")?.addEventListener("change", checkMotifAutre);
  document.getElementById("btn-effacer-motif-autre")?.addEventListener("click", effacerMotifAutre);
  document.getElementById("btn-valider-medicament")?.addEventListener("click", validerMedicament);
}
