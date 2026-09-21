import * as Sentry from "@sentry/cloudflare";
import type { ErrorEvent as SentryErrorEvent } from "@sentry/cloudflare";
import { compilerCatalogueJeunes } from "./mecs-catalog";
import { sauvegarderEtatOperationnel } from "./supabase-backup";
import type { CloudSyncRequestBody, Env, EtatOperationnelRequestBody, PermiaRequestBody } from "./types";

// Fonction cryptographique pour générer la clé côté serveur
async function genererCleServeur(motDePasse: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode("Permia_Secret_" + motDePasse);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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
        return new Response(JSON.stringify({ status: "down", erreur: err instanceof Error ? err.message : String(err) }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" }
        });
      }
    }

    // 🛡️ 3. LE SECRET VIENT DU COFFRE CLOUDFLARE (jamais dans le code source)
    if (!env.MOT_DE_PASSE_PERMIA) {
      return new Response("Configuration serveur incomplète.", { status: 500, headers: corsHeaders });
    }
    const CLE_API_ATTENDUE = await genererCleServeur(env.MOT_DE_PASSE_PERMIA);

    // 🛡️ 3bis. ANTI-FORCE BRUTE : compteur d'échecs par IP, expirant tout seul
    const ip = request.headers.get("CF-Connecting-IP") || "inconnu";
    const cleThrottle = "throttle:" + ip;
    const MAX_ECHECS = 10;
    const FENETRE_SECONDES = 900; // 15 minutes

    const echecs = parseInt((await env.PERMIA_DB.get(cleThrottle)) || "0", 10);

    if (echecs >= MAX_ECHECS) {
      return new Response("Trop de tentatives. Réessayez dans 15 minutes.", {
        status: 429,
        headers: { ...corsHeaders, "Retry-After": String(FENETRE_SECONDES) }
      });
    }

    // 🛡️ 4. VÉRIFICATION DYNAMIQUE DU BADGE
    const apiKey = request.headers.get("X-Permia-Key") || "";
    if (!comparerEnTempsConstant(apiKey, CLE_API_ATTENDUE)) {
      // On incrémente le compteur, qui s'effacera seul au bout de 15 minutes
      await env.PERMIA_DB.put(cleThrottle, String(echecs + 1), { expirationTtl: FENETRE_SECONDES });
      return new Response("Accès refusé : Connexion non autorisée.", { status: 403, headers: corsHeaders });
    }

    // ✅ Code correct : on efface l'ardoise
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
        const body = (await request.json()) as PermiaRequestBody;

        // 🔒 INTERCEPTION DE LA CONNEXION (LOGIN)
        if (body.type === "login") {
          // 👑 INJECTION DU CATALOGUE DÈS LE LOGIN (source : KV)
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
            await sauvegarderEtatOperationnel(env, body.materiel, body.frigos, body.media);
            return new Response(JSON.stringify({ success: true }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          } catch (err) {
            Sentry.captureException(err);
            return new Response("Erreur miroir Supabase : " + (err instanceof Error ? err.message : String(err)), { status: 500, headers: corsHeaders });
          }
        }

        // Relais Power Automate
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
          Sentry.captureMessage("Blocage Power Automate : " + paError, "error");
          return new Response("Blocage Power Automate : " + paError, { status: paResponse.status, headers: corsHeaders });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
      } catch (err) {
        Sentry.captureException(err);
        return new Response("Erreur interne du Worker : " + (err instanceof Error ? err.message : String(err)), { status: 500, headers: corsHeaders });
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
