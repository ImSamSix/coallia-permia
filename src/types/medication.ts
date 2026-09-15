import type { SyncedRecord } from "./common";

export interface MedLog extends SyncedRecord {
  timestamp: number;
  date: string;
  heure: string;
  educateur: string;
  resident: string;
  medicament: string;
  symptome: string;
}
