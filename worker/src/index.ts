import * as Sentry from "@sentry/cloudflare";
import type { ErrorEvent as SentryErrorEvent } from "@sentry/cloudflare";
import { compilerCatalogueJeunes } from "./mecs-catalog";
import { sauvegarderEtatOperationnel } from "./supabase-backup";
import type { CloudSyncRequestBody, Env, EtatOperationnelRequestBody, PermiaRequestBody } from "./types";

async function sha256Hex(texte: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Clé de limitation d'une adresse : IPv4 entière, IPv6 ramenée à son bloc
 * /64. Un abonnement (box, 4G) reçoit en général tout un /64 : sans ce
 * regroupement, un attaquant changeait d'adresse à volonté pour repartir
 * de zéro à chaque tentative.
 */
function cleLimitation(ip: string): string {
  if (!ip.includes(":")) return ip;
  const [gauche, droite = ""] = ip.split("::");
  const g = gauche ? gauche.split(":") : [];
  const d = droite ? droite.split(":") : [];
  const complet = [...g, ...Array(Math.max(0, 8 - g.length - d.length)).fill("0"), ...d];
  return complet.slice(0, 4).map((h) => h.toLowerCase().padStart(4, "0")).join(":") + "::/64";
}

/** Comparaison à temps constant : évite qu'un écart de latence réseau (même
 * infime) ne laisse fuiter, caractère par caractère, le badge attendu. */
function comparerEnTempsConstant(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function isCloudSync(body: PermiaRequestBody): body is CloudSyncRequestBody {
  return body.type === "cloud_sync";
}

function isEtatOperationnel(body: PermiaRequestBody): body is EtatOperationnelRequestBody {
  return body.type === "etat_operationnel";
}

/**
 * Miroir Supabase (clé service_role) : on ne transmet QUE les colonnes
 * attendues, et un nombre de lignes borné. Sans ce filtre, un appelant muni
 * de la clé pouvait écrire des colonnes arbitraires dans ces tables.
 */
const COLONNES_MIROIR = {
  materiel: ["id", "category", "name", "status", "jeune", "pro", "time"],
  frigos: ["id", "name", "cadenas", "hygiene", "contenu", "time", "pro", "residents"],
  media: ["id", "name", "status", "jeune", "pro", "time", "last_jeune", "last_time"]
} as const;
const MAX_LIGNES_MIROIR = 500;

function filtrerLignes(valeur: unknown, colonnes: readonly string[]): Record<string, unknown>[] | null {
  if (!Array.isArray(valeur) || valeur.length > MAX_LIGNES_MIROIR) return null;
  const lignes: Record<string, unknown>[] = [];
  for (const brute of valeur) {
    if (!brute || typeof brute !== "object" || Array.isArray(brute)) return null;
    const ligne: Record<string, unknown> = {};
    for (const col of colonnes) {
      if (col in brute) ligne[col] = (brute as Record<string, unknown>)[col];
    }
    if (ligne.id === undefined || ligne.id === null) return null;
    lignes.push(ligne);
  }
  return lignes;
}

/** Seuls les journaux métier réellement émis par l'app sont relayés à Power Automate. */
const TYPES_RELAYES = new Set(["medicament", "frigo_eval", "pain", "comptage_mecs", "multimedia_log", "frigo_signalement"]);

const handler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 🔒 1. PARAMÈTRES DE SÉCURITÉ
    const DOMAINE_AUTORISE = "https://coallia-permia.pages.dev";

    // 🛡️ 2. CONFIGURATION CORS STRICTE
    const corsHeaders = {
      "Access-Control-Allow-Origin": DOMAINE_AUTORISE,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Permia-Key"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // 🩺 2bis. SUPERVISION EXTERNE (UptimeRobot, etc.) : endpoint public, sans
    //    clé API et qui ne consomme pas le compteur anti-brute-force — un
    //    moniteur externe ne doit jamais pouvoir se faire bloquer lui-même.
    //    Vérifie que le Worker répond ET que le KV (cœur de la persistance)
    //    est bien accessible, pas juste que le process tourne.
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      try {
        await env.PERMIA_DB.get("master_vault");
        return new Response(JSON.stringify({ status: "ok", service: "relais-permia", horodatage: new Date().toISOString() }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" }
        });
      } catch (err) {
        Sentry.captureException(err);
        return new Response(JSON.stringify({ status: "down" }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" }
        });
      }
    }

    // 🛡️ 3. LE SERVEUR NE CONNAÎT PAS LE MOT DE PASSE : seulement l'empreinte
    //    SHA-256 du badge attendu (secret Cloudflare EMPREINTE_BADGE, générée
    //    par scripts/generer-empreinte-badge.mjs). Une fuite de ce secret ne
    //    donne ni le mot de passe, ni un badge utilisable.
    if (!env.EMPREINTE_BADGE) {
      return new Response("Configuration serveur incomplète.", { status: 500, headers: corsHeaders });
    }

    // 🛡️ 3bis. ANTI-FORCE BRUTE, deux étages (compteurs expirant tout seuls) :
    //   - par adresse (bloc /64 en IPv6) : 10 échecs → blocage 15 min ;
    //   - global : au-delà de 30 échecs toutes adresses confondues (attaque
    //     distribuée probable), le seuil par adresse tombe à 3 et une alerte
    //     part sur Sentry. Le téléphone légitime, qui n'échoue pas, n'est
    //     jamais bloqué par ce second étage.
    const ip = request.headers.get("CF-Connecting-IP") || "inconnu";
    const cleThrottle = "throttle:" + cleLimitation(ip);
    const CLE_ECHECS_GLOBAUX = "throttle:global";
    const FENETRE_SECONDES = 900; // 15 minutes
    const SEUIL_ATTAQUE_GLOBALE = 30;

    const [echecsBrut, echecsGlobauxBrut] = await Promise.all([env.PERMIA_DB.get(cleThrottle), env.PERMIA_DB.get(CLE_ECHECS_GLOBAUX)]);
    const echecs = parseInt(echecsBrut || "0", 10);
    const echecsGlobaux = parseInt(echecsGlobauxBrut || "0", 10);
    const maxEchecs = echecsGlobaux >= SEUIL_ATTAQUE_GLOBALE ? 3 : 10;

    if (echecs >= maxEchecs) {
      return new Response("Trop de tentatives. Réessayez dans 15 minutes.", {
        status: 429,
        headers: { ...corsHeaders, "Retry-After": String(FENETRE_SECONDES) }
      });
    }

    // 🛡️ 4. VÉRIFICATION DU BADGE (empreinte comparée à temps constant)
    const apiKey = request.headers.get("X-Permia-Key") || "";
    const empreinteRecue = apiKey ? await sha256Hex(apiKey) : "";
    if (!comparerEnTempsConstant(empreinteRecue, env.EMPREINTE_BADGE.trim().toLowerCase())) {
      // Compteurs incrémentés ; une écriture KV refusée (quota, rafale) ne
      // doit jamais transformer un refus propre en erreur 500.
      try {
        await Promise.all([
          env.PERMIA_DB.put(cleThrottle, String(echecs + 1), { expirationTtl: FENETRE_SECONDES }),
          env.PERMIA_DB.put(CLE_ECHECS_GLOBAUX, String(echecsGlobaux + 1), { expirationTtl: FENETRE_SECONDES })
        ]);
      } catch (err) {
        console.log("Compteur anti-force brute non mis à jour :", err instanceof Error ? err.message : err);
      }
      if (echecsGlobaux + 1 === SEUIL_ATTAQUE_GLOBALE) {
        Sentry.captureMessage(`Permia : ${SEUIL_ATTAQUE_GLOBALE} échecs de connexion en 15 min (attaque distribuée probable) — seuil par adresse abaissé à 3.`, "warning");
      }
      return new Response("Accès refusé : Connexion non autorisée.", { status: 403, headers: corsHeaders });
    }

    // ✅ Code correct : on efface l'ardoise de cette adresse
    if (echecs > 0) {
      await env.PERMIA_DB.delete(cleThrottle);
    }

    // =========================================================
    // ☁️ TÉLÉCHARGEMENT DE LA BASE DE DONNÉES (PULL)
    // =========================================================
    if (request.method === "GET") {
      try {
        const encryptedVault = await env.PERMIA_DB.get("master_vault");

        // 👑 INJECTION DU CATALOGUE
        const catalogueAnonyme = await compilerCatalogueJeunes(env);

        return new Response(JSON.stringify({ vault: encryptedVault, mecsCatalog: catalogueAnonyme }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store, max-age=0" }
        });
      } catch (err) {
        // ⚠️ Ce bloc (comme les autres catch ci-dessous) transforme l'erreur en
        // réponse HTTP propre plutôt que de la laisser remonter : sans ce
        // signalement explicite, Sentry.withSentry() — qui ne capte que les
        // exceptions non interceptées — ne verrait jamais ces pannes.
        Sentry.captureException(err);
        return new Response("Erreur GET KV", { status: 500, headers: corsHeaders });
      }
    }

    if (request.method === "POST") {
      try {
        let body: PermiaRequestBody;
        try {
          body = (await request.json()) as PermiaRequestBody;
        } catch {
          return new Response("Requête illisible", { status: 400, headers: corsHeaders });
        }
        if (!body || typeof body !== "object") {
          return new Response("Requête illisible", { status: 400, headers: corsHeaders });
        }

        // 🔒 INTERCEPTION DE LA CONNEXION (LOGIN)
        if (body.type === "login") {
          // 👑 INJECTION DU CATALOGUE DÈS LE LOGIN (source : Supabase)
          const catalogueAnonyme = await compilerCatalogueJeunes(env);

          return new Response(JSON.stringify({ success: true, mecsCatalog: catalogueAnonyme }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // ☁️ SAUVEGARDE DE LA BASE DE DONNÉES (PUSH)
        if (isCloudSync(body)) {
          if (!body.vaultData || body.vaultData.length < 50) {
            return new Response("Données corrompues, sauvegarde annulée.", { status: 400, headers: corsHeaders });
          }

          // 🛡️ HISTORIQUE : on décale les versions avant d'écraser.
          //    master_vault → h1 → h2. On garde ainsi 3 générations.
          try {
            const actuel = await env.PERMIA_DB.get("master_vault");

            // On n'archive que si le contenu change réellement
            if (actuel && actuel !== body.vaultData) {
              const h1 = await env.PERMIA_DB.get("master_vault_h1");
              if (h1) await env.PERMIA_DB.put("master_vault_h2", h1);
              await env.PERMIA_DB.put("master_vault_h1", actuel);
            }
          } catch (err) {
            // L'historique ne doit jamais empêcher la sauvegarde principale
            console.log("Historique non mis à jour :", err instanceof Error ? err.message : err);
          }

          await env.PERMIA_DB.put("master_vault", body.vaultData);
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // 📋 MIROIR LISIBLE (hors coffre) : matériel / frigos / média, pour ne pas
        // perdre le suivi opérationnel en cas de souci avec le téléphone unique.
        if (isEtatOperationnel(body)) {
          try {
            const materiel = filtrerLignes(body.materiel, COLONNES_MIROIR.materiel);
            const frigos = filtrerLignes(body.frigos, COLONNES_MIROIR.frigos);
            const media = filtrerLignes(body.media, COLONNES_MIROIR.media);
            if (!materiel || !frigos || !media) {
              return new Response("Miroir : données invalides", { status: 400, headers: corsHeaders });
            }
            await sauvegarderEtatOperationnel(env, materiel, frigos, media);
            return new Response(JSON.stringify({ success: true }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          } catch (err) {
            Sentry.captureException(err);
            return new Response("Erreur miroir Supabase", { status: 500, headers: corsHeaders });
          }
        }

        // Relais Power Automate
        if (typeof body.type !== "string" || !TYPES_RELAYES.has(body.type)) {
          return new Response("Type de requête inconnu", { status: 400, headers: corsHeaders });
        }
        if (!env.URL_POWER_AUTOMATE) {
          return new Response("Erreur : Variable introuvable", { status: 500, headers: corsHeaders });
        }
        const cleanUrl = env.URL_POWER_AUTOMATE.replace(/"/g, "").trim();
        const paResponse = await fetch(cleanUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (!paResponse.ok) {
          const paError = await paResponse.text();
          Sentry.captureMessage("Blocage Power Automate (" + paResponse.status + ") : " + paError, "error");
          return new Response("Blocage Power Automate", { status: paResponse.status, headers: corsHeaders });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
      } catch (err) {
        Sentry.captureException(err);
        return new Response("Erreur interne du Worker", { status: 500, headers: corsHeaders });
      }
    }

    return new Response("Méthode non autorisée", { status: 405, headers: corsHeaders });
  }
} satisfies ExportedHandler<Env>;

/** Retire du secret embarqué avant tout envoi à Sentry — un DSN n'est pas un accès en lecture, mais la clé d'API Permia, elle, l'est bien. */
function retirerDonneesSensibles(event: SentryErrorEvent): SentryErrorEvent {
  const headers = event.request?.headers;
  if (headers) {
    delete headers["X-Permia-Key"];
    delete headers["x-permia-key"];
    delete headers["Cookie"];
    delete headers["cookie"];
  }
  return event;
}

export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    // Suivi d'erreurs uniquement : pas de traçage de performance.
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: retirerDonneesSensibles
  }),
  handler
);
