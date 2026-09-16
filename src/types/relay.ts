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

/** Ligne d'inventaire fixe (matériel), pour le miroir Supabase lisible hors coffre. */
export interface EtatMaterielLigne {
  id: number;
  category: string;
  name: string;
  status: string;
  jeune: string;
  pro: string;
  time: string | null;
}

/** État courant d'un frigo, pour le miroir Supabase lisible hors coffre. */
export interface EtatFrigoLigne {
  id: number;
  name: string;
  cadenas: string | null;
  hygiene: string | null;
  contenu: string | null;
  time: string | null;
  pro: string | null;
}

/** État courant d'un équipement multimédia, pour le miroir Supabase lisible hors coffre. */
export interface EtatMediaLigne {
  id: string;
  name: string;
  status: string;
  jeune: string;
  pro: string;
  time: string | null;
  last_jeune: string;
  last_time: string;
}

export interface EtatOperationnelRequest {
  type: "etat_operationnel";
  materiel: EtatMaterielLigne[];
  frigos: EtatFrigoLigne[];
  media: EtatMediaLigne[];
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
