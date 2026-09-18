import { state } from "@/state/store";
import { sauvegarderToutesLesDonnees } from "@/services/storage";
import { synchroniserDonnees } from "@/services/sync";
import { jouerSon } from "@/ui/sound";
import { vibrer } from "@/services/feedback";
import { fermerModals } from "@/ui/modals";
import { demanderConfirmation } from "@/ui/confirm-modal";
import { attacherEffetAppui } from "@/ui/press-effect";
import type { CadenasState, ContenuState, FrigoEvalTemp, FrigoLog, HygieneState } from "@/types/frigo";

/** Lien "Consulter l'historique des frigos" (SharePoint) — URL encodée en base64 dans l'ancien code, conservée à l'identique. */
export function ouvrirHistoriqueFrigos(): void {
  window.open(atob("aHR0cHM6Ly9jb2FsbGlhb3JnLnNoYXJlcG9pbnQuY29tLzp4Oi9zL0NvYWxsaWFfUGVybWlhL0lRQ2FJNHZ4V21oeFJMMlEwcGZTRklqNUFVM0NfSDBQYXZEU2xEdWZuWnowVVhvP2U9MTVXcmlT"), "_blank");
}

// 🎨 Icônes SVG des cartes frigo — même tracé que les boutons d'évaluation
// correspondants, coloré selon l'état (vert/orange/rouge/gris) pour rester
// intuitif d'un coup d'œil, sans avoir à lire le libellé sous l'icône.
function iconLockPresent(): string {
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>`;
}
function iconLockOpen(): string {
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 7.75-1.5"></path></svg>`;
}
function iconLockBroken(): string {
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path><line x1="3" y1="3" x2="21" y2="21"></line></svg>`;
}
function iconSparkle(): string {
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`;
}
function iconAlerteTriangle(): string {
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
}
function iconVirus(): string {
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"></circle><line x1="17" y1="12" x2="21.3" y2="12"></line><circle cx="21.3" cy="12" r="1.6"></circle><line x1="14.5" y1="16.3" x2="16.7" y2="20.1"></line><circle cx="16.7" cy="20.1" r="1.6"></circle><line x1="9.5" y1="16.3" x2="7.3" y2="20.1"></line><circle cx="7.3" cy="20.1" r="1.6"></circle><line x1="7" y1="12" x2="2.7" y2="12"></line><circle cx="2.7" cy="12" r="1.6"></circle><line x1="9.5" y1="7.7" x2="7.3" y2="3.9"></line><circle cx="7.3" cy="3.9" r="1.6"></circle><line x1="14.5" y1="7.7" x2="16.7" y2="3.9"></line><circle cx="16.7" cy="3.9" r="1.6"></circle></svg>`;
}
function iconCheck(): string {
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`;
}
function iconTag(): string {
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r="1.5"></circle></svg>`;
}
function iconInconnu(): string {
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
}
function iconUsers(): string {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
}

