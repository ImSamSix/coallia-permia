import "@/styles/main.css";
import { registerSW } from "virtual:pwa-register";

import { initMonitoring } from "@/services/monitoring";
import { state } from "@/state/store";
import { getCleAuth, getCleMaitresse } from "@/services/crypto";
import { dechiffrerCoffreLocal, purgerDonneesAnciennes, definirCallbackApresSauvegarde } from "@/services/storage";
import { synchroniserDonnees } from "@/services/sync";
import { fetchVault, verifierSanteWorker } from "@/services/permia-relay";
import { retour } from "@/services/feedback";
import { initTheme } from "@/features/theme/theme";
import { openMenu } from "@/features/navigation/navigation";
import { initialiserAutosave, purgerToutAutosave, signalerActivite, verifierSession } from "@/features/session/session";
import { startClock } from "@/features/medicaments/medicaments";
import { rafraichirBadgeAttente } from "@/ui/pending-badge";
import { initApp } from "@/app-init";
import { iconeCheckSucces, iconeNuageBarre, iconeServeur } from "@/ui/icons";

// Espacé volontairement (3 min, pas 45s) : marge large sur le quota gratuit
// Cloudflare (Workers + KV), qu'UptimeRobot sollicite déjà en parallèle.
const INTERVALLE_VERIF_SANTE_MS = 3 * 60 * 1000;

// 🚧 Bascule manuelle d'intervention : coupe l'app entière sur l'écran de maintenance.
const MODE_MAINTENANCE = false;

// Avant tout le reste : capte aussi les erreurs qui pourraient survenir
// pendant l'initialisation elle-même.
initMonitoring();

initApp();
definirCallbackApresSauvegarde(rafraichirBadgeAttente);

