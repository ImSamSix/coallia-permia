import { state } from "@/state/store";
import { sauvegarderToutesLesDonnees } from "@/services/storage";
import { securiserTexte } from "@/ui/dom-utils";
import { fermerModals } from "@/ui/modals";
import { renderFrigos, startResetFrigoEvalTimer, stopResetFrigoEvalTimer, ouvrirHistoriqueFrigos } from "@/features/frigos/frigos";
import { declencherCamera } from "@/features/frigos/signalement";
import { openMenu } from "@/features/navigation/navigation";
import { ouvrirScanner, basculerTorche } from "./scanner";
import { genererRecap } from "./recap";
import { telechargerPDF } from "@/features/pdf/pdf";
import { catNames, genericCatalog, catIcons, genericIcons } from "./catalog";
import type { InventoryCategory } from "@/types/inventory";

export type MaterielTab = "dispo" | "emprunt" | "frigos";
type ActionType = "unique" | "generic" | "return_generic" | "panier" | "panier_retour";

let accordions: Record<InventoryCategory, boolean> = {
  marmitexl: false,
  marmite: false,
  mixeur: false,
  bassine: false,
  cuiseurriz: false
};
let residentAccordions: Record<string, boolean> = {};

let modePanier = false;
let panierUnique: number[] = [];
let panierGeneric: Record<string, number> = {};
let modePanierRetour = false;
let panierRetour: (number | string)[] = [];

let selectedActionType: ActionType | null = null;
let selectedItemId: number | string | null = null;
let modalQty = 1;

// Chevron fin (même tracé que les sélecteurs de l'app) remplaçant les ▲/▼ :
// pointe vers le bas au repos, pivote à 180° une fois la carte ouverte.
function iconeChevronAccordion(ouvert: boolean): string {
  return `<svg class="acc-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; transition:transform 0.2s ease; transform:rotate(${ouvert ? 180 : 0}deg);"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
}

function iconePanier(): string {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21 8H6"></path></svg>`;
}

function iconeAnnulerSelection(): string {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
}

export function openMateriel(): void {
  document.getElementById("home-menu")?.classList.add("hidden");
  document.getElementById("main-app")?.classList.remove("hidden");

  // 🎯 On force l'affichage de l'onglet actif dès l'ouverture.
  //    Sans ça, la grille restait vide jusqu'au premier changement d'onglet.
  const ongletActif = document.querySelector(".tabs-nav .tab-btn.active");
  const tabId = (ongletActif ? ongletActif.id.replace("tab-btn-", "") : "dispo") as MaterielTab;
  switchTab(tabId);

  // 👑 INITIALISATION DU RENDU FLUIDE AU LANCEMENT
  setTimeout(() => {
    const activeBtn = document.querySelector<HTMLElement>(".tabs-nav .tab-btn.active");
    const indicator = document.getElementById("tab-indicator");
    if (activeBtn && indicator) {
      const initialLeft = activeBtn.offsetLeft;
      indicator.dataset.lastLeft = String(initialLeft); // Mémorise la position de départ

      const parentWidth = (activeBtn.parentNode as HTMLElement).offsetWidth;
      indicator.style.left = initialLeft + "px";
      indicator.style.right = parentWidth - (initialLeft + activeBtn.offsetWidth) + "px";
    }
  }, 10);
}