// ==========================================
// 19. GESTION DES FRIGOS (DASHBOARD & ÉVALUATION)
// ==========================================
export function renderFrigos(): void {
  const container = document.getElementById("list-frigos");
  if (!container) return;
  container.innerHTML = "";

  const now = new Date();
  const UNE_SEMAINE = 7 * 24 * 60 * 60 * 1000;

  state.frigosData.forEach((f) => {
    const isCheck = f.cad && f.hyg && f.cont;
    const isRecent = f.time && now.getTime() - f.time < UNE_SEMAINE;
    const statusColor = isCheck && isRecent ? "var(--coallia-blue)" : "var(--warning)";

    const iconCad =
      f.cad === "ok"
        ? { svg: iconLockPresent(), couleur: "var(--success)" }
        : f.cad === "open"
          ? { svg: iconLockOpen(), couleur: "var(--warning)" }
          : f.cad === "lost"
            ? { svg: iconLockBroken(), couleur: "var(--danger)" }
            : { svg: iconInconnu(), couleur: "var(--text-gray)" };
    const iconHyg =
      f.hyg === "clean"
        ? { svg: iconSparkle(), couleur: "var(--success)" }
        : f.hyg === "med"
          ? { svg: iconAlerteTriangle(), couleur: "var(--warning)" }
          : f.hyg === "dirty"
            ? { svg: iconVirus(), couleur: "var(--danger)" }
            : { svg: iconInconnu(), couleur: "var(--text-gray)" };
    const iconCont =
      f.cont === "ok"
        ? { svg: iconCheck(), couleur: "var(--success)" }
        : f.cont === "sort"
          ? { svg: iconTag(), couleur: "var(--danger)" }
          : { svg: iconInconnu(), couleur: "var(--text-gray)" };

    const lastTime = f.time ? new Date(f.time).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "Jamais évalué";
    const lastPro = f.pro ? f.pro : "-";

    const card = document.createElement("div");
    card.className = "item-card";
    card.style.marginBottom = "20px";

    card.innerHTML = `
            <div class="status-line" style="background: ${statusColor}; height: 5px;"></div>

            <div class="card-body" style="padding: 25px 20px; display: flex; flex-direction: column; align-items: stretch;">

                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 22px; color: var(--text-dark); font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">${f.name}</h3>
                    <button class="btn-voir-jeunes" style="background: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-dark); padding: 8px 16px; font-size: 13px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 7px;">${iconUsers()}Voir les jeunes</button>
                </div>

                <div style="display: flex; justify-content: space-evenly; background: var(--input-bg); padding: 18px 5px; border-radius: 18px; margin-bottom: 25px;">
                    <div style="text-align: center;">
                        <div style="margin-bottom: 6px; color: ${iconCad.couleur}; display: flex; justify-content: center;">${iconCad.svg}</div>
                        <div style="font-size: 10px; color: var(--text-gray); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Cadenas</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="margin-bottom: 6px; color: ${iconHyg.couleur}; display: flex; justify-content: center;">${iconHyg.svg}</div>
                        <div style="font-size: 10px; color: var(--text-gray); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Hygiène</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="margin-bottom: 6px; color: ${iconCont.couleur}; display: flex; justify-content: center;">${iconCont.svg}</div>
                        <div style="font-size: 10px; color: var(--text-gray); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Contenu</div>
                    </div>
                </div>

                <button class="btn-primary btn-nouvelle-eval" style="width: 100%; padding: 16px; font-size: 15px; border-radius: 14px; font-weight: 700; box-shadow: 0 4px 15px rgba(0,85,164,0.2);">Nouvelle Évaluation</button>
            </div>

            <div class="card-footer" style="background: var(--footer-bg); padding: 14px 20px; font-size: 11px; color: var(--text-gray); display: flex; justify-content: space-between; border-top: 1px solid var(--border-color);">
                <span>Le <b style="color: var(--text-dark);">${lastTime}</b></span>
                <span>Par <b style="color: var(--text-dark);">${lastPro}</b></span>
            </div>
        `;
    card.querySelector(".btn-voir-jeunes")?.addEventListener("click", () => voirJeunesFrigo(f.id));
    card.querySelector(".btn-nouvelle-eval")?.addEventListener("click", () => ouvrirEvalFrigo(f.id));
    container.appendChild(card);
  });
}

let frigoEnCoursEval: number | null = null;
let evalTemp: FrigoEvalTemp = { cad: null, hyg: null, cont: null };

/** Modale "Jeunes affectés à ce frigo" (dernière définition de l'ancien script.js — la première était provisoire et a été remplacée). */
export function voirJeunesFrigo(id: number): void {
  const titre = document.getElementById("jeunes-frigo-title");
  if (titre) titre.innerText = "Frigo " + id + " - Jeunes";
  const container = document.getElementById("liste-jeunes-frigo");
  if (!container) return;

  const frigo = state.frigosData[id - 1];
  if (!frigo.residents) frigo.residents = [];
  const liste = frigo.residents;

  if (liste.length === 0) {
    container.innerHTML = "<i style='color: var(--text-gray); display: block; text-align: center;'>Aucun jeune n'est assigné à ce frigo pour le moment.</i>";
  } else {
    let html = "<ul style='padding-left: 20px; margin: 0; padding-right: 5px;'>";
    liste.forEach((nom) => {
      html += `<li style="margin-bottom: 8px; word-break: break-word; overflow-wrap: break-word; hyphens: auto; line-height: 1.4;">${nom}</li>`;
    });
    html += "</ul>";
    container.innerHTML = html;
  }

  document.getElementById("jeunes-frigo-modal")?.classList.remove("hidden");
}

