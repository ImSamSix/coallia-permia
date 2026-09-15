import type { SyncedRecord } from "./common";
import type { ItemStatus } from "./inventory";

export type MediaKey = "manette" | "telecommande" | "ordinateur1" | "ordinateur2";

export interface MediaItem {
  id: string;
  name: string;
  status: ItemStatus;
  jeune: string;
  pro: string;
  time: number | null;
  lastJeune: string;
  lastTime: string;
  signature: string;
}

export type MediaData = Record<MediaKey, MediaItem>;

export type MediaActionType = "EMPRUNT" | "RETOUR";

export interface MediaLog extends SyncedRecord {
  idLog: number;
  type_action: MediaActionType;
  equipement: string;
  jeune: string;
  professionnel: string;
  date: string;
  heure: string;
}
