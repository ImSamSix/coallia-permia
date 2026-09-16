import type { CloudSyncRequest, EtatOperationnelRequest, GetVaultResponse, LoginRequest, PowerAutomatePayload } from "@/types/relay";

/**
 * Client HTTP du Worker Cloudflare "relais-permia" — seul point de contact
 * réseau de l'app (KV pour le coffre + le catalogue MECS, relais vers
 * Power Automate pour tous les journaux métier). Les fonctions restent de
 * simples enveloppes autour de fetch : chaque appelant gère la réponse
 * exactement comme le faisait l'ancien script.js (voir les commentaires
 * ci-dessous), pour ne rien changer au comportement réseau existant.
 */
const URL_RELAIS = "https://relais-permia.imsamsix.workers.dev";

function headersJson(cleAuth: string): HeadersInit {
  return { "Content-Type": "application/json", "X-Permia-Key": cleAuth };
}

/** POST {type:"login"} — l'appelant inspecte response.status (200/401/403/429/autre). */
export function login(cleAuth: string): Promise<Response> {
  const body: LoginRequest = { type: "login" };
  return fetch(URL_RELAIS, { method: "POST", headers: headersJson(cleAuth), body: JSON.stringify(body) });
}

/** GET du coffre distant + catalogue MECS (cache-busted par timestamp). */
export async function fetchVault(cleAuth: string): Promise<GetVaultResponse> {
  const reponse = await fetch(`${URL_RELAIS}?t=${Date.now()}`, {
    method: "GET",
    headers: { "X-Permia-Key": cleAuth }
  });
  return (await reponse.json()) as GetVaultResponse;
}

/** PUSH du coffre chiffré vers KV (sauvegarde cloud, tir-et-oublie côté appelant). */
export function pushCloudSync(cleAuth: string, vaultData: string): Promise<Response> {
  const body: CloudSyncRequest = { type: "cloud_sync", vaultData };
  return fetch(URL_RELAIS, { method: "POST", headers: headersJson(cleAuth), body: JSON.stringify(body) });
}

/**
 * Miroir lisible (hors coffre chiffré) de l'état opérationnel courant :
 * matériel disponible/emprunté, état des frigos, prêts multimédia rendus ou
 * non. Permet de retrouver le suivi en cas de souci avec le téléphone,
 * sans avoir besoin du code de service pour déchiffrer le coffre.
 */
export function pushEtatOperationnel(cleAuth: string, payload: Omit<EtatOperationnelRequest, "type">): Promise<Response> {
  const body: EtatOperationnelRequest = { type: "etat_operationnel", ...payload };
  return fetch(URL_RELAIS, { method: "POST", headers: headersJson(cleAuth), body: JSON.stringify(body) });
}

/**
 * Relais générique vers Power Automate (médicament, frigo_eval, pain,
 * comptage_mecs, multimedia_log, frigo_signalement). L'appelant décide de
 * l'interprétation de la réponse (voir synchroniserDonnees vs envoyerSignalement).
 */
export function envoyerPayload(cleAuth: string, payload: PowerAutomatePayload): Promise<Response> {
  return fetch(URL_RELAIS, { method: "POST", headers: headersJson(cleAuth), body: JSON.stringify(payload) });
}
