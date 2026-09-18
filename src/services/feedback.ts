import { jouerSon } from "@/ui/sound";

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

/**
 * Catalogue des événements de retour reconnus par l'app. Chaque événement a
 * une signature sonore (sound.ts) ET une signature vibratoire (ci-dessous)
 * pensées comme deux traductions d'une même intention — au lieu des motifs
 * de vibration choisis au cas par cas un peu partout, qui n'avaient souvent
 * aucun équivalent sonore. Résultat : basculer entre "Son" et "Vibreur" dans
 * le menu Options donne la même expérience, juste sur un canal différent.
 */
export type EvenementRetour = "succes" | "erreur" | "alerte" | "appui" | "annulation";

const VIBRATIONS_PAR_EVENEMENT: Record<EvenementRetour, number | number[]> = {
  succes: [40, 30, 60], // deux temps courts, comme l'accord montant du son
  erreur: [70, 40, 70], // double buzz sec, comme les deux notes descendantes
  alerte: [150, 80, 150, 80, 150], // triple buzz insistant, comme le triple ping
  appui: 15, // tic minimal, comme le clic discret
  annulation: [30, 20, 30] // double tic léger, plus doux qu'une erreur
};

/**
 * Point d'entrée unique pour tout retour d'interaction "sémantique" (succès,
 * erreur, alerte, appui léger, annulation) : joue le son OU vibre selon le
 * mode choisi, jamais les deux — jouerSon() et vibrer() se filtrent chacun
 * sur leur propre mode, donc un seul des deux appels produit réellement
 * quelque chose.
 */
export function retour(evenement: EvenementRetour): void {
  jouerSon(evenement);
  vibrer(VIBRATIONS_PAR_EVENEMENT[evenement]);
}