export function ouvrirEvalFrigo(id: number): void {
  frigoEnCoursEval = id;
  evalTemp = { cad: null, hyg: null, cont: null };
  const titre = document.getElementById("eval-frigo-title");
  if (titre) titre.innerText = "Évaluer Frigo " + id;

  // Nettoyage visuel de la précédente ouverture
  document.querySelectorAll(".btn-eval").forEach((b) => b.classList.remove("selected"));
  document.getElementById("frigo-error-bubble")?.classList.add("hidden");
  ["cad-container", "hyg-container", "cont-container"].forEach((cid) => {
    const el = document.getElementById(cid) as HTMLElement | null;
    if (el) {
      el.style.borderColor = "transparent";
      el.style.backgroundColor = "transparent";
    }
  });

  const obsInput = document.getElementById("eval-frigo-obs") as HTMLTextAreaElement | null;
  if (obsInput) {
    obsInput.value = "";
    obsInput.style.height = "54px";
  }

  document.getElementById("eval-frigo-modal")?.classList.remove("hidden");
}

export function selectEval(cat: "cad" | "hyg" | "cont", val: CadenasState | HygieneState | ContenuState): void {
  (evalTemp as Record<"cad" | "hyg" | "cont", string | null>)[cat] = val;
  // Mettre en surbrillance le bouton cliqué et éteindre les autres de la même catégorie
  // (ne cible que les vrais boutons : [id^="cad-"] matcherait aussi #cad-container)
  document.querySelectorAll(`.btn-eval[id^="${cat}-"]`).forEach((b) => b.classList.remove("selected"));
  document.getElementById(`${cat}-${val}`)?.classList.add("selected");
}

export function validerEvalFrigo(): void {
  // 1. Réinitialiser les erreurs visuelles
  const containers = ["cad-container", "hyg-container", "cont-container"];
  containers.forEach((id) => {
    const el = document.getElementById(id) as HTMLElement | null;
    if (el) {
      el.style.borderColor = "transparent";
      el.style.backgroundColor = "transparent";
    }
  });

  // 2. Vérifier s'il manque des critères (et allumer la ligne concernée)
  let hasError = false;

  if (!evalTemp.cad) {
    setErreurContainer("cad-container");
    hasError = true;
  }
  if (!evalTemp.hyg) {
    setErreurContainer("hyg-container");
    hasError = true;
  }
  if (!evalTemp.cont) {
    setErreurContainer("cont-container");
    hasError = true;
  }

  // 3. Afficher l'alerte, vibrer et bloquer l'envoi
  if (hasError) {
    const errorBubble = document.getElementById("frigo-error-bubble");
    errorBubble?.classList.remove("hidden");

    vibrer(200); // Bzzzt d'erreur
    jouerSon("error"); // Bruit d'erreur

    setTimeout(() => {
      errorBubble?.classList.add("hidden");
      containers.forEach((id) => {
        const el = document.getElementById(id) as HTMLElement | null;
        if (el) {
          el.style.borderColor = "transparent";
          el.style.backgroundColor = "transparent";
        }
      });
    }, 3000);
    return; // On arrête tout si un champ manque !
  }

  // 4. Si tout est bon, on enregistre
  const now = new Date();
  const proName = localStorage.getItem("coallia_pro_prenom") || "Inconnu";
  const obsInput = document.getElementById("eval-frigo-obs") as HTMLTextAreaElement | null;
  const obsText = obsInput ? obsInput.value.trim() : "";

  const f = state.frigosData.find((x) => x.id === frigoEnCoursEval);
  if (f) {
    f.cad = evalTemp.cad;
    f.hyg = evalTemp.hyg;
    f.cont = evalTemp.cont;
    f.time = now.getTime();
    f.pro = proName;
  }

  const labelsCad: Record<CadenasState, string> = { ok: "🔒 Présent", open: "🔓 Ouvert", lost: "❌ Cassé" };
  const labelsHyg: Record<HygieneState, string> = { clean: "✨ Propre", med: "⚠️ Moyen", dirty: "☣️ Sale" };
  const labelsCont: Record<ContenuState, string> = { ok: "✅ R.A.S", sort: "🏷️ Tri à faire" };

  const log: FrigoLog = {
    idLog: now.getTime(),
    date: now.toLocaleDateString("fr-FR"),
    heure: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    educateur: proName,
    frigoId: f ? f.id : 0,
    nomFrigo: f ? f.name : "",
    cadenas: evalTemp.cad ? labelsCad[evalTemp.cad] : "",
    hygiene: evalTemp.hyg ? labelsHyg[evalTemp.hyg] : "",
    contenu: evalTemp.cont ? labelsCont[evalTemp.cont] : "",
    observations: obsText,
    synced: false
  };
  state.frigoLogs.push(log);

  sauvegarderToutesLesDonnees();
  synchroniserDonnees();

  renderFrigos();
  fermerModals();

  vibrer([50, 50]);
}

