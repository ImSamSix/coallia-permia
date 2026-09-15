/**
 * Coffre-fort crypté (AES) + dérivation de clé (PBKDF2) + badge serveur (SHA-256).
 * Le sel et le nombre d'itérations sont figés : les modifier rendrait tous les
 * coffres déjà chiffrés illisibles.
 */
const SEL_VAULT = "Permia_Vault_2026_Coallia";
const ITERATIONS_VAULT = 120000;

const SESSION_KEY_STORAGE = "permia_session_key";
const AUTH_KEY_STORAGE = "permia_auth_key";

/** Dérivation lente : rend le vol du téléphone très coûteux à exploiter. */
export function derriverCleVault(motDePasse: string): string {
  return CryptoJS.PBKDF2(motDePasse, CryptoJS.enc.Utf8.parse(SEL_VAULT), {
    keySize: 256 / 32,
    iterations: ITERATIONS_VAULT,
    hasher: CryptoJS.algo.SHA256
  }).toString();
}

/** Badge envoyé au Worker (formule historique, inchangée). */
export function deriverCleAuth(motDePasse: string): string {
  return CryptoJS.SHA256("Permia_Secret_" + motDePasse).toString();
}

export function getCleMaitresse(): string | null {
  return sessionStorage.getItem(SESSION_KEY_STORAGE);
}

export function getCleAuth(): string | null {
  return sessionStorage.getItem(AUTH_KEY_STORAGE);
}

export function definirClesSession(cleVault: string, cleAuth: string): void {
  sessionStorage.setItem(SESSION_KEY_STORAGE, cleVault);
  sessionStorage.setItem(AUTH_KEY_STORAGE, cleAuth);
}

export function effacerClesSession(): void {
  sessionStorage.removeItem(SESSION_KEY_STORAGE);
  sessionStorage.removeItem(AUTH_KEY_STORAGE);
}

export function tenterDechiffrement<T>(coffre: string, cle: string): T | null {
  try {
    const bytes = CryptoJS.AES.decrypt(coffre, cle);
    const texte = bytes.toString(CryptoJS.enc.Utf8);
    if (!texte) return null;
    return JSON.parse(texte) as T;
  } catch {
    return null;
  }
}

export function chiffrer(texteJson: string, cle: string): string {
  return CryptoJS.AES.encrypt(texteJson, cle).toString();
}

/**
 * 🧩 FILET DE SÉCURITÉ : garantit que CryptoJS est bien disponible.
 * Après un location.reload() (déconnexion, verrouillage auto), le service worker
 * peut servir la page sans que le script du coffre local soit rejoué. On le
 * recharge alors à la demande, avant tout calcul cryptographique.
 */
let chargementCrypto: Promise<boolean> | null = null;

export function assurerCryptoJS(): Promise<boolean> {
  if (typeof CryptoJS !== "undefined") return Promise.resolve(true);
  if (chargementCrypto) return chargementCrypto;

  chargementCrypto = new Promise<boolean>((resolve) => {
    const sources = [
      "/vendor/crypto-js.min.js", // copie locale (prioritaire, marche hors-ligne)
      "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"
    ];
    let i = 0;
    const essayer = () => {
      if (i >= sources.length) {
        chargementCrypto = null;
        resolve(false);
        return;
      }
      const s = document.createElement("script");
      s.src = sources[i++];
      s.onload = () => resolve(typeof CryptoJS !== "undefined");
      s.onerror = essayer;
      document.head.appendChild(s);
    };
    essayer();
  });
  return chargementCrypto;
}
