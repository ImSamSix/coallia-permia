import { state } from "@/state/store";
import { sauvegarderToutesLesDonnees } from "@/services/storage";
import { synchroniserDonnees } from "@/services/sync";
import { securiserTexte } from "@/ui/dom-utils";
import { fermerModals } from "@/ui/modals";
import { jouerSon } from "@/ui/sound";
import { vibrer } from "@/services/feedback";
import { attacherEffetAppui } from "@/ui/press-effect";
import { openMenu } from "@/features/navigation/navigation";
import type { MediaKey, MediaLog } from "@/types/media";

let activeMediaKey: MediaKey | null = null;
let isDrawing = false;
let sigCanvas: HTMLCanvasElement | null = null;
let sigCtx: CanvasRenderingContext2D | null = null;

export function openMediaApp(): void {
  document.getElementById("home-menu")?.classList.add("hidden");
  document.getElementById("media-app")?.classList.remove("hidden");
  renderMediaItems();
}

export function renderMediaItems(): void {
  const container = document.getElementById("media-list");
  if (!container) return;
  container.innerHTML = "";

  (Object.keys(state.mediaData) as MediaKey[]).forEach((key) => {
    const item = state.mediaData[key];
    const isAvail = item.status === "available";

    const actionButtonHTML = isAvail
      ? `<button class="media-btn media-btn-preter">Prêter</button>`
      : `<button class="media-btn media-btn-retour">Confirmer le retour</button>`;

    // ⚠️ Pour une carte "en prêt", le bouton de retour vit à la toute fin
    // du pied (après la signature), pas dans le corps : on le confirme
    // seulement une fois qu'on a vu à qui l'objet a été prêté.
    const footerHTML = isAvail
      ? `<div class="media-pied">
                   <span class="media-pied-lbl">Dernier emprunt</span>
                   <span class="media-pied-val">${securiserTexte(item.lastJeune)} · ${item.lastTime}</span>
               </div>`
      : `<div class="media-pied media-pied-actif">
                   <div class="media-pied-ligne">
                       <span class="media-pied-lbl">Emprunteur</span>
                       <span class="media-pied-val">${securiserTexte(item.jeune)}</span>
                   </div>
                   <div class="media-pied-ligne">
                       <span class="media-pied-lbl">Remis par</span>
                       <span class="media-pied-val">${securiserTexte(item.pro)}</span>
                   </div>
                   <div class="media-signature">
                       <span class="media-pied-lbl">Signature</span>
                       <img src="${item.signature}" alt="Signature de l'emprunteur">
                   </div>
                   ${actionButtonHTML}
               </div>`;

    const card = document.createElement("div");
    card.className = "item-card media-carte" + (isAvail ? "" : " media-carte-prete");
    card.innerHTML = `
            <div class="media-corps">
                <div class="media-entete">
                    <h3 class="media-nom">${item.name}</h3>
                    <span class="media-etat">
                        <span class="media-point"></span>${isAvail ? "Disponible" : "En prêt"}
                    </span>
                </div>
                ${isAvail ? actionButtonHTML : ""}
            </div>
            ${footerHTML}
        `;
    if (isAvail) {
      card.querySelector(".media-btn-preter")?.addEventListener("click", () => ouvrirModalPretMedia(key));
    } else {
      card.querySelector(".media-btn-retour")?.addEventListener("click", () => validerRetourMedia(key));
    }
    container.appendChild(card);
  });
}

export function ouvrirModalPretMedia(key: MediaKey): void {
  activeMediaKey = key;
  const desc = document.getElementById("media-modal-desc");
  if (desc) desc.innerText = `Prêt de : ${state.mediaData[key].name}`;

  // Réinitialisation des styles d'erreur à l'ouverture
  const nomInput = document.getElementById("media-jeune-name") as HTMLInputElement;
  nomInput.value = "";
  nomInput.classList.remove("input-error");

  document.getElementById("media-signature-container")?.classList.remove("input-error");
  document.getElementById("media-error-bubble")?.classList.add("hidden");
  document.getElementById("media-modal")?.classList.remove("hidden");

  initSignatureCanvas();
}