export function switchTab(tab: MaterielTab): void {
  document.getElementById("view-dispo")?.classList.toggle("hidden", tab !== "dispo");
  document.getElementById("view-emprunt")?.classList.toggle("hidden", tab !== "emprunt");
  document.getElementById("view-frigos")?.classList.toggle("hidden", tab !== "frigos");

  document.getElementById("tab-btn-dispo")?.classList.toggle("active", tab === "dispo");
  document.getElementById("tab-btn-emprunt")?.classList.toggle("active", tab === "emprunt");
  document.getElementById("tab-btn-frigos")?.classList.toggle("active", tab === "frigos");

  // ♿ On tient l'état accessible à jour en même temps que le visuel
  document.querySelectorAll(".tab-btn").forEach((b) => {
    b.setAttribute("aria-selected", b.classList.contains("active") ? "true" : "false");
  });

  // 👑 CAPTEUR CINÉTIQUE : CALCUL DE L'ÉTIREMENT DE LA PILULE
  const activeBtn = document.getElementById("tab-btn-" + tab);
  const indicator = document.getElementById("tab-indicator");
  if (activeBtn && indicator) {
    const oldLeft = parseFloat(indicator.dataset.lastLeft || "0");
    const newLeft = activeBtn.offsetLeft;

    // Injection instantanée de la classe selon la direction du clic
    if (newLeft > oldLeft) {
      indicator.className = "tab-indicator move-right";
    } else if (newLeft < oldLeft) {
      indicator.className = "tab-indicator move-left";
    }

    // Sauvegarde de la nouvelle position pour le prochain voyage
    indicator.dataset.lastLeft = String(newLeft);

    // Mutation dynamique des coordonnées Gauche/Droite
    const parentWidth = (activeBtn.parentNode as HTMLElement).offsetWidth;
    indicator.style.left = newLeft + "px";
    indicator.style.right = parentWidth - (newLeft + activeBtn.offsetWidth) + "px";
  }

  const btnScan = document.getElementById("main-scan-btn");
  const btnPhoto = document.getElementById("main-photo-btn");

  // ⚡ AFFICHAGE INSTANTANÉ SELON L'ONGLET
  if (tab === "frigos") {
    btnScan?.classList.add("hidden");
    btnPhoto?.classList.remove("hidden");
    renderFrigos(); // Plus de délai !
  } else {
    btnScan?.classList.remove("hidden");
    btnPhoto?.classList.add("hidden");
  }

  if (tab === "emprunt") {
    if (modePanier) toggleModePanier();
    const searchInput = document.getElementById("search-emprunt") as HTMLInputElement | null;
    if (searchInput && searchInput.value !== "") searchInput.value = "";
    renderItems(); // Plus de délai !
  }

  if (tab === "dispo") {
    if (modePanierRetour) toggleModePanierRetour();
    residentAccordions = {};
    renderItems(); // Plus de délai !
  }
}

export function toggleAccordion(cat: InventoryCategory): void {
  const ouverture = !accordions[cat];

  // 👑 Une seule catégorie dépliée à la fois : certaines comptent une
  // dizaine d'éléments, en garder plusieurs ouvertes en même temps
  // surchargerait l'écran. Ouvrir une catégorie referme donc les autres.
  //
  // Pas de renderItems() ici : la liste des disponibles n'a pas changé,
  // seul l'état déplié/replié bascule. En touchant directement les classes
  // sur les éléments déjà en place, la transition CSS peut réellement jouer
  // (un re-rendu recréerait les nœuds déjà dans leur état final, sans
  // transition visible).
  (Object.keys(accordions) as InventoryCategory[]).forEach((key) => {
    const doitEtreOuverte = key === cat ? ouverture : false;
    if (accordions[key] === doitEtreOuverte) return;
    accordions[key] = doitEtreOuverte;

    const wrapper = document.querySelector<HTMLElement>(`.accordion-content-wrapper[data-cat="${key}"]`);
    const chevron = document.querySelector<HTMLElement>(`.accordion-header[data-cat="${key}"] .acc-chevron`);
    wrapper?.classList.toggle("open", doitEtreOuverte);
    if (chevron) chevron.style.transform = `rotate(${doitEtreOuverte ? 180 : 0}deg)`;
  });
}

export function toggleResident(jeune: string): void {
  residentAccordions[jeune] = !residentAccordions[jeune];
  renderItems();
}

// ==========================================
// 4. LOGIQUE DES PANIERS (MATÉRIEL)
// ==========================================
export function toggleModePanier(): void {
  modePanier = !modePanier;
  const avaitDesGeneriquesSelectionnes = Object.keys(panierGeneric).length > 0;
  panierUnique = [];
  panierGeneric = {};
  const btn = document.getElementById("btn-mode-panier");
  if (btn) {
    if (modePanier) {
      btn.classList.add("active");
      btn.innerHTML = `<span style="display:inline-flex; align-items:center; gap:7px;">${iconeAnnulerSelection()}Annuler la sélection</span>`;
    } else {
      btn.classList.remove("active");
      btn.innerHTML = `<span style="display:inline-flex; align-items:center; gap:7px;">${iconePanier()}Mode Emprunt Groupé</span>`;
      document.getElementById("floating-panier")?.classList.add("hidden");
    }
  }

  // 👑 Ni les accordéons de catégories ni leurs icônes/chevrons ne changent
  // en activant/désactivant la sélection groupée : un renderItems() complet
  // les recréerait tous pour rien, ce qui les fait visuellement clignoter.
  // On retire juste la sélection visuelle des cartes uniques déjà en place…
  document.querySelectorAll("#list-dispo .item-card.available.selected-panier").forEach((el) => el.classList.remove("selected-panier"));
  // …et on ne reconstruit la grille "Petit Matériel" (Illimité ↔ contrôles de
  // quantité) que si elle avait vraiment quelque chose à réinitialiser —
  // sinon son contenu est déjà identique et la reconstruire ferait
  // clignoter ces icônes-là pour rien, à chaque appui.
  if (avaitDesGeneriquesSelectionnes) renderGenericGrid();
}

