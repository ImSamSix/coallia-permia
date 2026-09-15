import type { SyncedRecord } from "./common";

export type CadenasState = "ok" | "open" | "lost";
export type HygieneState = "clean" | "med" | "dirty";
export type ContenuState = "ok" | "sort";

export interface FrigoData {
  id: number;
  name: string;
  cad: CadenasState | null;
  hyg: HygieneState | null;
  cont: ContenuState | null;
  time: number | null;
  pro: string | null;
  residents: string[];
}

export interface FrigoLog extends SyncedRecord {
  idLog: number;
  date: string;
  heure: string;
  educateur: string;
  frigoId: number;
  nomFrigo: string;
  cadenas: string;
  hygiene: string;
  contenu: string;
  observations: string;
}

export interface FrigoEvalTemp {
  cad: CadenasState | null;
  hyg: HygieneState | null;
  cont: ContenuState | null;
}
