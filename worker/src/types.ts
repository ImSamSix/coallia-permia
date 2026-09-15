export interface Env {
  PERMIA_DB: KVNamespace;
  MOT_DE_PASSE_PERMIA: string;
  URL_POWER_AUTOMATE: string;
}

/** Enregistrement brut d'un jeune tel que stocké dans KV sous la clé "mecs_database". */
export interface MecsJeuneBrut {
  prenom: string;
  nom: string;
  /** Date de naissance, format exploitable par `new Date(...)`. */
  nais: string;
  bat: string;
  ch: string;
  apt?: string;
}

/** Jeune compilé, tel qu'envoyé au client (aucune date de naissance exposée). */
export interface MecsJeuneCompile {
  id: number;
  prenom: string;
  nom: string;
  age: number;
  isMajor: boolean;
  chambre: string;
  initiales: string;
}

export interface LoginRequestBody {
  type: "login";
}

export interface CloudSyncRequestBody {
  type: "cloud_sync";
  vaultData: string;
}

/** Tout autre payload (medicament, frigo_eval, pain, comptage_mecs, multimedia_log, frigo_signalement). */
export interface RelayRequestBody {
  type: string;
  [key: string]: unknown;
}

export type PermiaRequestBody = LoginRequestBody | CloudSyncRequestBody | RelayRequestBody;
