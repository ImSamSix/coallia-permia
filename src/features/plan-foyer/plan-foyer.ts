/**
 * Plan du foyer : vue par bâtiment, appartements dépliables, chambres avec
 * occupants. Fonctionnalité partagée avec Habita — même esthétique, mais la
 * source de données est ici state.mecsJeunesCatalog (déjà chargé au login
 * depuis Supabase, cf. worker/src/mecs-catalog.ts).
 *
 * ⚠️ Contrairement à Habita, on ne connaît pas la capacité réelle de chaque
 * chambre (nombre de lits) ni le référent de chaque appartement : ces deux
 * informations n'existent pas dans les données Supabase actuellement
 * partagées. Une chambre n'apparaît donc que si elle a au moins un occupant,
 * et aucune pastille "places libres" n'est affichée pour l'instant.
 */

import { state } from "@/state/store";
import { securiserTexte as echapper } from "@/ui/dom-utils";
import { vibrer } from "@/services/feedback";
import { openMenu } from "@/features/navigation/navigation";

let batPlan = "Capitainerie";
let aptOuvert: string | null = null;

function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Appartements d'un bâtiment (vide pour "Capitainerie", qui n'en a pas). */
function appartementsDe(bat: string): string[] {
  const vus = new Set<string>();
  state.mecsJeunesCatalog.forEach((j) => {
    if (j.bat === bat && j.apt) vus.add(j.apt);
  });
  return [...vus].sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
}

/** Chambres (occupées) d'un bâtiment, éventuellement filtrées à un appartement. */
function chambresDe(bat: string, apt: string | null): Record<string, string[]> {
  const chambres: Record<string, string[]> = {};
  state.mecsJeunesCatalog.forEach((j) => {
    if (j.bat !== bat) return;
    if (apt === null ? j.apt : j.apt !== apt) return;
    const nomComplet = `${j.prenom} ${j.nom}`.trim();
    if (!chambres[j.chambreNum]) chambres[j.chambreNum] = [];
    chambres[j.chambreNum].push(nomComplet);
  });
  return chambres;
}

interface ResidentIndexe {
  nom: string;
  bat: string;
  apt: string | null;
  chambre: string;
}

function indexResidents(): ResidentIndexe[] {
  return state.mecsJeunesCatalog.map((j) => ({
    nom: `${j.prenom} ${j.nom}`.trim(),
    bat: j.bat,
    apt: j.apt ?? null,
    chambre: j.chambreNum
  }));
}

export function changerBatPlan(bat: string): void {
  batPlan = bat;
  aptOuvert = null;
  document.querySelectorAll<HTMLElement>(".plan-onglet").forEach((b) => {
    b.classList.toggle("actif", b.dataset.bat === bat);
  });
  dessinerPlan();
}

function carteChambrePlan(num: string, occupants: string[]): string {
  const vide = occupants.length === 0;
  return `
    <div class="plan-chambre ${vide ? "vide" : ""}">
        <span class="plan-ch-num">Ch. ${echapper(num)}</span>
        <div class="plan-ch-noms">
            ${
              vide
                ? `<span class="plan-ch-vide">Inoccupée</span>`
                : occupants.map((n) => `<span class="plan-ch-nom">${echapper(n)}</span>`).join("")
            }
        </div>
    </div>`;
}

export function dessinerPlan(): void {
  const conteneur = document.getElementById("plan-contenu");
  if (!conteneur) return;

  let corps = "";

  if (batPlan === "Capitainerie") {
    const chambres = chambresDe("Capitainerie", null);
    corps = Object.keys(chambres)
      .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }))
      .map((numCh) => carteChambrePlan(numCh, chambres[numCh] as string[]))
      .join("");
  } else {
    corps = appartementsDe(batPlan)
      .map((apt) => {
        const chambres = chambresDe(batPlan, apt);
        const total = Object.values(chambres).flat().length;
        const ouvert = aptOuvert === apt;

        const detail = Object.keys(chambres)
          .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }))
          .map((numCh) => carteChambrePlan(numCh, chambres[numCh] as string[]))
          .join("");

        return `
            <div class="plan-apt ${ouvert ? "ouvert" : ""}">
                <button class="plan-apt-tete" data-apt="${echapper(apt)}">
                    <span class="plan-apt-num">${echapper(apt)}</span>
                    <span class="plan-apt-info">
                        <span class="plan-apt-nb">${total} résident${total > 1 ? "s" : ""}</span>
                    </span>
                    <span class="plan-apt-chev">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
                    </span>
                </button>
                <div class="plan-apt-detail" id="detail-${echapper(apt)}">
                    <div class="plan-apt-detail-corps">${detail}</div>
                </div>
            </div>`;
      })
      .join("");
  }

  conteneur.innerHTML = corps
    ? `<div class="plan-etage-corps">${corps}</div>`
    : `<p class="plan-vide">Aucun résident recensé pour le moment</p>`;

  conteneur.querySelectorAll<HTMLButtonElement>(".plan-apt-tete").forEach((btn) => {
    btn.addEventListener("click", () => basculerApt(btn.dataset.apt as string));
  });
}

