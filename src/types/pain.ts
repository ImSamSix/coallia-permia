import type { SyncedRecord } from "./common";

export interface PainLog extends SyncedRecord {
  timestamp: number;
  date: string;
  heure: string;
  educateur: string;
  quantite_restante: number;
  observations: string;
}
