import { getFeedbackMode } from "@/services/feedback";

export type SonType = "success" | "error";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/** Générateur de sons (Web Audio API) : bip aigu de succès, bzzzt grave d'erreur.
 *  Silencieux hors du mode "son" (menu Options > Retour d'interaction). */
export function jouerSon(type: SonType): void {
  if (getFeedbackMode() !== "son") return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  if (type === "success") {
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } else {
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.4);
  }
}
