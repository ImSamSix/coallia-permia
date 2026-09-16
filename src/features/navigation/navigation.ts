import { state } from "@/state/store";
import { getCleMaitresse } from "@/services/crypto";
import { ouvrirLogout } from "@/features/session/session";
import { ouvrirPainModal } from "@/features/pain/pain";
import { ouvrirAnnuaire } from "@/features/annuaire/annuaire";
import { toggleThemeAnimated } from "@/features/theme/theme";
import { clicEasterEggAccueil } from "@/ui/easter-egg";
import { attacherEffetAppui } from "@/ui/press-effect";

/**
 * ⚠️ CORRECTIF DE MIGRATION : la section "3. Calcul des transmissions" de
 * l'ancien updateDashboardBadges() référençait `nbTrans` et `badgeTrans`,
 * deux identifiants jamais déclarés nulle part dans script.js (aucune vue
 * de transmissions n'existe dans cette base de code). En JavaScript non
 * strict cela levait une ReferenceError silencieuse à chaque ouverture du
 * menu (avalée par le navigateur, sans conséquence visible car c'était la
 * dernière instruction de la fonction). TypeScript refuse de compiler une
 * référence à un identifiant non déclaré : ce bloc mort est donc retiré ici
 * plutôt que reproduit artificiellement.
 */
export function updateDashboardBadges(): void {
  const now = new Date();

  // 1. Calcul des retards matériel (> 24h)
  let retards = 0;
  state.inventory
    .filter((i) => i.status !== "available")
    .forEach((item) => {
      const diffHours = (now.getTime() - new Date(item.time ?? 0).getTime()) / 3600000;
      if (diffHours >= 24) retards++;
    });

  let matSeen = parseInt(localStorage.getItem("mat_seen_count") || "0");
  if (retards < matSeen) {
    matSeen = retards;
    localStorage.setItem("mat_seen_count", String(matSeen));
  }
  const unseenMat = retards - matSeen;

  const badgeMat = document.getElementById("badge-materiel");
  if (badgeMat) {
    if (unseenMat > 0) {
      badgeMat.innerText = `${unseenMat} RETARD${unseenMat > 1 ? "S" : ""}`;
      badgeMat.className = "hub-badge";
      badgeMat.classList.remove("hidden");
    } else {
      badgeMat.classList.add("hidden");
    }
  }

  // 2. Calcul des frigos à évaluer
  let frigosAevaluer = 0;
  const UNE_SEMAINE = 7 * 24 * 60 * 60 * 1000;
  state.frigosData.forEach((f) => {
    const isCheck = f.cad && f.hyg && f.cont;
    const isRecent = f.time && now.getTime() - f.time < UNE_SEMAINE;
    if (!isCheck || !isRecent) frigosAevaluer++;
  });

  let frigoSeen = parseInt(localStorage.getItem("frigo_seen_count") || "0");
  if (frigosAevaluer < frigoSeen) {
    frigoSeen = frigosAevaluer;
    localStorage.setItem("frigo_seen_count", String(frigoSeen));
  }
  const unseenFrigo = frigosAevaluer - frigoSeen;

  const badgeFrigo = document.getElementById("badge-frigo");
  if (badgeFrigo) {
    if (unseenFrigo > 0) {
      badgeFrigo.innerText = `${unseenFrigo} FRIGO${unseenFrigo > 1 ? "S" : ""}`;
      badgeFrigo.className = "hub-badge warning";
      badgeFrigo.classList.remove("hidden");
    } else {
      badgeFrigo.classList.add("hidden");
    }
  }
}