export function toggleModePanierRetour(): void {
  modePanierRetour = !modePanierRetour;
  panierRetour = [];
  const btn = document.getElementById("btn-mode-panier-retour");
  if (btn) {
    if (modePanierRetour) {
      btn.classList.add("active");
      btn.innerHTML = `<span style="display:inline-flex; align-items:center; gap:7px;">${iconeAnnulerSelection()}Annuler la sélection</span>`;
    } else {
      btn.classList.remove("active");
      btn.textContent = "📦 Mode Retour Groupé";
      document.getElementById("floating-panier")?.classList.add("hidden");
    }
  }
  renderItems();
}

function majBarrePanier(): void {
  const totalUnique = panierUnique.length;
  const totalGeneric = Object.values(panierGeneric).reduce((a, b) => a + b, 0);
  const total = totalUnique + totalGeneric;
  const barre = document.getElementById("floating-panier");
  const compteur = document.getElementById("panier-count");
  if (total > 0) {
    barre?.classList.remove("hidden");
    if (compteur) compteur.innerText = `${total} objet(s) à prêter`;
  } else {
    barre?.classList.add("hidden");
  }
}

function majBarrePanierRetour(): void {
  const total = panierRetour.length;
  const barre = document.getElementById("floating-panier");
  const compteur = document.getElementById("panier-count");
  if (total > 0) {
    barre?.classList.remove("hidden");
    if (compteur) compteur.innerText = `${total} objet(s) à rendre`;
  } else {
    barre?.classList.add("hidden");
  }
}

export function updatePanierGeneric(genId: string, delta: number, event: Event): void {
  event.stopPropagation();
  if (!panierGeneric[genId]) panierGeneric[genId] = 0;
  panierGeneric[genId] += delta;
  if (panierGeneric[genId] <= 0) delete panierGeneric[genId];
  majBarrePanier();
  renderGenericGrid();
}

// ==========================================
// 5. GESTION DES CLICS (MATÉRIEL)
// ==========================================
export function clicCarteUnique(id: number): void {
  const item = state.inventory.find((i) => i.id == id);
  if (!item) return;
  if (item.status === "available") {
    if (modePanier) {
      const nowSelected = !panierUnique.includes(id);
      if (nowSelected) panierUnique.push(id);
      else panierUnique = panierUnique.filter((i) => i !== id);
      majBarrePanier();
      // 👑 Sélectionner/désélectionner une carte ne change que sa propre
      // bordure : pas besoin de renderItems() (qui recréerait accordéons,
      // icônes et chevrons pour rien).
      document.querySelector(`#list-dispo .item-card.available[data-id="${id}"]`)?.classList.toggle("selected-panier", nowSelected);
    } else {
      selectedActionType = "unique";
      selectedItemId = id;
      ouvrirModal(item.name, true);
    }
  } else {
    if (modePanierRetour) {
      if (panierRetour.includes(id)) panierRetour = panierRetour.filter((i) => i !== id);
      else panierRetour.push(id);
      majBarrePanierRetour();
      renderItems();
    } else {
      selectedActionType = "unique";
      selectedItemId = id;
      ouvrirModal(item.name, false);
    }
  }
}

export function clicCarteGeneric(genId: string): void {
  if (modePanier) {
    if (!panierGeneric[genId]) panierGeneric[genId] = 1;
    else delete panierGeneric[genId];
    majBarrePanier();
    renderGenericGrid();
  } else {
    selectedActionType = "generic";
    selectedItemId = genId;
    modalQty = 1;
    const qtyDisplay = document.getElementById("modal-qty-display");
    if (qtyDisplay) qtyDisplay.innerText = String(modalQty);
    const gen = genericCatalog.find((g) => g.id === genId);
    if (gen) ouvrirModal(gen.name, true, true);
  }
}