function setErreurContainer(id: string): void {
  const el = document.getElementById(id) as HTMLElement | null;
  if (el) {
    el.style.borderColor = "var(--danger)";
    el.style.backgroundColor = "rgba(255, 59, 48, 0.1)";
  }
}

export function effacerObsFrigo(): void {
  const textarea = document.getElementById("eval-frigo-obs") as HTMLTextAreaElement;
  textarea.value = "";
  textarea.style.height = "54px";
  textarea.focus();
}

// ==========================================
// 20. MODE ADMIN FRIGOS (SECRET)
// ==========================================
let frigoPressTimer: ReturnType<typeof setTimeout>;

export function startFrigoTimer(): void {
  frigoPressTimer = setTimeout(() => {
    ouvrirAdminFrigos();
  }, 5000);
}

export function cancelFrigoTimer(): void {
  clearTimeout(frigoPressTimer);
}

export function ouvrirAdminFrigos(): void {
  vibrer([50, 50, 50]);

  // On remet le sélecteur à zéro ("Sélectionner un frigo...")
  const select = document.getElementById("admin-frigo-select") as HTMLSelectElement;
  select.value = "";

  // On remet la bulle de texte à sa taille de base
  const inputName = document.getElementById("new-resident-name") as HTMLTextAreaElement;
  inputName.value = "";
  inputName.style.height = "54px";

  renderAdminList();
  document.getElementById("admin-frigo-modal")?.classList.remove("hidden");
}

export function renderAdminList(): void {
  const selectVal = (document.getElementById("admin-frigo-select") as HTMLSelectElement).value;
  const container = document.getElementById("admin-resident-list");
  if (!container) return;
  container.innerHTML = "";

  // Si aucun frigo n'est sélectionné
  if (!selectVal) {
    container.innerHTML = `<span style="color:var(--text-gray); font-size:13px; font-style:italic; width:100%; text-align:center;">Veuillez d'abord sélectionner un frigo.</span>`;
    return;
  }

  const frigoId = parseInt(selectVal);
  const frigo = state.frigosData[frigoId - 1];
  if (!frigo.residents) frigo.residents = [];
  const liste = frigo.residents;

  if (liste.length === 0) {
    container.innerHTML = `<span style="color:var(--text-gray); font-size:13px; font-style:italic; width:100%; text-align:center;">Aucun jeune assigné à ce frigo.</span>`;
    return;
  }

  // Création des tags avec un beau design qui gère les noms longs
  liste.forEach((nom, index) => {
    const tag = document.createElement("div");
    tag.style.cssText =
      "background: var(--card-color); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 20px; font-size: 14px; color: var(--text-dark); display: flex; align-items: center; gap: 8px; font-weight: 600; box-shadow: 0 2px 5px rgba(0,0,0,0.05); max-width: 100%;";

    const nameSpan = document.createElement("span");
    nameSpan.style.cssText = "flex: 1; word-break: break-word; overflow-wrap: break-word; hyphens: auto;";
    nameSpan.textContent = nom;

    const closeSpan = document.createElement("span");
    closeSpan.onclick = () => supprimerResidentAdmin(frigoId, index);
    closeSpan.style.cssText = "cursor: pointer; color: var(--danger); font-weight: 800; font-size: 16px; margin-left: 4px; flex-shrink: 0;";
    closeSpan.textContent = "✕";

    tag.appendChild(nameSpan);
    tag.appendChild(closeSpan);

    container.appendChild(tag);
  });
}

export function ajouterResidentAdmin(): void {
  const select = document.getElementById("admin-frigo-select") as HTMLSelectElement;
  const selectVal = select.value;
  const input = document.getElementById("new-resident-name") as HTMLTextAreaElement;
  const nom = input.value.trim();

  // Sécurité : il faut choisir un frigo
  if (!selectVal) {
    select.style.border = "1px solid var(--danger)";
    setTimeout(() => (select.style.border = "1px solid transparent"), 2000);
    vibrer(200);
    return;
  }

  const frigoId = parseInt(selectVal);

  if (nom) {
    const frigo = state.frigosData[frigoId - 1];
    if (!frigo.residents) frigo.residents = [];
    frigo.residents.push(nom);

    sauvegarderToutesLesDonnees();
    renderAdminList();

    // Vider le champ et le remettre à la bonne taille
    input.value = "";
    input.style.height = "54px";
    input.focus();
  }
}

export function supprimerResidentAdmin(frigoId: number, index: number): void {
  state.frigosData[frigoId - 1].residents.splice(index, 1);
  sauvegarderToutesLesDonnees();
  renderAdminList();
}

