/**
 * Coffre-fort crypté (AES) + dérivation de clé (PBKDF2) + badge serveur.
 * Le sel et le nombre d'itérations sont figés : les modifier rendrait tous les
 * coffres déjà chiffrés illisibles.
 */
const SEL_VAULT = "Permia_Vault_2026_Coallia";
const ITERATIONS_VAULT = 120000;

const SESSION_KEY_STORAGE = "permia_session_key";
const AUTH_KEY_STORAGE = "permia_auth_key";
const BADGE_VERSION_STORAGE = "permia_badge_version";
/** Version du calcul du badge : une session ouverte avec un ancien calcul est refusée au démarrage. */
const BADGE_VERSION = "2";

/** Dérivation lente : rend le vol du téléphone très coûteux à exploiter. */
export function derriverCleVault(motDePasse: string): string {
  return CryptoJS.PBKDF2(motDePasse, CryptoJS.enc.Utf8.parse(SEL_VAULT), {
    keySize: 256 / 32,
    iterations: ITERATIONS_VAULT,
    hasher: CryptoJS.algo.SHA256
  }).toString();
}

/**
 * Badge envoyé au Worker, dérivé de la clé LENTE du coffre (PBKDF2) et non
 * plus du mot de passe en direct : un badge intercepté ne permet plus de
 * tester des millions de mots de passe par seconde (chaque essai coûte
 * désormais 120 000 itérations), et il ne révèle pas la clé du coffre
 * (SHA-256 non réversible). Aucun calcul lent supplémentaire à la connexion.
 * ⚠️ Doit rester identique à worker/scripts/generer-empreinte-badge.mjs.
 */
export function deriverCleAuth(cleVault: string): string {
  return CryptoJS.SHA256("Permia_Badge_v2|" + cleVault).toString();
}

/**
 * Ancienne clé faible (SHA-256 direct du mot de passe) : ne sert plus qu'à
 * ouvrir un coffre jamais migré, le temps de la connexion. Gardée en
 * mémoire uniquement, jamais stockée ni envoyée.
 */
let cleLegacyEnMemoire: string | null = null;

export function memoriserCleLegacy(motDePasse: string): void {
  cleLegacyEnMemoire = CryptoJS.SHA256("Permia_Secret_" + motDePasse).toString();
}

export function getCleLegacy(): string | null {
  return cleLegacyEnMemoire;
}

/** Session ouverte avec le calcul de badge actuel (sinon : reconnexion requise). */
export function sessionAJour(): boolean {
  return sessionStorage.getItem(BADGE_VERSION_STORAGE) === BADGE_VERSION;
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
  sessionStorage.setItem(BADGE_VERSION_STORAGE, BADGE_VERSION);
}

export function effacerClesSession(): void {
  sessionStorage.removeItem(SESSION_KEY_STORAGE);
  sessionStorage.removeItem(AUTH_KEY_STORAGE);
  sessionStorage.removeItem(BADGE_VERSION_STORAGE);
  cleLegacyEnMemoire = null;
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
      { src: "/vendor/crypto-js.min.js" }, // copie locale (prioritaire, marche hors-ligne)
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js",
        integrity: "sha512-a+SUDuwNzXDvz4XrIcXHuCf089/iJAoN4lmrXJg18XnduKK6YlDHNRalv4yd1N40OKI80tFidF+rqTFKGPoWFQ=="
      }
    ];
    let i = 0;
    const essayer = () => {
      if (i >= sources.length) {
        chargementCrypto = null;
        resolve(false);
        return;
      }
      const source = sources[i++];
      const s = document.createElement("script");
      s.src = source.src;
      // 🔒 Copie CDN : empreinte SRI obligatoire, un fichier altéré est refusé.
      if (source.integrity) {
        s.integrity = source.integrity;
        s.crossOrigin = "anonymous";
      }
      s.onload = () => resolve(typeof CryptoJS !== "undefined");
      s.onerror = essayer;
      document.head.appendChild(s);
    };
    essayer();
  });
  return chargementCrypto;
}
