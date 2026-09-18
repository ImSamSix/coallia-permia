import { state } from "@/state/store";
import { assurerCryptoJS, definirClesSession, deriverCleAuth, derriverCleVault, effacerClesSession } from "@/services/crypto";
import { fetchVault, login } from "@/services/permia-relay";
import { dechiffrerCoffreLocal } from "@/services/storage";
import { retour } from "@/services/feedback";
import { openMenu } from "@/features/navigation/navigation";
import { iconeAlerte } from "@/ui/icons";
import { securiserTexte } from "@/ui/dom-utils";
import type { LoginResponse } from "@/types/relay";

const SESSION_DUREE_MS = 8 * 60 * 60 * 1000;

/**
 * 🎬 SIGNAL D'ÉCHEC D'AUTHENTIFICATION
 * Bulle rouge animée (rebond + oscillation) + halo rouge pulsant sur les champs.
 * Tout se réinitialise dès que l'utilisateur retape quelque chose.
 * 🎯 Par défaut, seul le champ code est signalé : c'est le seul qui puisse être "faux".
 */
export function echecAuth(message: string, idsChamps: string[] = ["pass-pro"]): void {
  const errorBubble = document.getElementById("error-bubble");
  const champs = idsChamps.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);

  // 🔴 La bulle : on relance l'animation même sur deux échecs d'affilée
  if (errorBubble) {
    errorBubble.innerHTML = `${iconeAlerte(16)}<span>${securiserTexte(message)}</span>`;
    errorBubble.classList.remove("hidden", "show", "bulle-alerte");
    void errorBubble.offsetWidth; // 🔄 force le navigateur à rejouer l'animation
    errorBubble.classList.add("show", "bulle-alerte");
  }

  // 🧹 Nettoyage à la première correction de l'utilisateur
  const nettoyer = () => {
    champs.forEach((c) => {
      c.classList.remove("champ-erreur");
      c.removeEventListener("input", nettoyer);
    });
    if (errorBubble) {
      errorBubble.classList.remove("show", "bulle-alerte");
      setTimeout(() => errorBubble.classList.add("hidden"), 300);
    }
  };

  // 🌊 Le halo rouge sur les deux champs
  champs.forEach((champ) => {
    champ.classList.remove("champ-erreur");
    void champ.offsetWidth;
    champ.classList.add("champ-erreur");
    champ.addEventListener("input", nettoyer);
  });

  retour("erreur");
}

