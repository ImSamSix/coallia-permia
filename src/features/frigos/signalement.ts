import { getCleAuth } from "@/services/crypto";
import { envoyerPayload } from "@/services/permia-relay";
import { fermerModals } from "@/ui/modals";
import { jouerSon } from "@/ui/sound";
import { vibrer } from "@/services/feedback";
import { attacherEffetAppui } from "@/ui/press-effect";

// --- LOGIQUE PHOTO FRIGOS ---
export function declencherCamera(): void {
  document.getElementById("input-camera-cache")?.click();
}

let photoBase64Temp = "";

// Bouton "Reprendre une photo"
export function reprendrePhotoSig(): void {
  document.getElementById("input-camera-cache")?.click();
}

/** Câble le gestionnaire de la caméra (input file caché) — appelé une fois au démarrage. */
export function initSignalementCamera(): void {
  const input = document.getElementById("input-camera-cache") as HTMLInputElement | null;
  if (!input) return;

  input.addEventListener("change", function (e) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      vibrer(50);

      const file = target.files[0];
      const reader = new FileReader();

      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          // Compression de l'image (MAX 1000px)
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1000;
          let scaleSize = 1;
          if (img.width > MAX_WIDTH) {
            scaleSize = MAX_WIDTH / img.width;
          }
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          photoBase64Temp = canvas.toDataURL("image/jpeg", 0.7);

          // Mettre à jour le design de l'aperçu
          const preview = document.getElementById("photo-preview") as HTMLElement;
          preview.style.backgroundImage = `url(${photoBase64Temp})`;
          preview.style.display = "block";
          (document.getElementById("btn-reprendre-photo") as HTMLElement).style.display = "none";

          // On affiche la croix (en mode flex pour bien centrer le ✕)
          (document.getElementById("btn-effacer-photo") as HTMLElement).style.display = "flex";

          // On enlève les pointillés et l'éventuelle bordure rouge d'erreur
          (document.getElementById("sig-photo-container") as HTMLElement).style.border = "none";

          // Ouvrir la modale automatiquement
          document.getElementById("signalement-modal")?.classList.remove("hidden");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);

      target.value = ""; // Réinitialise l'input
    }
  });
}

// Effacer la photo de l'aperçu
export function effacerPhotoSig(): void {
  photoBase64Temp = "";
  const preview = document.getElementById("photo-preview") as HTMLElement;
  preview.style.backgroundImage = "none";
  preview.style.display = "none";
  (document.getElementById("btn-effacer-photo") as HTMLElement).style.display = "none";
  (document.getElementById("btn-reprendre-photo") as HTMLElement).style.display = "block";
  (document.getElementById("sig-photo-container") as HTMLElement).style.border = "2px dashed var(--coallia-blue)";
}

// Effacer le texte de la description
export function effacerDescSig(): void {
  const textarea = document.getElementById("sig-desc") as HTMLTextAreaElement;
  textarea.value = "";
  textarea.style.height = "80px"; // Hauteur de base corrigée
  textarea.focus();
}

// Envoyer le paquet au serveur
export async function envoyerSignalement(): Promise<void> {
  const frigoSelect = document.getElementById("sig-frigo-select") as HTMLSelectElement;
  const descInput = document.getElementById("sig-desc") as HTMLTextAreaElement;
  const photoContainer = document.getElementById("sig-photo-container") as HTMLElement;
  const errorBubble = document.getElementById("sig-error-bubble") as HTMLElement;

  const frigo = frigoSelect.value;
  const desc = descInput.value.trim();
  const proName = localStorage.getItem("coallia_pro_prenom") || "Inconnu";

  // 1. Réinitialisation des erreurs visuelles
  frigoSelect.classList.remove("input-error");
  descInput.classList.remove("input-error");
  if (!photoBase64Temp) photoContainer.style.border = "2px dashed var(--coallia-blue)";

  let hasError = false;

  // 2. Vérifications avec bordures rouges
  if (!photoBase64Temp) {
    photoContainer.style.border = "2px dashed var(--danger)";
    hasError = true;
  }
  if (!frigo) {
    frigoSelect.classList.add("input-error");
    hasError = true;
  }
  if (!desc) {
    descInput.classList.add("input-error");
    hasError = true;
  }

  // 3. Affichage de la bulle si erreur
  if (hasError) {
    errorBubble.innerText = "⚠️ Veuillez remplir tous les champs et joindre une photo.";
    errorBubble.classList.remove("hidden");
    vibrer([200]);
    setTimeout(() => errorBubble.classList.add("hidden"), 3000);
    return;
  }

  const now = new Date();
  const btn = document.getElementById("btn-envoyer-sig") as HTMLButtonElement;
  // Anneau de chargement animé (@keyframes spinSmooth, déjà global) plutôt
  // qu'un emoji sablier : même principe que le bouton de génération de PDF.
  btn.innerHTML = `
    <span style="display:inline-flex; align-items:center; justify-content:center; gap:7px; white-space:nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" style="flex-shrink:0; animation: spinSmooth 0.8s linear infinite;"><circle cx="12" cy="12" r="9" stroke-dasharray="28 100"></circle></svg>
      Envoi...
    </span>`;
  btn.disabled = true;

  const base64Data = photoBase64Temp.split(",")[1];

  const cleAuth = getCleAuth();

  try {
    if (!cleAuth) throw new Error("Coffre verrouillé");

    const reponse = await envoyerPayload(cleAuth, {
      type: "frigo_signalement",
      date: now.toLocaleDateString("fr-FR"),
      heure: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      educateur: proName,
      nomFrigo: frigo,
      description: desc,
      photoBase64: base64Data
    });

    if (reponse.ok) {
      fermerModals();

      effacerPhotoSig();
      frigoSelect.value = "";
      effacerDescSig();

      vibrer([100, 50, 100]);
      jouerSon("success");

      document.getElementById("sig-success-modal")?.classList.remove("hidden");

      setTimeout(() => {
        document.getElementById("sig-success-modal")?.classList.add("hidden");
      }, 2500);
    } else {
      errorBubble.innerText = "❌ Erreur serveur. L'image est peut-être trop lourde.";
      errorBubble.classList.remove("hidden");
      setTimeout(() => errorBubble.classList.add("hidden"), 3000);
    }
  } catch {
    errorBubble.innerText = "❌ Connexion perdue. Impossible d'envoyer.";
    errorBubble.classList.remove("hidden");
    setTimeout(() => errorBubble.classList.add("hidden"), 3000);
  }

  btn.innerText = "Envoyer";
  btn.disabled = false;
}

/** Câble la modale de signalement photo. */
export function initSignalementListeners(): void {
  const btnReprendre = document.getElementById("btn-reprendre-photo");
  btnReprendre?.addEventListener("click", reprendrePhotoSig);
  attacherEffetAppui(btnReprendre, 0.9);

  document.getElementById("btn-effacer-photo")?.addEventListener("click", effacerPhotoSig);
  document.getElementById("sig-desc-effacer")?.addEventListener("click", effacerDescSig);
  document.getElementById("btn-envoyer-sig")?.addEventListener("click", envoyerSignalement);
}
