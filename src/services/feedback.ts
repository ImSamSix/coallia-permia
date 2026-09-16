/**
 * Préférence de retour d'interaction (menu Options) : l'app ne doit
 * produire QU'UN SEUL canal de retour à la fois, jamais les deux — sinon
 * "Aucun" ne serait pas vraiment silencieux.
 */
export type FeedbackMode = "son" | "vibration" | "aucun";

const FEEDBACK_STORAGE_KEY = "coallia_feedback_mode";

export function getFeedbackMode(): FeedbackMode {
  const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
  return stored === "vibration" || stored === "aucun" ? stored : "son";
}

export function setFeedbackMode(mode: FeedbackMode): void {
  localStorage.setItem(FEEDBACK_STORAGE_KEY, mode);
}

/** Remplace tous les `navigator.vibrate(...)` : no-op hors du mode "vibration". */
export function vibrer(pattern: number | number[]): void {
  if (getFeedbackMode() !== "vibration") return;
  if (navigator.vibrate) navigator.vibrate(pattern);
}
