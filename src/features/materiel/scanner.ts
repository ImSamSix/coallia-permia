import { state } from "@/state/store";
import { retour } from "@/services/feedback";
import { afficherToast } from "@/ui/toast";
import { clicCarteUnique } from "./materiel";

let html5QrCode: Html5Qrcode | null = null;
let isScanning = false;
let torcheActive = false;

/**
 * Coupe la caméra sans jamais lever d'erreur : Html5Qrcode.stop() lève une
 * exception SYNCHRONE (et non une promesse rejetée) quand la caméra n'a
 * jamais démarré, par exemple après un refus d'accès.
 */
function arreterCamera(instance: Html5Qrcode): Promise<void> {
  try {
    return instance.stop().catch(() => {});
  } catch {
    return Promise.resolve();
  }
}

export function ouvrirScanner(): void {
  if (isScanning) return; // double appui : une seule caméra à la fois
  document.getElementById("scanner-modal")?.classList.remove("hidden");
  isScanning = true;
  html5QrCode = new Html5Qrcode("reader");
  html5QrCode
    .start(
      { facingMode: "environment" },
      {
        fps: 10,
        // 🎯 La zone analysée épouse le viseur affiché (62 % du plus petit côté)
        qrbox: (largeurVue: number, hauteurVue: number) => {
          const cote = Math.floor(Math.min(largeurVue, hauteurVue) * 0.62);
          return { width: cote, height: cote };
        }
      },
      onScanSuccess
    )
    .then(() => {
      // 🔦 On n'affiche le bouton que si l'appareil dispose réellement d'une lampe
      setTimeout(verifierDisponibiliteTorche, 600);
    })
    .catch(() => {
      fermerScanner();
      afficherToast("Impossible d'accéder à la caméra.", "erreur");
    });
}

// ==========================================
// 🔦 ÉCLAIRAGE DU SCANNER
//    Utile pour les QR codes collés dans les placards, la nuit.
// ==========================================
function pisteVideoScanner(): MediaStreamTrack | null {
  const video = document.querySelector<HTMLVideoElement>("#reader video");
  if (!video || !video.srcObject) return null;
  const pistes = (video.srcObject as MediaStream).getVideoTracks();
  return pistes && pistes.length ? pistes[0] : null;
}

function verifierDisponibiliteTorche(): void {
  const btn = document.getElementById("btn-torche");
  if (!btn) return;
  try {
    const piste = pisteVideoScanner();
    const capacites = piste && piste.getCapabilities ? (piste.getCapabilities() as MediaTrackCapabilities & { torch?: boolean }) : ({} as MediaTrackCapabilities & { torch?: boolean });
    if (capacites && capacites.torch) {
      btn.classList.remove("hidden");
    } else {
      btn.classList.add("hidden");
    }
  } catch {
    btn.classList.add("hidden");
  }
}

export async function basculerTorche(): Promise<void> {
  const btn = document.getElementById("btn-torche");
  const label = document.getElementById("btn-torche-label");
  try {
    const piste = pisteVideoScanner();
    if (!piste) return;

    torcheActive = !torcheActive;
    await piste.applyConstraints({ advanced: [{ torch: torcheActive } as MediaTrackConstraintSet] });

    btn?.classList.toggle("active", torcheActive);
    if (label) label.innerText = torcheActive ? "Éteindre le flash" : "Allumer le flash";
    retour("appui");
  } catch (e) {
    console.warn("🔦 Éclairage indisponible :", e);
    torcheActive = false;
    btn?.classList.add("hidden");
  }
}

function reinitialiserTorche(): void {
  torcheActive = false;
  const btn = document.getElementById("btn-torche");
  const label = document.getElementById("btn-torche-label");
  if (btn) {
    btn.classList.remove("active");
    btn.classList.add("hidden");
  }
  if (label) label.innerText = "Allumer le flash";
}

function onScanSuccess(decodedText: string): void {
  if (!isScanning) return;
  isScanning = false;
  reinitialiserTorche();
  document.getElementById("scanner-modal")?.classList.add("hidden");
  if (html5QrCode) {
    const instance = html5QrCode;
    html5QrCode = null;
    arreterCamera(instance).then(() => analyserCodeProprement(decodedText));
  } else {
    analyserCodeProprement(decodedText);
  }
}

/** Ferme le scanner ET coupe la caméra (un simple masquage de la modale la laissait allumée). */
export function fermerScanner(): void {
  isScanning = false;
  reinitialiserTorche();
  document.getElementById("scanner-modal")?.classList.add("hidden");
  if (html5QrCode) {
    void arreterCamera(html5QrCode);
    html5QrCode = null;
  }
}

function analyserCodeProprement(texte: string): void {
  let idTrouve: number | null = null;
  let txt = texte.trim();
  if (!isNaN(Number(txt)) && txt.length < 5) idTrouve = parseInt(txt);
  else {
    try {
      if (!txt.startsWith("http")) txt = "https://" + txt;
      const param = new URL(txt).searchParams.get("scan");
      if (param) idTrouve = parseInt(param);
      else if (txt.includes("scan=")) idTrouve = parseInt(txt.split("scan=")[1]);
    } catch {
      if (txt.includes("scan=")) idTrouve = parseInt(txt.split("scan=")[1]);
    }
  }

  // 📳 + 🔊 GESTION DU RETOUR D'INTERACTION
  if (idTrouve && state.inventory.find((i) => i.id == idTrouve)) {
    // ✅ SUCCÈS : objet reconnu dans l'inventaire
    retour("succes");

    setTimeout(() => clicCarteUnique(idTrouve as number), 200);
  } else {
    // ❌ ERREUR : code non reconnu
    retour("erreur");

    // On affiche la belle modale personnalisée au lieu de l'alerte du navigateur
    const errEl = document.getElementById("qr-error-text");
    if (errEl) errEl.innerText = texte;
    document.getElementById("qr-error-modal")?.classList.remove("hidden");
  }
}
