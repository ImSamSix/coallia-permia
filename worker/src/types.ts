export interface Env {
  PERMIA_DB: KVNamespace;
  MOT_DE_PASSE_PERMIA: string;
  URL_POWER_AUTOMATE: string;
  /** URL du projet Supabase partagé avec Habita (non sensible, en clair dans wrangler.toml [vars]). */
  SUPABASE_URL: string;
  /** Clé anon Supabase (lecture du catalogue MECS) — `wrangler secret put SUPABASE_ANON_KEY`. */
  SUPABASE_ANON_KEY: string;
  /** Clé service_role Supabase (écriture des tables permia_*) — `wrangler secret put SUPABASE_SERVICE_ROLE_KEY`. */
  SUPABASE_SERVICE_ROLE_KEY: string;
  /** Suivi d'erreurs (Sentry) — non sensible, voir [vars] dans wrangler.toml. */
  SENTRY_DSN: string;
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
  /** Libellé d'affichage prêt à l'emploi pour le comptage (ex. "🏢 Bât. C │ Apt 3 - Ch. 2"). */
  chambre: string;
  initiales: string;
  /** Champs structurés (ex. "Capitainerie", "C", "D") pour le plan du foyer. */
  bat: string;
  apt?: string;
  chambreNum: string;
}

export interface LoginRequestBody {
  type: "login";
}

export interface CloudSyncRequestBody {
  type: "cloud_sync";
  vaultData: string;
}

/** Ligne d'inventaire fixe (matériel), telle qu'envoyée par le client pour le miroir Supabase. */
export interface EtatMaterielLigne {
  id: number;
  category: string;
  name: string;
  status: string;
  jeune: string;
  pro: string;
  time: string | null;
}

/** État courant d'un frigo, tel qu'envoyé par le client pour le miroir Supabase. */
export interface EtatFrigoLigne {
  id: number;
  name: string;
  cadenas: string | null;
  hygiene: string | null;
  contenu: string | null;
  time: string | null;
  pro: string | null;
  residents: string[];
}

/** État courant d'un équipement multimédia, tel qu'envoyé par le client pour le miroir Supabase. */
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

export interface EtatOperationnelRequestBody {
  type: "etat_operationnel";
  materiel: EtatMaterielLigne[];
  frigos: EtatFrigoLigne[];
  media: EtatMediaLigne[];
}

/** Tout autre payload (medicament, frigo_eval, pain, comptage_mecs, multimedia_log, frigo_signalement). */
export interface RelayRequestBody {
  type: string;
  [key: string]: unknown;
}

export type PermiaRequestBody = LoginRequestBody | CloudSyncRequestBody | EtatOperationnelRequestBody | RelayRequestBody;
