import type { MedLog } from "./medication";
import type { MecsJeune, MecsSession } from "./mecs";
import type { MediaLog } from "./media";

/** Requêtes/réponses du Worker relais-permia (voir worker/src/index.ts). */

export interface LoginRequest {
  type: "login";
}

export interface LoginResponse {
  success: true;
  mecsCatalog: MecsJeune[];
}

export interface GetVaultResponse {
  vault: string | null;
  mecsCatalog: MecsJeune[];
}

export interface CloudSyncRequest {
  type: "cloud_sync";
  vaultData: string;
}

export interface FrigoEvalPayload {
  type: "frigo_eval";
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

export interface PainPayload {
  type: "pain";
  educateur: string;
  date: string;
  heure: string;
  quantite_restante: number;
  observations: string;
}

export interface FrigoSignalementPayload {
  type: "frigo_signalement";
  date: string;
  heure: string;
  educateur: string;
  nomFrigo: string;
  description: string;
  photoBase64: string;
}

export type MedicamentPayload = MedLog & { type: "medicament" };
export type ComptageMecsPayload = MecsSession & { type: "comptage_mecs" };
export type MultimediaLogPayload = MediaLog & { type: "multimedia_log" };

/** Tout payload relayé tel quel vers Power Automate par le Worker (hors login/cloud_sync). */
export type PowerAutomatePayload =
  | MedicamentPayload
  | FrigoEvalPayload
  | PainPayload
  | ComptageMecsPayload
  | MultimediaLogPayload
  | FrigoSignalementPayload;
