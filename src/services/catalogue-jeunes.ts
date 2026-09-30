import { state } from "@/state/store";
import { getCleAuth } from "@/services/crypto";
import { fetchVault } from "@/services/permia-relay";
import type { MecsJeune } from "@/types/mecs";

/**
 * Point d'entrée unique du catalogue des jeunes (state.mecsJeunesCatalog).
 *
 * Le catalogue n'est jamais persisté localement (données de mineurs) : il ne
 * vit qu'en mémoire, rempli par la réponse du Worker. Si ce chargement échoue
 * au démarrage (réseau lent, Supabase indisponible un instant, connexion en
 * mode dégradé), la liste restait vide jusqu'à la prochaine connexion — d'où
 * un plan du foyer "Aucun résident recensé". Ici : tentatives répétées,
 * requêtes dédoublonnées, relance au retour du réseau / de l'app, et
 * notification des écrans abonnés quand le catalogue arrive.
 */

const DELAIS_TENTATIVES_MS = [0, 1500, 4000];
const DELAI_MAX_REQUETE_MS = 12000;

let chargementEnCours: Promise<boolean> | null = null;
let dernierEchec = false;
const abonnes = new Set<() => void>();

function notifier(): void {
  abonnes.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error(e);
    }
  });
}

/** Remplace le catalogue en mémoire (ignore une liste vide si on en a déjà une) et prévient les abonnés. */
export function definirCatalogueJeunes(catalogue: MecsJeune[] | null | undefined): void {
  if (!Array.isArray(catalogue)) return;
  if (catalogue.length === 0 && state.mecsJeunesCatalog.length > 0) return;
  state.mecsJeunesCatalog = catalogue;
  if (catalogue.length > 0) dernierEchec = false;
  notifier();
}

export function catalogueJeunesDisponible(): boolean {
  return state.mecsJeunesCatalog.length > 0;
}

export function catalogueJeunesEnChargement(): boolean {
  return chargementEnCours !== null;
}

export function catalogueJeunesEnEchec(): boolean {
  return dernierEchec;
}

/** Abonnement aux changements (arrivée, début/fin de chargement). Retourne la fonction de désabonnement. */
export function surCatalogueJeunes(cb: () => void): () => void {
  abonnes.add(cb);
  return () => abonnes.delete(cb);
}

function attendre(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function avecDelaiMax<T>(promesse: Promise<T>): Promise<T> {
  return Promise.race([
    promesse,
    new Promise<T>((_, rejeter) => setTimeout(() => rejeter(new Error("Délai dépassé")), DELAI_MAX_REQUETE_MS))
  ]);
}

async function charger(): Promise<boolean> {
  for (const delai of DELAIS_TENTATIVES_MS) {
    if (delai) await attendre(delai);
    const cleAuth = getCleAuth();
    if (!cleAuth || !navigator.onLine) return false;
    try {
      const data = await avecDelaiMax(fetchVault(cleAuth));
      if (Array.isArray(data.mecsCatalog) && data.mecsCatalog.length > 0) {
        definirCatalogueJeunes(data.mecsCatalog);
        return true;
      }
    } catch {
      // Serveur injoignable ou lent : on retente.
    }
  }
  return false;
}

/**
 * Garantit un catalogue chargé : ne fait rien s'il l'est déjà, sinon lance
 * (ou rejoint) un chargement avec plusieurs tentatives. Ne rejette jamais.
 */
export function assurerCatalogueJeunes(): Promise<boolean> {
  if (catalogueJeunesDisponible()) return Promise.resolve(true);
  if (chargementEnCours) return chargementEnCours;

  dernierEchec = false;
  chargementEnCours = charger()
    .catch(() => false)
    .then((ok) => {
      chargementEnCours = null;
      dernierEchec = !ok;
      notifier();
      return ok;
    });
  notifier();
  return chargementEnCours;
}

/** Relances automatiques : retour du réseau, retour dans l'app. */
export function initCatalogueJeunes(): void {
  window.addEventListener("online", () => {
    if (getCleAuth()) void assurerCatalogueJeunes();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && getCleAuth()) void assurerCatalogueJeunes();
  });
}