// ==========================================
// 23. COMMANDE SECRÈTE : RESET ÉVALUATIONS FRIGOS (5s)
// ==========================================
let resetFrigoEvalTimer: ReturnType<typeof setTimeout>;

export function startResetFrigoEvalTimer(): void {
  resetFrigoEvalTimer = setTimeout(() => {
    purgerEvaluationsFrigos();
  }, 5000);
}

export function stopResetFrigoEvalTimer(): void {
  clearTimeout(resetFrigoEvalTimer);
}

function purgerEvaluationsFrigos(): void {
  // 🛡️ GARDE : la remise à zéro est irréversible et se propage au cloud.
  //    Sur un téléphone partagé, un appui long involontaire ne doit jamais
  //    effacer des contrôles sanitaires sans confirmation.
  const nbEvalues = state.frigosData.filter((f) => f.cad || f.hyg || f.cont).length;

  if (nbEvalues === 0) {
    console.log("🤫 Purge demandée mais aucun frigo n'est évalué.");
    return;
  }

  demanderConfirmation(
    "Remettre à zéro les évaluations ?",
    nbEvalues + " frigo(s) évalué(s) repasseront en état inconnu.\n" + "Les listes de jeunes rattachés seront conservées.",
    executerPurgeFrigos
  );
}

function executerPurgeFrigos(): void {
  // On réinitialise uniquement les critères d'évaluation
  // Les listes de résidents (f.residents) restent intactes !
  state.frigosData.forEach((f) => {
    f.cad = null;
    f.hyg = null;
    f.cont = null;
    f.time = null;
    f.pro = null;
  });

  sauvegarderToutesLesDonnees();
  renderFrigos(); // Recharge l'affichage instantanément

  // Effets visuels et sonores de succès
  vibrer([100, 50, 100]);
  jouerSon("success");

  // Animation de la bulle pour confirmer
  const badge = document.getElementById("badge-etat-frigos");
  if (badge) {
    const originalText = "📊 État actuel des frigos";
    badge.innerText = "✨ Évaluations purgées !";
    badge.style.background = "var(--success)";
    badge.style.color = "white";

    // Retour à la normale après 3 secondes
    setTimeout(() => {
      badge.innerText = originalText;
      badge.style.background = "var(--card-color)";
      badge.style.color = "var(--text-dark)";
    }, 3000);
  }

  console.log("🤫 Nettoyage des évaluations frigos effectué.");
}

/** Câble le mode admin secret sur l'onglet Frigos (appui long 5s). */
export function initFrigoTabLongPress(): void {
  const btnFrigoTab = document.getElementById("tab-btn-frigos");
  if (!btnFrigoTab) return;
  btnFrigoTab.addEventListener("mousedown", startFrigoTimer);
  btnFrigoTab.addEventListener("touchstart", startFrigoTimer);
  btnFrigoTab.addEventListener("mouseup", cancelFrigoTimer);
  btnFrigoTab.addEventListener("mouseleave", cancelFrigoTimer);
  btnFrigoTab.addEventListener("touchend", cancelFrigoTimer);
}

/** Câble les modales frigos (évaluation + mode admin). */
export function initFrigoModalListeners(): void {
  // ⚠️ On cible .btn-eval (pas [id^="cad-"] etc.) : les conteneurs
  // #cad-container/#hyg-container/#cont-container correspondaient aussi à
  // ce préfixe, et leur écouteur se déclenchait en plus par bulle à chaque
  // clic sur un bouton, écrasant aussitôt la sélection qui venait d'être faite.
  document.querySelectorAll<HTMLButtonElement>(".btn-eval").forEach((btn) => {
    const separateur = btn.id.indexOf("-");
    if (separateur === -1) return;
    const cat = btn.id.slice(0, separateur) as "cad" | "hyg" | "cont";
    const val = btn.id.slice(separateur + 1) as CadenasState | HygieneState | ContenuState;
    btn.addEventListener("click", () => selectEval(cat, val));
  });
  document.getElementById("eval-frigo-obs-effacer")?.addEventListener("click", effacerObsFrigo);
  document.getElementById("btn-valider-eval-frigo")?.addEventListener("click", validerEvalFrigo);

  document.getElementById("admin-frigo-select")?.addEventListener("change", renderAdminList);
  document.getElementById("btn-ajouter-resident")?.addEventListener("click", ajouterResidentAdmin);

  attacherEffetAppui(document.getElementById("btn-jeunes-frigo-fermer"), 0.95);
}
