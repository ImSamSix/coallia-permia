/**
 * Les horodatages traversent JSON.stringify/parse (coffre chiffré) : un Date
 * poussé côté écriture redevient une chaîne ISO à la relecture. Le type
 * reflète cette réalité plutôt que de forcer un Date qui n'existera plus
 * après un cycle de sauvegarde/chargement.
 */
export type TimeValue = string | number | Date | null;

export interface SyncedRecord {
  synced: boolean;
}