function initSignatureCanvas(): void {
  sigCanvas = document.getElementById("signature-pad") as HTMLCanvasElement | null;
  if (!sigCanvas) return;
  sigCtx = sigCanvas.getContext("2d");
  if (!sigCtx) return;

  // 🖋️ À L'ÉCRAN : le tracé suit le thème (confort visuel).
  //    À L'ENREGISTREMENT : il sera recoloré en sombre sur blanc (voir la capture).
  const isDark = document.body.classList.contains("dark-mode");
  sigCtx.strokeStyle = isDark ? "#ffffff" : "#1c1c1e";

  // Zone de signature clairement délimitée dans les deux thèmes
  sigCanvas.style.backgroundColor = isDark ? "#1c1c1e" : "#fbfbfd";
  sigCanvas.style.border = isDark ? "2px dashed #48484a" : "2px dashed #c7c7cc";
  sigCanvas.style.borderRadius = "12px";

  sigCtx.lineWidth = 3;
  sigCtx.lineCap = "round";
  sigCtx.lineJoin = "round";

  clearSignatureCanvas();

  // Événements tactiles Android
  sigCanvas.addEventListener(
    "touchstart",
    (e) => {
      isDrawing = true;
      const pos = getCanvasTouchPos(e);
      sigCtx?.beginPath();
      sigCtx?.moveTo(pos.x, pos.y);
    },
    { passive: false }
  );

  sigCanvas.addEventListener(
    "touchmove",
    (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getCanvasTouchPos(e);
      sigCtx?.lineTo(pos.x, pos.y);
      sigCtx?.stroke();
    },
    { passive: false }
  );

  window.addEventListener("touchend", () => {
    isDrawing = false;
  });

  // Événements souris (PC)
  sigCanvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    sigCtx?.beginPath();
    sigCtx?.moveTo(e.offsetX, e.clientY - (sigCanvas as HTMLCanvasElement).getBoundingClientRect().top);
  });
  sigCanvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    sigCtx?.lineTo(e.offsetX, e.clientY - (sigCanvas as HTMLCanvasElement).getBoundingClientRect().top);
    sigCtx?.stroke();
  });
  window.addEventListener("mouseup", () => {
    isDrawing = false;
  });
}

function getCanvasTouchPos(touchEvent: TouchEvent): { x: number; y: number } {
  const rect = (sigCanvas as HTMLCanvasElement).getBoundingClientRect();
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top
  };
}

export function clearSignatureCanvas(): void {
  if (!sigCanvas || !sigCtx) return;
  // 👑 On utilise clearRect pour effacer de manière transparente, laissant le fond gris CSS s'afficher naturellement
  sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
}

// Vérification de la présence d'un dessin sur le pad
function isCanvasBlank(): boolean {
  const canvas = sigCanvas as HTMLCanvasElement;
  const blank = document.createElement("canvas");
  blank.width = canvas.width;
  blank.height = canvas.height;
  return canvas.toDataURL() === blank.toDataURL();
}

