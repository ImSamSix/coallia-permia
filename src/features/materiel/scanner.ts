import { state } from "@/state/store";
import { jouerSon } from "@/ui/sound";
import { vibrer } from "@/services/feedback";
import { clicCarteUnique } from "./materiel";

let html5QrCode: Html5Qrcode | null = null;
let isScanning = false;
let torcheActive = false;

export function ouvrirScanner(): void {
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
      alert("Impossible d'accéder à la caméra.");
      fermerScanner();
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
    if (label) label.innerText = torcheActive ? "Éclairage allumé" : "Éclairage";
    vibrer(30);
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
  if (label) label.innerText = "Éclairage";
}

function onScanSuccess(decodedText: string): void {
  if (!isScanning) return;
  isScanning = false;
  reinitialiserTorche();
  document.getElementById("scanner-modal")?.classList.add("hidden");
  if (html5QrCode) {
    html5QrCode
      .stop()
      .then(() => analyserCodeProprement(decodedText))
      .catch(() => analyserCodeProprement(decodedText));
  } else {
    analyserCodeProprement(decodedText);
  }
}

export function fermerScanner(): void {
  isScanning = false;
  reinitialiserTorche();
  document.getElementById("scanner-modal")?.classList.add("hidden");
  if (html5QrCode) html5QrCode.stop().catch((e) => console.error(e));
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

  // 📳 + 🔊 GESTION DES VIBRATIONS ET DES SONS
  if (idTrouve && state.inventory.find((i) => i.id == idTrouve)) {
    // ✅ SUCCÈS : Son "Bip" + Double vibration
    jouerSon("success");
    vibrer([100, 50, 100]);

    setTimeout(() => clicCarteUnique(idTrouve as number), 200);
  } else {
    // ❌ ERREUR : Son grave + Longue vibration
    jouerSon("error");
    vibrer([400]);

    // On affiche la belle modale personnalisée au lieu de l'alerte du navigateur
    const errEl = document.getElementById("qr-error-text");
    if (errEl) errEl.innerText = texte;
    document.getElementById("qr-error-modal")?.classList.remove("hidden");
  }
}
