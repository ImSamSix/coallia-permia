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
import { catNames, genericCatalog } from "./catalog";
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
  accordions[cat] = !accordions[cat];
  renderItems();
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
  panierUnique = [];
  panierGeneric = {};
  const btn = document.getElementById("btn-mode-panier");
  if (btn) {
    if (modePanier) {
      btn.classList.add("active");
      btn.textContent = "❌ Annuler la sélection";
    } else {
      btn.classList.remove("active");
      btn.textContent = "🛒 Mode Emprunt Groupé";
      document.getElementById("floating-panier")?.classList.add("hidden");
    }
  }
  renderItems();
}

export function toggleModePanierRetour(): void {
  modePanierRetour = !modePanierRetour;
  panierRetour = [];
  const btn = document.getElementById("btn-mode-panier-retour");
  if (btn) {
    if (modePanierRetour) {
      btn.classList.add("active");
      btn.textContent = "❌ Annuler la sélection";
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
  renderItems();
}

// ==========================================
// 5. GESTION DES CLICS (MATÉRIEL)
// ==========================================
export function clicCarteUnique(id: number): void {
  const item = state.inventory.find((i) => i.id == id);
  if (!item) return;
  if (item.status === "available") {
    if (modePanier) {
      if (panierUnique.includes(id)) panierUnique = panierUnique.filter((i) => i !== id);
      else panierUnique.push(id);
      majBarrePanier();
      renderItems();
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
    renderItems();
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
    const accHeader = document.createElement("div");
    accHeader.className = "accordion-header";
    accHeader.innerHTML = `<span>${catNames[catKey]} (${dispos.length}/${items.length})</span> <span>${accordions[catKey] ? "▲" : "▼"}</span>`;
    accHeader.onclick = () => toggleAccordion(catKey);
    zoneDispo.appendChild(accHeader);

    if (accordions[catKey]) {
      const accContent = document.createElement("div");
      accContent.className = "accordion-content open";
      dispos.forEach((item) => {
        const isSel = modePanier && panierUnique.includes(item.id);
        const card = document.createElement("div");
        card.className = `item-card available ${isSel ? "selected-panier" : ""}`;
        card.onclick = () => clicCarteUnique(item.id);
        card.innerHTML = `<div class="status-line"></div><div class="card-body"><div class="info"><h3>${item.name}</h3></div><div class="dot-indicator"></div></div>`;
        accContent.appendChild(card);
      });
      if (dispos.length === 0) accContent.innerHTML = `<p style="color:var(--text-gray); font-size:13px; margin:5px 0;">Tout est emprunté.</p>`;
      zoneDispo.appendChild(accContent);
    }
  });

  const titreGeneric = document.createElement("h3");
  titreGeneric.className = "section-title";
  titreGeneric.innerText = "🍳 Petit Matériel (Libre)";
  zoneDispo.appendChild(titreGeneric);

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
    card.innerHTML = `<div class="status-line"></div><div class="card-body"><div class="info"><h3>${gen.name}</h3></div>${actionHTML}</div>`;

    if (isSel) {
      card.querySelector(".qty-controls")?.addEventListener("click", (e) => e.stopPropagation());
      card.querySelector(".qty-btn-moins")?.addEventListener("click", (e) => updatePanierGeneric(gen.id, -1, e));
      card.querySelector(".qty-btn-plus")?.addEventListener("click", (e) => updatePanierGeneric(gen.id, 1, e));
    }
    gridGeneric.appendChild(card);
  });
  zoneDispo.appendChild(gridGeneric);

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