export function clicRetourGeneric(loanId: string): void {
  if (modePanierRetour) {
    if (panierRetour.includes(loanId)) panierRetour = panierRetour.filter((id) => id !== loanId);
    else panierRetour.push(loanId);
    majBarrePanierRetour();
    renderItems();
  } else {
    selectedActionType = "return_generic";
    selectedItemId = loanId;
    const loan = state.genericLoans.find((l) => l.loanId == loanId);
    if (loan) ouvrirModal(loan.name, false);
  }
}

// ==========================================
// 6. MODALS ET VALIDATION (MATÉRIEL)
// ==========================================
export function ouvrirModal(nomMateriel: string, isDispo: boolean, showQty = false): void {
  document.getElementById("action-modal")?.classList.remove("hidden");
  document.getElementById("nom-jeune")?.classList.remove("input-error");
  document.getElementById("action-error")?.classList.add("hidden");

  const titre = document.getElementById("modal-title");
  const desc = document.getElementById("modal-desc");
  const inputContainer = document.getElementById("input-container");
  const nomJeuneInput = document.getElementById("nom-jeune") as HTMLInputElement | null;
  const qtyContainer = document.getElementById("qty-container");

  if (isDispo) {
    if (titre) titre.innerText = "Emprunter";
    if (desc) desc.innerText = `Prêter "${nomMateriel}" à :`;
    inputContainer?.classList.remove("hidden");
    if (nomJeuneInput) nomJeuneInput.value = "";
    qtyContainer?.classList.toggle("hidden", !showQty);
  } else {
    if (titre) titre.innerText = "Retour Matériel";
    if (desc) desc.innerText = `Confirmer le retour de "${nomMateriel}" ?`;
    inputContainer?.classList.add("hidden");
  }
}

export function ouvrirModalPanier(): void {
  if (modePanier) {
    selectedActionType = "panier";
    const total = panierUnique.length + Object.values(panierGeneric).reduce((a, b) => a + b, 0);
    ouvrirModal(`${total} objets sélectionnés`, true, false);
  } else if (modePanierRetour) {
    selectedActionType = "panier_retour";
    ouvrirModal(`${panierRetour.length} objets à rendre`, false, false);
  }
}

export function changeModalQty(delta: number): void {
  if (modalQty + delta >= 1) {
    modalQty += delta;
    const qtyDisplay = document.getElementById("modal-qty-display");
    if (qtyDisplay) qtyDisplay.innerText = String(modalQty);
  }
}

export function validerAction(): void {
  const nomJeuneInput = document.getElementById("nom-jeune") as HTMLInputElement;
  const nom = nomJeuneInput.value.trim();
  const pro = localStorage.getItem("coallia_pro_prenom") || "";

  if (selectedActionType !== "return_generic" && selectedActionType !== "panier_retour") {
    const item = selectedActionType === "unique" ? state.inventory.find((i) => i.id == selectedItemId) : null;
    if (selectedActionType === "generic" || selectedActionType === "panier" || (item && item.status === "available")) {
      if (!nom) {
        nomJeuneInput.classList.add("input-error");
        document.getElementById("action-error")?.classList.remove("hidden");
        return;
      }
    }
  }

  const timestamp = new Date();

  if (selectedActionType === "panier") {
    panierUnique.forEach((id) => {
      const i = state.inventory.find((x) => x.id == id);
      if (i) {
        i.status = "borrowed";
        i.jeune = nom;
        i.pro = pro;
        i.time = timestamp;
      }
    });
    for (const genId in panierGeneric) {
      const gen = genericCatalog.find((g) => g.id === genId);
      if (!gen) continue;
      state.genericLoans.push({
        loanId: String(Date.now() + Math.random()),
        genericId: genId,
        name: gen.name,
        qty: panierGeneric[genId],
        jeune: nom,
        pro: pro,
        time: timestamp
      });
    }
    residentAccordions[nom.toUpperCase()] = true;
    toggleModePanier();
  } else if (selectedActionType === "panier_retour") {
    panierRetour.forEach((id) => {
      const i = state.inventory.find((x) => x.id == id);
      if (i) {
        i.status = "available";
        i.jeune = "";
        i.pro = "";
        i.time = null;
      } else {
        state.genericLoans = state.genericLoans.filter((l) => l.loanId != id);
      }
    });
    toggleModePanierRetour();
  } else if (selectedActionType === "generic") {
    const gen = genericCatalog.find((g) => g.id === selectedItemId);
    if (gen) {
      state.genericLoans.push({
        loanId: String(Date.now() + Math.random()),
        genericId: String(selectedItemId),
        name: gen.name,
        qty: modalQty,
        jeune: nom,
        pro: pro,
        time: timestamp
      });
      residentAccordions[nom.toUpperCase()] = true;
    }
  } else if (selectedActionType === "return_generic") {
    state.genericLoans = state.genericLoans.filter((l) => l.loanId != selectedItemId);
  } else if (selectedActionType === "unique") {
    const item = state.inventory.find((i) => i.id == selectedItemId);
    if (item && item.status === "available") {
      item.status = "borrowed";
      item.jeune = nom;
      item.pro = pro;
      item.time = timestamp;
      residentAccordions[nom.toUpperCase()] = true;
    } else if (item) {
      item.status = "available";
      item.jeune = "";
      item.pro = "";
      item.time = null;
    }
  }

  sauvegarderToutesLesDonnees();
  fermerModals();
  renderItems();
}

