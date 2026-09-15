/**
 * `transLogs` existe dans le coffre (sauvegarde, restauration, purge à 4 jours,
 * compteur d'attente) mais aucune fonctionnalité de l'app n'y écrit
 * actuellement — la vue "Transmissions" a été retirée en amont de cette
 * base de code. On conserve le champ et son type minimal pour ne rien casser
 * dans sauvegarderToutesLesDonnees/dechiffrerCoffreLocal/purgerDonneesAnciennes,
 * sans reconstituer une fonctionnalité absente.
 */
export interface TransLog {
  synced: boolean;
  timestamp: number;
  [key: string]: unknown;
}