export async function validerConnexionSecurisee(): Promise<void> {
  const inputPrenomEl = document.getElementById("prenom-pro") as HTMLInputElement;
  const inputPassEl = document.getElementById("pass-pro") as HTMLInputElement;
  const btn = document.getElementById("btn-login") as HTMLButtonElement;

  const inputPrenom = inputPrenomEl.value.trim();
  const inputPass = inputPassEl.value;

  if (!inputPass || !inputPrenom) {
    // Ici on marque précisément le ou les champs manquants
    const manquants: string[] = [];
    if (!inputPrenom) manquants.push("prenom-pro");
    if (!inputPass) manquants.push("pass-pro");
    echecAuth("Veuillez remplir tous les champs", manquants);
    return;
  }

  const originalText = btn.innerText;
  btn.innerText = "Vérification sécurisée...";
  btn.disabled = true;
  btn.style.opacity = "0.8";

  // 🧩 GARDE : sans module de chiffrement, on sort proprement (bouton rendu)
  const cryptoPret = await assurerCryptoJS();
  if (!cryptoPret) {
    echecAuth("Module de sécurité non chargé. Vérifiez la connexion, puis réessayez.");
    btn.innerText = originalText;
    btn.disabled = false;
    btn.style.opacity = "1";
    return;
  }

  // 🎨 Respiration : laisse le navigateur peindre "Vérification sécurisée..."
  // avant le calcul PBKDF2 (120 000 itérations = 1 à 2 s de gel sur mobile)
  await new Promise((r) => setTimeout(r, 50));

  // 🔑 Badge serveur : formule historique (le Worker reste inchangé)
  const cleAuth = deriverCleAuth(inputPass);
  // 🛡️ Clé du coffre : dérivation lente PBKDF2
  const cleVault = derriverCleVault(inputPass);

  try {
    const response = await login(cleAuth);

    if (response.ok) {
      // ✅ SUCCÈS : Le serveur a validé le calcul
      const data = (await response.json()) as LoginResponse;

      definirClesSession(cleVault, cleAuth);
      localStorage.setItem("coallia_pro_prenom", inputPrenom);
      const expirationTime = new Date().getTime() + SESSION_DUREE_MS;
      localStorage.setItem("coallia_session_expire", String(expirationTime));

      // 👑 Injection immédiate du trajet réel dans l'application
      if (data.mecsCatalog) {
        state.mecsJeunesCatalog = data.mecsCatalog;
      }

      // ☁️ RÉCUPÉRATION DU COFFRE DISTANT DÈS LA CONNEXION
      // Sans ça, un appareil fraîchement installé s'ouvre vide et peut
      // écraser le coffre de l'équipe à la première saisie.
      try {
        const dataVault = await fetchVault(cleAuth);

        if (dataVault.vault && dataVault.vault !== "null") {
          const sauvegardeLocale = localStorage.getItem("coallia_secure_vault");
          localStorage.setItem("coallia_secure_vault", dataVault.vault);

          // dechiffrerCoffreLocal gère la clé forte ET la migration legacy
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
        console.log("📡 Coffre distant non récupéré, la mémoire locale est conservée.");
      }

      // 🛡️ GARDE ANTI-ÉCRASEMENT : si un coffre existe mais refuse de s'ouvrir,
      // c'est que la clé est mauvaise. On refuse l'accès plutôt que d'écraser les données.
      const coffreExiste = !!localStorage.getItem("coallia_secure_vault");
      if (coffreExiste && !dechiffrerCoffreLocal()) {
        effacerClesSession();
        echecAuth("Code incorrect (données protégées).");
        return;
      }

      retour("succes");
      inputPassEl.value = "";
      openMenu();
    } else if (response.status === 401 || response.status === 403 || response.status === 429) {
      // 🛑 REFUS FERME DU SERVEUR : code faux, accès révoqué, ou trop de tentatives.
      // On NE tente PAS le déverrouillage local : c'est une décision du serveur, pas une panne.
      effacerClesSession();
      echecAuth(response.status === 429 ? "Trop de tentatives. Réessayez dans 15 minutes." : "Code incorrect ou accès révoqué.");
    } else {
      // ⚠️ Erreur serveur (500, 502, maintenance...) : ce n'est PAS un refus d'accès.
      // On bascule sur le mode dégradé local, comme pour une panne réseau.
      throw new Error("Serveur indisponible");
    }
  } catch {
    // 📡 LE SERVEUR EST INJOIGNABLE (HORS-LIGNE) OU MAUVAIS CODE
    definirClesSession(cleVault, cleAuth);

    if (dechiffrerCoffreLocal()) {
      localStorage.setItem("coallia_pro_prenom", inputPrenom);
      const expirationTime = new Date().getTime() + SESSION_DUREE_MS;
      localStorage.setItem("coallia_session_expire", String(expirationTime));

      retour("succes");
      inputPassEl.value = "";
      openMenu();
    } else {
      effacerClesSession();
      echecAuth("Code incorrect ou connexion requise pour initialiser l'appareil.");
    }
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
    btn.style.opacity = "1";
  }
}

export function togglePasswordVisibility(): void {
  const passInput = document.getElementById("pass-pro") as HTMLInputElement;
  const toggleIcon = document.getElementById("toggle-password") as HTMLElement;
  const iconOuvert = toggleIcon.querySelector(".icone-oeil-ouvert");
  const iconBarre = toggleIcon.querySelector(".icone-oeil-barre");
  if (passInput.type === "password") {
    passInput.type = "text";
    iconOuvert?.classList.add("hidden");
    iconBarre?.classList.remove("hidden");
  } else {
    passInput.type = "password";
    iconOuvert?.classList.remove("hidden");
    iconBarre?.classList.add("hidden");
  }
}

/** Câble l'écran de connexion : Entrée pour avancer, œil pour afficher le code, bouton + retour tactile. */
export function initLoginListeners(): void {
  const prenomInput = document.getElementById("prenom-pro") as HTMLInputElement;
  const passInput = document.getElementById("pass-pro") as HTMLInputElement;
  const toggleIcon = document.getElementById("toggle-password");
  const btnLogin = document.getElementById("btn-login");

  prenomInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passInput.focus();
    }
  });

  passInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validerConnexionSecurisee();
    }
  });

  toggleIcon?.addEventListener("click", togglePasswordVisibility);

  btnLogin?.addEventListener("click", validerConnexionSecurisee);

  // Retour tactile spécifique : la souris anime aussi l'ombre, le tactile non
  // (comportement d'origine, conservé à l'identique).
  if (btnLogin) {
    const el = btnLogin as HTMLElement;
    el.addEventListener("mousedown", () => {
      el.style.transform = "scale(0.97)";
      el.style.boxShadow = "0 4px 12px rgba(0, 85, 164, 0.2)";
    });
    el.addEventListener("mouseup", () => {
      el.style.transform = "scale(1)";
      el.style.boxShadow = "0 8px 22px rgba(0, 85, 164, 0.28)";
    });
    el.addEventListener("touchstart", () => (el.style.transform = "scale(0.97)"), { passive: true });
    el.addEventListener("touchend", () => (el.style.transform = "scale(1)"));
  }
}