// 👑 Isolé de renderItems() : la sélection groupée (modePanier) ne change
// que ce bloc (icône du matériel générique inchangée, seuls "Illimité" ↔
// les contrôles de quantité varient). Le rendre seul, sans reconstruire les
// accordéons de catégories, évite que leurs icônes et chevrons ne
// clignotent à chaque bascule du mode.
function renderGenericGrid(): void {
  const genericSection = document.getElementById("generic-materiel-section");
  if (!genericSection) return;
  genericSection.innerHTML = "";

  const titreGeneric = document.createElement("h3");
  titreGeneric.className = "section-title";
  titreGeneric.innerText = "Petit Matériel (Libre)";
  genericSection.appendChild(titreGeneric);

  const gridGeneric = document.createElement("div");
  gridGeneric.className = "items-grid";

  genericCatalog.forEach((gen) => {
    const qtyInPanier = panierGeneric[gen.id] || 0;
    const isSel = modePanier && qtyInPanier > 0;
    const card = document.createElement("div");
    card.className = `item-card generic ${isSel ? "selected-panier" : ""}`;
    card.onclick = () => clicCarteGeneric(gen.id);

    let actionHTML = `<p class="status-text" style="color:var(--coallia-blue)">Illimité</p>`;
    if (isSel) {
      actionHTML = `
                <div class="qty-controls">
                    <button class="qty-btn qty-btn-moins">-</button>
                    <span>${qtyInPanier}</span>
                    <button class="qty-btn qty-btn-plus">+</button>
                </div>
            `;
    }
    card.innerHTML = `<div class="status-line"></div><div class="card-body"><div class="info"><h3 style="display:flex; align-items:center; gap:8px;">${genericIcons[gen.id]}${gen.name}</h3></div>${actionHTML}</div>`;

    if (isSel) {
      card.querySelector(".qty-controls")?.addEventListener("click", (e) => e.stopPropagation());
      card.querySelector(".qty-btn-moins")?.addEventListener("click", (e) => updatePanierGeneric(gen.id, -1, e));
      card.querySelector(".qty-btn-plus")?.addEventListener("click", (e) => updatePanierGeneric(gen.id, 1, e));
    }
    gridGeneric.appendChild(card);
  });
  genericSection.appendChild(gridGeneric);
}