export function basculerApt(apt: string): void {
  const precedent = aptOuvert;
  const ouverture = precedent !== apt;
  aptOuvert = ouverture ? apt : null;

  if (precedent && precedent !== apt) fermerDetailApt(precedent);

  const detail = document.getElementById("detail-" + apt);
  const carte = detail?.closest(".plan-apt");
  if (!detail || !carte) return;

  if (ouverture) {
    carte.classList.add("ouvert");
    const corps = detail.querySelector(".plan-apt-detail-corps") as HTMLElement;
    detail.style.height = corps.offsetHeight + "px";
    vibrer(20);
  } else {
    fermerDetailApt(apt);
  }
}

function fermerDetailApt(apt: string): void {
  const detail = document.getElementById("detail-" + apt);
  const carte = detail?.closest(".plan-apt");
  if (!detail || !carte) return;
  carte.classList.remove("ouvert");
  detail.style.height = "0px";
}

/* ==========================================================================
   Recherche de résident
   ========================================================================== */

export function chercherResident(terme: string): void {
  const zone = document.getElementById("plan-resultats") as HTMLElement;
  const contenu = document.getElementById("plan-contenu") as HTMLElement;
  const onglets = document.querySelector(".plan-onglets") as HTMLElement;
  const btnVider = document.getElementById("plan-rech-vider") as HTMLElement;

  const q = normaliser(terme).trim();
  btnVider.classList.toggle("hidden", q.length === 0);

  if (q.length < 2) {
    zone.innerHTML = "";
    contenu.style.display = "";
    onglets.style.display = "";
    return;
  }

  contenu.style.display = "none";
  onglets.style.display = "none";

  const trouves = indexResidents()
    .map((r) => {
      const mots = normaliser(r.nom)
        .split(/[\s'-]+/)
        .filter((m) => m);
      let rang = -1;
      for (let i = 0; i < mots.length; i++) {
        if ((mots[i] as string).startsWith(q)) {
          rang = i;
          break;
        }
      }
      return { ...r, rang };
    })
    .filter((r) => r.rang >= 0)
    .sort((a, b) => (a.rang !== b.rang ? a.rang - b.rang : a.nom.localeCompare(b.nom, "fr")));

  if (trouves.length === 0) {
    zone.innerHTML = `
        <div class="plan-aucun">
            <span class="plan-aucun-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path><path d="M8 11h6"></path></svg>
            </span>
            <span class="plan-aucun-txt">Aucun résident trouvé</span>
        </div>`;
    return;
  }

  zone.innerHTML =
    `<span class="plan-rech-compte">${trouves.length} résultat${trouves.length > 1 ? "s" : ""}</span>` +
    trouves
      .slice(0, 20)
      .map(
        (r) => `
        <div class="plan-resultat">
            <span class="plan-res-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </span>
            <span class="plan-res-txt">
                <span class="plan-res-nom">${echapper(r.nom)}</span>
                <span class="plan-res-lieu">${
                  r.apt ? "Bâtiment " + echapper(r.bat) + " · Apt " + echapper(r.apt) : "Capitainerie"
                } · Chambre ${echapper(r.chambre)}</span>
            </span>
        </div>`
      )
      .join("");
}

export function viderRecherche(): void {
  (document.getElementById("plan-rech-champ") as HTMLInputElement).value = "";
  chercherResident("");
}

/* ==========================================================================
   Navigation
   ========================================================================== */

export function ouvrirPlanFoyer(): void {
  document.getElementById("pro-menu-modal")?.classList.add("hidden");
  document.querySelectorAll(".view").forEach((el) => el.classList.add("hidden"));
  document.getElementById("plan-foyer-view")?.classList.remove("hidden");

  batPlan = "Capitainerie";
  aptOuvert = null;
  document.querySelectorAll<HTMLElement>(".plan-onglet").forEach((b) => {
    b.classList.toggle("actif", b.dataset.bat === "Capitainerie");
  });

  const champRech = document.getElementById("plan-rech-champ") as HTMLInputElement | null;
  if (champRech) champRech.value = "";
  chercherResident("");
  dessinerPlan();
}

export function initPlanFoyerListeners(): void {
  document.getElementById("btn-plan-foyer")?.addEventListener("click", ouvrirPlanFoyer);
  document.getElementById("btn-plan-foyer-retour")?.addEventListener("click", openMenu);

  document.querySelectorAll<HTMLButtonElement>(".plan-onglet").forEach((btn) => {
    btn.addEventListener("click", () => changerBatPlan(btn.dataset.bat as string));
  });

  const champRech = document.getElementById("plan-rech-champ") as HTMLInputElement | null;
  champRech?.addEventListener("input", () => chercherResident(champRech.value));
  document.getElementById("plan-rech-vider")?.addEventListener("click", viderRecherche);
}