export function openMenu(): void {
  document.querySelectorAll(".view").forEach((el) => el.classList.add("hidden"));
  document.getElementById("home-menu")?.classList.remove("hidden");

  const prenom = localStorage.getItem("coallia_pro_prenom") || "";
  const displayEl = document.getElementById("display-pro-menu");
  if (displayEl) displayEl.innerText = "👤 " + prenom;

  // 👑 PERSONNALISATION TEMPORELLE (Horaires Réels Coallia)
  const now = new Date();
  const day = now.getDay(); // 0 = Dimanche, 1 = Lundi, 5 = Vendredi, 6 = Samedi
  const time = now.getHours() + now.getMinutes() / 60; // Ex: 8h30 devient 8.5

  let message = "";
  let subMessage = "";

  // 1. Détection du Week-end (Vendredi 21h au Lundi 8h30)
  const isWeekend = (day === 5 && time >= 21) || day === 6 || day === 0 || (day === 1 && time < 8.5);

  if (isWeekend) {
    message = `Bon courage ${prenom} 🛡️`;
    subMessage = `L'équipe de veille compte sur vous ce week-end.`;
  }
  // 2. Détection de la Nuit en semaine (21h à 8h30)
  else if (time >= 21 || time < 8.5) {
    message = `Bonne veille ${prenom} 🌙`;
    subMessage = `Restez vigilant·e cette nuit.`;
  }
  // 3. Matin (8h30 à 12h30)
  else if (time >= 8.5 && time < 12.5) {
    message = `Bonjour ${prenom} ☕`;
    subMessage = `Bonne permanence du matin !`;
  }
  // 4. Pause Midi (12h30 à 14h00)
  else if (time >= 12.5 && time < 14) {
    message = `Bon appétit ${prenom} 🍽️`;
    subMessage = `Soufflez un peu avant la reprise de 14h.`;
  }
  // 5. Après-midi (14h00 à 16h00)
  else if (time >= 14 && time < 16) {
    message = `Bon après-midi ${prenom} 💪`;
    subMessage = `Dernière ligne droite avant la relève.`;
  }
  // 6. Fin de journée / Soirée (16h00 à 21h00)
  else if (time >= 16 && time < 21) {
    message = `Bonsoir ${prenom} 🌇`;
    subMessage = `Bonne permanence du soir !`;
  }

  // Injection dans le HTML
  const titleEl = document.getElementById("welcome-message");
  if (titleEl) {
    titleEl.innerHTML = `${message}<br><span style="font-size:15px; color:var(--text-gray); font-weight:600;">${subMessage}</span>`;
  }

  // Mise à jour des pastilles (Dashboard dynamique)
  updateDashboardBadges();
}

export function ouvrirMenuPro(): void {
  document.getElementById("pro-menu-modal")?.classList.remove("hidden");
}

/** 🔍 ÉCRAN 404 — page ou vue introuvable. */
export function afficherPage404(): void {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  document.getElementById("notfound-app")?.classList.remove("hidden");
}

export function retourAccueilDepuis404(): void {
  document.getElementById("notfound-app")?.classList.add("hidden");
  if (getCleMaitresse()) {
    openMenu();
  } else {
    document.getElementById("login-screen")?.classList.remove("hidden");
  }
}

/** Câble la barre supérieure de l'accueil, le message de bienvenue et l'écran 404. */
export function initNavigationListeners(): void {
  document.getElementById("pro-badge-home")?.addEventListener("click", ouvrirMenuPro);
  document.getElementById("btn-pain-modal")?.addEventListener("click", ouvrirPainModal);
  document.getElementById("btn-logout")?.addEventListener("click", ouvrirLogout);
  document.getElementById("welcome-message")?.addEventListener("click", clicEasterEggAccueil);
  document.getElementById("btn-404-retour")?.addEventListener("click", retourAccueilDepuis404);
  document.getElementById("btn-maintenance-refresh")?.addEventListener("click", () => window.location.reload());

  // Modale "Mon Espace" (ouverte par ouvrirMenuPro ci-dessus)
  document.getElementById("btn-annuaire")?.addEventListener("click", ouvrirAnnuaire);
  document.getElementById("btn-theme-toggle")?.addEventListener("click", toggleThemeAnimated);
  attacherEffetAppui(document.getElementById("btn-pro-menu-fermer"), 0.95);
}
