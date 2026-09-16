export interface Env {
  PERMIA_DB: KVNamespace;
  MOT_DE_PASSE_PERMIA: string;
  URL_POWER_AUTOMATE: string;
  /** URL du projet Supabase partagé avec Habita (non sensible, en clair dans wrangler.toml [vars]). */
  SUPABASE_URL: string;
  /** Clé anon Supabase — définie via `wrangler secret put SUPABASE_ANON_KEY`. */
  SUPABASE_ANON_KEY: string;
}

/**
 * Structure brute de app_config.nomsJeunes (source : Habita), lue via la vue
 * Supabase "mecs_noms_jeunes" : Bâtiment → Appartement → Chambre → [noms],
 * sauf "Capitainerie" qui saute le niveau Appartement (Bâtiment → Chambre → [noms]).
 */
export type NomsJeunesBrut = Record<string, Record<string, unknown>>;

export interface NomsJeunesRow {
  noms_jeunes: NomsJeunesBrut;
}

/** Une ligne de la table dates_naissance, ajoutée à part de app_config pour ne pas toucher Habita. */
export interface DateNaissanceRow {
  nom_complet: string;
  /** Format ISO (YYYY-MM-DD), exploitable par `new Date(...)`. */
  date_naissance: string;
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
