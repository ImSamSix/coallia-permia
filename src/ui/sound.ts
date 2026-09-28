import { getFeedbackMode } from "@/services/feedback";

export type SonType = "succes" | "erreur" | "alerte" | "appui" | "annulation";

// Créé au premier son, pas au chargement du module : sans Web Audio (navigateur
// verrouillé), l'app entière plantait au démarrage ; et un contexte créé hors
// geste utilisateur démarre de toute façon suspendu.
let audioCtx: AudioContext | null = null;

function contexteAudio(): AudioContext | null {
  if (audioCtx) return audioCtx;
  const Constructeur = window.AudioContext || window.webkitAudioContext;
  if (!Constructeur) return null;
  audioCtx = new Constructeur();
  return audioCtx;
}

/**
 * Une note avec enveloppe douce (attaque rapide, chute exponentielle) plutôt
 * qu'un gain qui saute à zéro d'un coup : évite le "clic" sec en fin de son
 * et donne un rendu plus rond, plus proche d'un vrai retour d'app native.
 */
function jouerNote(audioCtx: AudioContext, debut: number, frequence: number, duree: number, type: OscillatorType, volume: number): void {
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequence, debut);

  gain.gain.setValueAtTime(0.0001, debut);
  gain.gain.exponentialRampToValueAtTime(volume, debut + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, debut + duree);

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.start(debut);
  oscillator.stop(debut + duree + 0.02);
}

/**
 * Générateur de sons (Web Audio API — aucun fichier à charger, cohérent avec
 * une app pensée pour le 100% hors-ligne). Chaque type a sa propre
 * signature, reconnaissable même à volume bas : un accord qui monte pour
 * "succes", deux notes graves qui descendent pour "erreur", un triple ping
 * pour "alerte", un clic discret pour "appui", une note neutre et brève pour
 * "annulation". Silencieux hors du mode "son" (menu Options > Retour
 * d'interaction).
 */
export function jouerSon(type: SonType): void {
  if (getFeedbackMode() !== "son") return;
  const audioCtx = contexteAudio();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") void audioCtx.resume();

  const t = audioCtx.currentTime;

  switch (type) {
    case "succes":
      // Ré5 → La5 : petit accord qui monte, comme une confirmation.
      jouerNote(audioCtx, t, 587, 0.09, "sine", 0.14);
      jouerNote(audioCtx, t + 0.075, 880, 0.16, "sine", 0.14);
      break;
    case "erreur":
      // La3 → Mi3 : deux notes graves qui descendent, texture plus rêche.
      jouerNote(audioCtx, t, 220, 0.14, "sawtooth", 0.12);
      jouerNote(audioCtx, t + 0.1, 164, 0.2, "sawtooth", 0.12);
      break;
    case "alerte":
      // Triple ping à hauteur fixe : insistant sans être agressif.
      jouerNote(audioCtx, t, 392, 0.09, "triangle", 0.13);
      jouerNote(audioCtx, t + 0.14, 392, 0.09, "triangle", 0.13);
      jouerNote(audioCtx, t + 0.28, 392, 0.13, "triangle", 0.13);
      break;
    case "appui":
      // Tic très court et discret : juste un accusé de réception tactile.
      jouerNote(audioCtx, t, 1200, 0.035, "sine", 0.05);
      break;
    case "annulation":
      // Une seule note neutre, plus douce qu'une erreur : "annulé", pas "faux".
      jouerNote(audioCtx, t, 294, 0.09, "sine", 0.08);
      break;
  }
}