// ==========================================
// 7. AFFICHAGE DU MATÉRIEL
// ==========================================
export function renderItems(): void {
  const zoneDispo = document.getElementById("list-dispo");
  const zoneEmprunt = document.getElementById("list-emprunt");
  if (!zoneDispo || !zoneEmprunt) return;
  zoneDispo.innerHTML = "";
  zoneEmprunt.innerHTML = "";

  (Object.keys(catNames) as InventoryCategory[]).forEach((catKey) => {
    const items = state.inventory.filter((i) => i.category === catKey);
    const dispos = items.filter((i) => i.status === "available");
    const isOpen = accordions[catKey];

    const accHeader = document.createElement("div");
    accHeader.className = "accordion-header";
    accHeader.dataset.cat = catKey;
    accHeader.innerHTML = `<span style="display:inline-flex; align-items:center; gap:9px;">${catIcons[catKey]}${catNames[catKey]} (${dispos.length}/${items.length})</span> ${iconeChevronAccordion(isOpen)}`;
    accHeader.onclick = () => toggleAccordion(catKey);
    zoneDispo.appendChild(accHeader);

    // 👑 Le wrapper reste toujours dans le DOM (ouvert ou non) : c'est ce qui
    // permet à toggleAccordion() de se contenter de basculer une classe CSS
    // (déplié/replié fluide) plutôt que de tout reconstruire à chaque clic.
    const accWrapper = document.createElement("div");
    accWrapper.className = `accordion-content-wrapper ${isOpen ? "open" : ""}`;
    accWrapper.dataset.cat = catKey;
    const accContent = document.createElement("div");
    accContent.className = "accordion-content";
    dispos.forEach((item) => {
      const isSel = modePanier && panierUnique.includes(item.id);
      const card = document.createElement("div");
      card.className = `item-card available ${isSel ? "selected-panier" : ""}`;
      card.dataset.id = String(item.id);
      card.onclick = () => clicCarteUnique(item.id);
      card.innerHTML = `<div class="status-line"></div><div class="card-body"><div class="info"><h3 style="display:flex; align-items:center; gap:8px;">${catIcons[catKey]}${item.name}</h3></div><div class="dot-indicator"></div></div>`;
      accContent.appendChild(card);
    });
    if (dispos.length === 0) accContent.innerHTML = `<p style="color:var(--text-gray); font-size:13px; margin:5px 0;">Tout est emprunté.</p>`;
    accWrapper.appendChild(accContent);
    zoneDispo.appendChild(accWrapper);
  });

  const genericSection = document.createElement("div");
  genericSection.id = "generic-materiel-section";
  zoneDispo.appendChild(genericSection);
  renderGenericGrid();

  const creerCarteEmprunt = (
    idAction: number | string,
    name: string,
    statusClass: string,
    isOverdue: boolean,
    jeune: string,
    pro: string,
    time: number | string | Date | null,
    isGenericAction: boolean
  ): HTMLDivElement => {
    const isSelRetour = modePanierRetour && panierRetour.includes(idAction);
    const card = document.createElement("div");
    card.className = `item-card ${statusClass} ${isOverdue ? "overdue" : ""} ${isSelRetour ? "selected-panier" : ""}`;
    card.onclick = () => (isGenericAction ? clicRetourGeneric(String(idAction)) : clicCarteUnique(Number(idAction)));

    const heure = new Date(time ?? 0).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    card.innerHTML = `
            <div class="status-line"></div>
            <div class="card-body">
                <div class="info">
                    <h3>${name}</h3>
                    <p class="status-text">${isOverdue ? "RETARD ⚠️ (+24h)" : "En cours de prêt"}</p>
                </div>
                <div class="dot-indicator"></div>
            </div>
            <div class="card-footer">
                <div class="row"><span>👤 Jeune :</span> <b>${securiserTexte(jeune)}</b></div>
                <div class="row"><span>🔑 Professionnel ·le:</span> <b>${securiserTexte(pro)}</b></div>
                <div class="row"><span>🕒 Heure de prêt :</span> <b>${heure}</b></div>
            </div>
        `;
    return card;
  };

  const groupedLoans: Record<string, { type: "unique" | "generic"; data: unknown }[]> = {};
  const now = new Date();

  state.inventory
    .filter((i) => i.status !== "available")
    .forEach((item) => {
      const nomJeune = item.jeune.trim().toUpperCase();
      if (!groupedLoans[nomJeune]) groupedLoans[nomJeune] = [];
      groupedLoans[nomJeune].push({ type: "unique", data: item });
    });

  state.genericLoans.forEach((loan) => {
    const nomJeune = loan.jeune.trim().toUpperCase();
    if (!groupedLoans[nomJeune]) groupedLoans[nomJeune] = [];
    groupedLoans[nomJeune].push({ type: "generic", data: loan });
  });

  const residents = Object.keys(groupedLoans);

  if (residents.length === 0) {
    zoneEmprunt.innerHTML = `<p style="text-align:center; color:var(--text-gray); margin-top:30px; font-weight:600;">Aucun matériel en cours de prêt.</p>`;
  } else {
    // 🔍 FILTRAGE DE RECHERCHE INTELLIGENTE
    const searchInput = document.getElementById("search-emprunt") as HTMLInputElement | null;
    const searchTerm = searchInput ? searchInput.value.trim().toUpperCase() : "";

    // On ne garde que les résidents dont le nom contient ce qui est tapé
    const filteredResidents = residents.filter((jeune) => jeune.includes(searchTerm));

    if (filteredResidents.length === 0) {
      zoneEmprunt.innerHTML = `<p style="text-align:center; color:var(--text-gray); margin-top:30px; font-weight:600;">Aucun résultat pour "${securiserTexte(searchInput?.value ?? "")}".</p>`;
    } else {
      filteredResidents.forEach((jeune) => {
        // Pour la recherche : on ouvre l'accordéon automatiquement si on fait une recherche précise
        const isOpen = residentAccordions[jeune] === true || searchTerm.length > 1;

        const title = document.createElement("div");
        title.className = "resident-title";
        title.onclick = () => toggleResident(jeune);
        title.innerHTML = `<span>📦 MATÉRIEL DE : <b>${securiserTexte(jeune)}</b></span> <span>${isOpen ? "▲" : "▼"}</span>`;
        zoneEmprunt.appendChild(title);

        if (isOpen) {
          const gridCartes = document.createElement("div");
          gridCartes.className = "items-grid";

          groupedLoans[jeune].forEach((emprunt) => {
            const isGeneric = emprunt.type === "generic";
            if (isGeneric) {
              const loan = emprunt.data as (typeof state.genericLoans)[number];
              const diffHours = (now.getTime() - new Date(loan.time ?? 0).getTime()) / 3600000;
              const isOverdue = diffHours >= 24;
              const carteDOM = creerCarteEmprunt(loan.loanId, `${loan.name} (x${loan.qty})`, "borrowed", isOverdue, loan.jeune, loan.pro, loan.time, true);
              gridCartes.appendChild(carteDOM);
            } else {
              const item = emprunt.data as (typeof state.inventory)[number];
              const diffHours = (now.getTime() - new Date(item.time ?? 0).getTime()) / 3600000;
              const isOverdue = diffHours >= 24;
              const carteDOM = creerCarteEmprunt(item.id, item.name, "borrowed", isOverdue, item.jeune, item.pro, item.time, false);
              gridCartes.appendChild(carteDOM);
            }
          });
          zoneEmprunt.appendChild(gridCartes);
        }
      });
    }
  }
}

