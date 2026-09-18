import * as Sentry from "@sentry/browser";

const SENTRY_DSN = "https://d3df0c121d3b29b1522f42ad16966bff@o4512080131784704.ingest.de.sentry.io/4512108326223952";

/**
 * Suivi d'erreurs (Sentry) — volontairement minimal vu la nature des données
 * que gère l'app (mineurs, médicaments, présence) : pas de traçage de
 * performance, pas de Session Replay (qui filmerait l'écran), aucune donnée
 * personnelle envoyée par défaut. Juste les exceptions et leur pile d'appel.
 */
export function initMonitoring(): void {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    sendDefaultPii: false
  });
}