window.onload = async () => {
  initTheme();

  // 👑 ENREGISTREMENT DU SERVICE WORKER (PWA autonome pour le hors-ligne total)
  registerSW({
    immediate: true,
    onRegisteredSW() {
      console.log("🛡️ Permia : Service Worker actif (Mode hors-ligne sécurisé)");
    },
    onRegisterError(err) {
      console.error("🛑 Permia : Échec SW", err);
    }
  });

  if (MODE_MAINTENANCE) {
    document.querySelectorAll(".view").forEach((el) => el.classList.add("hidden"));
    document.getElementById("maintenance-app")?.classList.remove("hidden");
    setTimeout(() => {
      const splash = document.getElementById("splash-screen") as HTMLElement | null;
      if (splash) splash.style.opacity = "0";
    }, 500);
    setTimeout(() => {
      const splash = document.getElementById("splash-screen") as HTMLElement | null;
      if (splash) splash.style.display = "none";
    }, 1000);
    return;
  }

  startClock();
  initialiserAutosave();

  // 🛡️ VÉRIFICATION DE LA SÉCURITÉ AU DÉMARRAGE
  const prenom = localStorage.getItem("coallia_pro_prenom");
  const expire = localStorage.getItem("coallia_session_expire");
  const cleSession = getCleMaitresse();
  const now = new Date().getTime();

  const sessionValide = !!(prenom && expire && now < parseInt(expire) && cleSession);

  // Si la session est valide ET que la clé temporaire est toujours en mémoire (rafraîchissement de page)
  if (sessionValide) {
    // 1. Déchiffrement local
    dechiffrerCoffreLocal();
    purgerDonneesAnciennes();

    // 2. Synchronisation Cloud (Sécurisée)
    if (navigator.onLine) {
      const cleAuth = getCleAuth();
      if (cleAuth) {
        try {
          const data = await fetchVault(cleAuth);

          if (data.mecsCatalog) {
            state.mecsJeunesCatalog = data.mecsCatalog;
          }

          if (data.vault && data.vault !== "null") {
            // On garde une copie de secours avant d'adopter le coffre distant
            const sauvegardeLocale = localStorage.getItem("coallia_secure_vault");
            localStorage.setItem("coallia_secure_vault", data.vault);

            // dechiffrerCoffreLocal gère la clé forte ET la migration automatique
            if (!dechiffrerCoffreLocal()) {
              if (sauvegardeLocale) {
                localStorage.setItem("coallia_secure_vault", sauvegardeLocale);
              } else {
                localStorage.removeItem("coallia_secure_vault");
              }
              console.warn("⚠️ Coffre distant illisible : mémoire locale conservée.");
            }
          }
        } catch {
          console.log("📡 Mode Hors-ligne : Utilisation de la mémoire locale.");
        }
      }
      synchroniserDonnees();
    }

    openMenu();
  } else {
    // 🛑 L'utilisateur a fermé l'onglet ou la session a expiré : Verrouillage total
    localStorage.removeItem("coallia_pro_prenom");
    localStorage.removeItem("coallia_session_expire");
    sessionStorage.removeItem("permia_session_key");
    sessionStorage.removeItem("permia_auth_key");
    purgerToutAutosave(); // 🛡️ Brouillons en clair effacés
  }

  // 🔒 SURVEILLANCE DU VERROUILLAGE — hors du if/else, donc active
  // aussi bien après une connexion manuelle qu'après un rechargement de page.
  signalerActivite();
  setInterval(verifierSession, 30000);

  // 📤 Compteur d'éléments en attente (hors du if/else : actif après connexion manuelle aussi)
  rafraichirBadgeAttente();
  setInterval(rafraichirBadgeAttente, 10000);

  // 🔄 Boucle de synchronisation — hors du if/else, sinon elle ne démarre jamais
  //    après une connexion par le formulaire.
  setInterval(() => {
    synchroniserDonnees();
  }, 60000);

  // Détection de l'activité réelle du professionnel
  (["click", "touchstart", "keydown"] as const).forEach((evt) => {
    document.addEventListener(evt, signalerActivite, { passive: true });
  });

  // Contrôle immédiat au retour dans l'app (sortie de veille, changement d'onglet)
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      verifierSession();
      if (getCleMaitresse() && navigator.onLine) synchroniserDonnees();
    }
  });

  // Gestion du badge hors-ligne / serveur indisponible
  const offlineBadge = document.getElementById("offline-badge");

  // 🩺 Deux causes bien distinctes peuvent empêcher l'app de synchroniser :
  // le téléphone n'a plus de réseau (déjà détecté nativement), ou le réseau
  // fonctionne mais c'est notre propre Worker qui ne répond plus (invisible
  // sans vérif dédiée). On réutilise la même pastille pour les deux — pas la
  // peine d'empiler deux bandeaux pour un seul message "ça ne synchronise
  // pas en ce moment" — mais on retient LAQUELLE est affichée, pour ne
  // jamais masquer une vraie panne serveur juste parce que le réseau est
  // revenu, ni l'inverse.
  let motifBadgeActuel: "hors-ligne" | "serveur-indisponible" | null = null;

  const afficherHorsLigne = () => {
    if (!offlineBadge) return;
    motifBadgeActuel = "hors-ligne";
    offlineBadge.classList.remove("succes");
    offlineBadge.classList.add("danger");
    offlineBadge.innerHTML = `<span class="status-pill-icone">${iconeNuageBarre(13)}</span><span>Mode Hors-ligne</span>`;
    offlineBadge.classList.remove("hidden");
  };

  const afficherServeurIndisponible = () => {
    if (!offlineBadge) return;
    motifBadgeActuel = "serveur-indisponible";
    offlineBadge.classList.remove("succes");
    offlineBadge.classList.add("danger");
    offlineBadge.innerHTML = `<span class="status-pill-icone">${iconeServeur(13)}</span><span>Serveur indisponible</span>`;
    offlineBadge.classList.remove("hidden");
    retour("alerte");
  };

  const masquerBadgeSiMotif = (motif: "hors-ligne" | "serveur-indisponible") => {
    if (motifBadgeActuel !== motif) return;
    offlineBadge?.classList.add("hidden");
    motifBadgeActuel = null;
  };

  // 🩺 Vérifie que le Worker répond réellement (pas seulement que le
  // téléphone a du réseau) : sondage régulier + un test immédiat au démarrage.
  const verifierSanteEtMettreAJourBadge = async () => {
    if (!navigator.onLine) return; // le badge "hors-ligne" prend déjà le relais
    const enForme = await verifierSanteWorker();
    if (enForme) {
      masquerBadgeSiMotif("serveur-indisponible");
    } else if (motifBadgeActuel !== "hors-ligne") {
      afficherServeurIndisponible();
    }
  };

  if (!navigator.onLine) afficherHorsLigne();
  verifierSanteEtMettreAJourBadge();
  setInterval(verifierSanteEtMettreAJourBadge, INTERVALLE_VERIF_SANTE_MS);

  window.addEventListener("offline", () => {
    afficherHorsLigne();
    retour("alerte");
    rafraichirBadgeAttente(); // 📡 Réagit tout de suite, pas au prochain sondage (10s)
  });

  window.addEventListener("online", () => {
    if (getCleMaitresse()) synchroniserDonnees();
    if (offlineBadge) {
      offlineBadge.classList.remove("danger");
      offlineBadge.classList.add("succes");
      offlineBadge.innerHTML = `<span class="status-pill-icone">${iconeCheckSucces(13)}</span><span>Connexion rétablie ! Synchronisation...</span>`;
      motifBadgeActuel = null;
      retour("succes");
      setTimeout(() => {
        offlineBadge.classList.add("hidden");
        // Le réseau est revenu, mais rien ne garantit que notre serveur
        // réponde déjà : on vérifie tout de suite plutôt que d'attendre le
        // prochain sondage.
        verifierSanteEtMettreAJourBadge();
      }, 3000);
    }
    rafraichirBadgeAttente(); // 📡 Masque immédiatement la file d'attente hors-ligne
  });

  // ==========================================================================
  // 👑 CHORÉGRAPHIE LUXE : Écran Splash & Transition Enchaînée Premium
  // ==========================================================================

  // 1. À 2200ms : Le logo a été bien visible. On lance le fondu du Splash ET l'émergence de la carte en même temps !
  setTimeout(() => {
    const splash = document.getElementById("splash-screen");
    if (splash) splash.classList.add("hidden-splash"); // Lancement du fondu de sortie

    // 2. Simultanément, si la session est à initialiser, on prépare la carte en arrière-plan
    if (!sessionValide) {
      const loginScreen = document.getElementById("login-screen");
      if (loginScreen) {
        loginScreen.classList.remove("hidden");

        // Micro-délai de 30ms pour forcer le navigateur à calculer le layout avant l'animation
        setTimeout(() => {
          const card = loginScreen.querySelector(".auth-card");
          if (card) card.classList.add("auth-card-entrance"); // Envolée cinétique
        }, 30);
      }
    }
  }, 1700);
};