/** Câble l'écran matériel (onglets, scanner, paniers, modales) — une fois au démarrage. */
export function initMaterielListeners(): void {
  document.getElementById("btn-materiel-retour")?.addEventListener("click", openMenu);

  (["dispo", "emprunt", "frigos"] as MaterielTab[]).forEach((tab) => {
    document.getElementById(`tab-btn-${tab}`)?.addEventListener("click", () => switchTab(tab));
  });

  document.getElementById("main-scan-btn")?.addEventListener("click", ouvrirScanner);
  document.getElementById("main-photo-btn")?.addEventListener("click", declencherCamera);
  document.getElementById("btn-torche")?.addEventListener("click", basculerTorche);

  document.getElementById("btn-mode-panier")?.addEventListener("click", toggleModePanier);
  document.getElementById("btn-bilan")?.addEventListener("click", genererRecap);
  document.getElementById("btn-mode-panier-retour")?.addEventListener("click", toggleModePanierRetour);
  document.getElementById("search-emprunt")?.addEventListener("input", renderItems);

  document.getElementById("badge-etat-frigos")?.addEventListener("mousedown", startResetFrigoEvalTimer);
  document.getElementById("badge-etat-frigos")?.addEventListener("mouseup", stopResetFrigoEvalTimer);
  document.getElementById("badge-etat-frigos")?.addEventListener("mouseleave", stopResetFrigoEvalTimer);
  document.getElementById("badge-etat-frigos")?.addEventListener("touchstart", startResetFrigoEvalTimer, { passive: true });
  document.getElementById("badge-etat-frigos")?.addEventListener("touchend", stopResetFrigoEvalTimer);

  document.getElementById("lien-historique-frigos")?.addEventListener("click", (e) => {
    e.preventDefault();
    ouvrirHistoriqueFrigos();
  });

  document.getElementById("btn-qty-moins")?.addEventListener("click", () => changeModalQty(-1));
  document.getElementById("btn-qty-plus")?.addEventListener("click", () => changeModalQty(1));
  document.getElementById("btn-confirm-action")?.addEventListener("click", validerAction);

  document.getElementById("btn-valider-panier")?.addEventListener("click", ouvrirModalPanier);
  document.getElementById("btn-pdf-mat")?.addEventListener("click", () => telechargerPDF("materiel"));
}