export function validerPretMedia(): void {
  const inputNom = document.getElementById("media-jeune-name") as HTMLInputElement;
  const sigContainer = document.getElementById("media-signature-container");
  const errorBubble = document.getElementById("media-error-bubble");
  const nom = inputNom.value.trim();
  const pro = localStorage.getItem("coallia_pro_prenom") || "Inconnu";

  // Réinitialisation des états d'erreur
  inputNom.classList.remove("input-error");
  sigContainer?.classList.remove("input-error");
  errorBubble?.classList.add("hidden");

  // 👑 INTERCEPTION UNIFIÉE : Halo rouge sur le nom et/ou sur le pavé tactile de signature
  if (!nom || isCanvasBlank()) {
    if (!nom) inputNom.classList.add("input-error");
    if (isCanvasBlank()) sigContainer?.classList.add("input-error"); // 👑 Allume la signature en rouge

    errorBubble?.classList.remove("hidden");
    vibrer(200);
    jouerSon("error");
    return;
  }

  const now = new Date();

  // 💾 Enregistrement exclusif dans le module Multimédia
  const item = state.mediaData[activeMediaKey as MediaKey];
  item.status = "borrowed";
  item.jeune = nom;
  item.pro = pro;
  item.time = now.getTime();

  // 🖋️ NORMALISATION DE LA PIÈCE JUSTIFICATIVE
  //    Le tracé peut être blanc (mode sombre) ou noir (mode clair) à l'écran.
  //    On le recolore systématiquement en sombre sur fond blanc, pour que la
  //    signature archivée soit lisible partout : app, PDF, Excel, impression.
  const canvas = sigCanvas as HTMLCanvasElement;
  const canvasAplati = document.createElement("canvas");
  canvasAplati.width = canvas.width;
  canvasAplati.height = canvas.height;
  const ctxAplati = canvasAplati.getContext("2d") as CanvasRenderingContext2D;

  // 1. On copie le tracé (seuls les pixels dessinés sont opaques)
  ctxAplati.drawImage(canvas, 0, 0);

  // 2. On repeint tous les pixels du tracé en sombre, sans toucher au vide
  ctxAplati.globalCompositeOperation = "source-in";
  ctxAplati.fillStyle = "#1c1c1e";
  ctxAplati.fillRect(0, 0, canvasAplati.width, canvasAplati.height);

  // 3. On glisse un fond blanc DERRIÈRE le tracé
  ctxAplati.globalCompositeOperation = "destination-over";
  ctxAplati.fillStyle = "#FFFFFF";
  ctxAplati.fillRect(0, 0, canvasAplati.width, canvasAplati.height);

  item.signature = canvasAplati.toDataURL("image/jpeg", 0.7);

  // 👑 Génération de la ligne historique pour Excel
  const log: MediaLog = {
    idLog: Date.now(),
    type_action: "EMPRUNT",
    equipement: item.name,
    jeune: nom,
    professionnel: pro,
    date: now.toLocaleDateString("fr-FR"),
    heure: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    synced: false
  };
  state.mediaLogs.push(log);

  sauvegarderToutesLesDonnees();
  synchroniserDonnees();

  fermerModals();
  renderMediaItems();

  vibrer([50, 50]);
  jouerSon("success");
}

export function validerRetourMedia(key: MediaKey): void {
  const item = state.mediaData[key];
  const now = new Date();
  const formatTime = now.toLocaleDateString("fr-FR") + " à " + now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  // Mutation des logs historiques sur la carte
  item.lastJeune = item.jeune;
  item.lastTime = formatTime;

  // 👑 On stocke temporairement le nom avant de nettoyer l'objet
  const nomEmprunteur = item.jeune;

  // Libération de l'objet
  item.status = "available";
  item.jeune = "";
  item.pro = "";
  item.time = null;
  item.signature = "";

  // 👑 Génération de la ligne historique pour Excel
  const log: MediaLog = {
    idLog: Date.now(),
    type_action: "RETOUR",
    equipement: item.name,
    jeune: nomEmprunteur, // 🎯 Utilise la variable temporaire pour ne pas envoyer du vide !
    professionnel: localStorage.getItem("coallia_pro_prenom") || "Inconnu",
    date: now.toLocaleDateString("fr-FR"),
    heure: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    synced: false
  };
  state.mediaLogs.push(log);

  sauvegarderToutesLesDonnees();
  synchroniserDonnees();

  renderMediaItems();

  vibrer([50, 50]);
  jouerSon("success");
}

/** Câble l'écran Prêts Multimédia et sa modale de signature. */
export function initMediaListeners(): void {
  document.getElementById("btn-media-retour")?.addEventListener("click", openMenu);

  const btnEffacerSignature = document.getElementById("btn-effacer-signature");
  btnEffacerSignature?.addEventListener("click", clearSignatureCanvas);
  attacherEffetAppui(btnEffacerSignature, 0.95);

  document.getElementById("btn-valider-pret-media")?.addEventListener("click", validerPretMedia);
}
