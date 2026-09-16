import { state } from "@/state/store";
import { sauvegarderToutesLesDonnees } from "@/services/storage";
import { synchroniserDonnees } from "@/services/sync";
import { securiserTexte } from "@/ui/dom-utils";
import { jouerSon } from "@/ui/sound";
import { fermerModals } from "@/ui/modals";
import { updateDashboardBadges } from "@/features/navigation/navigation";
import { telechargerPDF } from "@/features/pdf/pdf";
import { attacherEffetAppui } from "@/ui/press-effect";
import type { ComptageType, MecsSession } from "@/types/mecs";

// Variables d'état volatiles pour la session de comptage en cours
let mecsSessionEnCours: MecsSession | null = null;
let mecsIndexActuel = 0;
let touchStartX = 0;
let touchEndX = 0;

// --- INTERFACE COMMANDE COMPTAGE ---
export function openComptageMenu(): void {
  document.getElementById("home-menu")?.classList.add("hidden");
  document.getElementById("comptage-app")?.classList.remove("hidden");

  // 🛡️ SÉCURITÉ : On force l'affichage du menu de configuration et on cache les stats
  document.getElementById("comptage-setup-screen")?.classList.remove("hidden");
  document.getElementById("comptage-workspace")?.classList.add("hidden");
  document.getElementById("comptage-report-screen")?.classList.add("hidden");
  document.getElementById("comptage-last-view")?.classList.add("hidden");

  // On remet le bouton du haut en mode "Accueil" par défaut
  const backBtn = document.getElementById("comptage-back-btn") as HTMLButtonElement | null;
  if (backBtn) {
    backBtn.innerText = "← Accueil";
    backBtn.onclick = retourSaisieComptage;
  }
}

export function retourSaisieComptage(): void {
  document.getElementById("comptage-app")?.classList.add("hidden");
  document.getElementById("home-menu")?.classList.remove("hidden");
  updateDashboardBadges();
}

// Lancement d'une session de pointage
export function lancerComptageMecs(): void {
  const typeSelect = document.getElementById("comptage-type-select") as HTMLSelectElement;
  const errorBubble = document.getElementById("comptage-error-bubble");
  const typeComptage = typeSelect.value as ComptageType | "";

  // 👑 RÉINITIALISATION SYSTÉMATIQUE DES STYLES D'ERREUR
  typeSelect.classList.remove("input-error");
  errorBubble?.classList.add("hidden");

  // 👑 RECOUVREMENT DE SÉCURITÉ : Interdiction de lancer la tournée à vide
  if (!typeComptage) {
    typeSelect.classList.add("input-error"); // Applique le halo rouge natif de style.css

    errorBubble?.classList.remove("hidden");
    if (navigator.vibrate) navigator.vibrate(35);
    jouerSon("error"); // Bip sonore d'erreur

    // Restauration automatique de l'interface après 3 secondes
    setTimeout(() => {
      errorBubble?.classList.add("hidden");
      typeSelect.classList.remove("input-error");
    }, 3000);
    return; // Bloque l'exécution de la suite du script
  }

  const pro = localStorage.getItem("coallia_pro_prenom") || "Inconnu";
  const maintenant = new Date();

  // Initialisation du modèle de données de session
  mecsSessionEnCours = {
    date: maintenant.toLocaleDateString("fr-FR"),
    heureDebut: maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    timestampDebut: maintenant.getTime(),
    professionnel: pro,
    type: typeComptage,
    totalJeunes: state.mecsJeunesCatalog.length,
    presents: 0,
    absents: 0,
    breakdown: {
      mineurs: { presents: 0, absents: 0 },
      majeurs: { presents: 0, absents: 0 }
    },
    listeAbsents: []
  };

  mecsIndexActuel = 0;

  document.getElementById("comptage-setup-screen")?.classList.add("hidden");
  document.getElementById("comptage-workspace")?.classList.remove("hidden");

  const backBtn = document.getElementById("comptage-back-btn") as HTMLButtonElement | null;
  if (backBtn) {
    backBtn.innerText = "← Retour";
    backBtn.onclick = verifierAnnulationComptage;
  }

  majDashboardComptage();
  genererCarteJeuneMecs();
}

// Mise à jour de l'affichage de progression et des métriques
function majDashboardComptage(): void {
  if (!mecsSessionEnCours) return;
  const total = mecsSessionEnCours.totalJeunes;
  const verifies = mecsIndexActuel;
  const restants = total - verifies;

  setText("dash-verifies", String(verifies));
  setText("dash-restants", String(restants));
  setText("dash-presents", String(mecsSessionEnCours.presents));
  setText("dash-absents", String(mecsSessionEnCours.absents));

  setText("dash-min-p", String(mecsSessionEnCours.breakdown.mineurs.presents));
  setText("dash-min-a", String(mecsSessionEnCours.breakdown.mineurs.absents));
  setText("dash-maj-p", String(mecsSessionEnCours.breakdown.majeurs.presents));
  setText("dash-maj-a", String(mecsSessionEnCours.breakdown.majeurs.absents));

  setText("comptage-progression-text", `Avancement : ${verifies} / ${total}`);
}

function setText(id: string, texte: string): void {
  const el = document.getElementById(id);
  if (el) el.innerText = texte;
}

// Générateur dynamique HTML de la carte Tinder avec support Drag & Swipe fluide
function genererCarteJeuneMecs(): void {
  const holder = document.getElementById("comptage-card-holder");
  if (!holder) return;
  holder.innerHTML = "";

  if (mecsIndexActuel >= state.mecsJeunesCatalog.length) {
    afficherRapportFinalMecs();
    return;
  }

  const jeune = state.mecsJeunesCatalog[mecsIndexActuel];
  const tagStatut = jeune.isMajor ? "🧑 MAJEUR" : "👶 MINEUR";
  const colorStatut = jeune.isMajor ? "var(--coallia-blue)" : "var(--warning)";

  // 👑 EXTRACTION ET SÉPARATION CHIRURGICALE DU TRAJET (Bâtiment │ Appartement │ Chambre)
  const chambreParts = jeune.chambre.split("│");
  const batimentLabel = chambreParts[0] ? chambreParts[0].trim() : "";
  const detailsLabel = chambreParts[1] ? chambreParts[1].trim() : "";

  let aptLabel = "";
  let chLabel = detailsLabel;

  // Si la ligne contient un appartement (Bâtiments C et D), on sépare l'Apt de la Chambre
  if (detailsLabel.includes("-")) {
    const subParts = detailsLabel.split("-");
    aptLabel = subParts[0] ? subParts[0].trim() : "";
    chLabel = subParts[1] ? subParts[1].trim() : "";
  }

  const card = document.createElement("div");
  card.id = "tinder-card-actuelle";

  card.style.cssText =
    "width:100%; background:var(--card-color); border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.06); border:1px solid var(--border-color); padding:25px; text-align:center; display:flex; flex-direction:column; justify-content:center; align-items:center; height:340px; position:absolute; z-index:2; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.2), opacity 0.2s; touch-action:none;";

  // 👑 CONSTRUCTION DYNAMIQUE DES BULLES (Harmonisation Apple-Style : toutes en gris et écriture sombre)
  let bullesHTML = `
        <div style="background: var(--input-bg); color: var(--text-dark); font-weight: 700; font-size: 12px; padding: 8px 12px; border-radius: 12px; border: 1px solid var(--border-color); white-space: nowrap; display: flex; align-items: center; justify-content: center;">
            ${batimentLabel}
        </div>
    `;

  if (aptLabel) {
    bullesHTML += `
            <div style="background: var(--input-bg); color: var(--text-dark); font-weight: 700; font-size: 12px; padding: 8px 12px; border-radius: 12px; border: 1px solid var(--border-color); white-space: nowrap; display: flex; align-items: center; justify-content: center;">
                🏢 ${aptLabel}
            </div>
        `;
  }

  bullesHTML += `
        <div style="background: var(--input-bg); color: var(--text-dark); font-weight: 700; font-size: 12px; padding: 8px 12px; border-radius: 12px; border: 1px solid var(--border-color); white-space: nowrap; display: flex; align-items: center; justify-content: center;">
            🚪 ${chLabel}
        </div>
    `;

  card.innerHTML = `
        <div style="width:100px; height:100px; border-radius:50%; background:rgba(0,85,164,0.06); border:3px solid var(--coallia-blue); display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:800; color:var(--coallia-blue); margin-bottom:20px; box-shadow:0 4px 10px rgba(0,0,0,0.03);">${jeune.initiales}</div>
        <h2 style="font-size:22px; font-weight:800; margin:0 0 5px 0; color:var(--text-dark);">${jeune.prenom} ${jeune.nom}</h2>
        <p style="margin:0 0 15px 0; font-size:15px; color:var(--text-gray); font-weight:600;">${jeune.age} ans</p>
        <span style="font-size:11px; font-weight:800; padding:6px 14px; border-radius:20px; color:white; background:${colorStatut}; margin-bottom:20px;">${tagStatut}</span>

        <!-- 👑 TRIPLE BADGE PARFAITEMENT SÉPARÉ : Même hauteur, même arrondi, même typographie -->
        <div style="display: flex; gap: 6px; justify-content: center; width: 100%; box-sizing: border-box; flex-wrap: nowrap;">
            ${bullesHTML}
        </div>
    `;

  // Gestion du Drag (mouvement de la carte sous le doigt)
  card.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      // On coupe la transition pendant que le doigt bouge pour coller au mouvement
      card.style.transition = "none";
    },
    { passive: true }
  );

  card.addEventListener(
    "touchmove",
    (e) => {
      const currentX = e.changedTouches[0].screenX;
      const deltaX = currentX - touchStartX;
      const rotation = deltaX * 0.08; // Calcule une rotation légère proportionnelle au mouvement

      // Applique le déplacement et la rotation en temps réel
      card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    },
    { passive: true }
  );

  card.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;

      // Rétablit la transition pour l'éjection ou le retour au centre
      card.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2), opacity 0.2s";

      if (diff > 80) {
        // Swipe à Droite -> Présent
        card.classList.add("swipe-right-animation");
        setTimeout(() => enregistrerPresenceMecs(true), 250);
      } else if (diff < -80) {
        // Swipe à Gauche -> Absent
        card.classList.add("swipe-left-animation");
        setTimeout(() => enregistrerPresenceMecs(false), 250);
      } else {
        // Pas assez déplacé -> Retour élastique au centre parfait
        card.style.transform = "translateX(0px) rotate(0deg)";
      }
    },
    { passive: true }
  );

  holder.appendChild(card);
}

// Intercepteur pour appliquer l'animation d'éjection lors du clic sur les boutons du bas
export function animerEtValiderBouton(isPresent: boolean): void {
  const card = document.getElementById("tinder-card-actuelle");
  if (card) {
    // Force la transition d'éjection animée
    card.style.transition = "transform 0.35s cubic-bezier(0.215, 0.610, 0.355, 1), opacity 0.2s";
    card.classList.add(isPresent ? "swipe-right-animation" : "swipe-left-animation");
  }
  // Laisse le temps à l'animation de se faire avant d'enregistrer la donnée
  setTimeout(() => {
    enregistrerPresenceMecs(isPresent);
  }, 200);
}

// Traitement des données après action Présent / Absent
function enregistrerPresenceMecs(isPresent: boolean): void {
  const jeune = state.mecsJeunesCatalog[mecsIndexActuel];

  // 🛡️ GARDE : catalogue vide, session non démarrée ou double-tap en fin de liste
  if (!jeune || !mecsSessionEnCours) {
    console.warn("⚠️ Comptage : aucun jeune à traiter (index " + mecsIndexActuel + ").");
    genererCarteJeuneMecs();
    return;
  }

  if (isPresent) {
    mecsSessionEnCours.presents++;
    if (jeune.isMajor) mecsSessionEnCours.breakdown.majeurs.presents++;
    else mecsSessionEnCours.breakdown.mineurs.presents++;

    if (navigator.vibrate) navigator.vibrate(30);

    mecsIndexActuel++;
    majDashboardComptage();
    genererCarteJeuneMecs();
  } else {
    // 👑 DECOUPAGE ET EXTRACTION DES DONNÉES DU TRAJET
    const subtitleEl = document.getElementById("absence-modal-subtitle");
    const chambreParts = jeune.chambre.split("│");
    const batimentLabel = chambreParts[0] ? chambreParts[0].trim() : "";
    const detailsLabel = chambreParts[1] ? chambreParts[1].trim() : "";

    let aptLabel = "";
    let chLabel = detailsLabel;

    if (detailsLabel.includes("-")) {
      const subParts = detailsLabel.split("-");
      aptLabel = subParts[0] ? subParts[0].trim() : "";
      chLabel = subParts[1] ? subParts[1].trim() : "";
    }

    // 👑 CORRECTION ESTHÉTIQUE : Construction des mini-badges gris identiques à la carte principale
    let miniBullesHTML = `
            <div style="background: var(--input-bg); color: var(--text-dark); font-weight: 700; font-size: 11px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-color); white-space: nowrap;">
                ${batimentLabel}
            </div>
        `;

    if (aptLabel) {
      miniBullesHTML += `
                <div style="background: var(--input-bg); color: var(--text-dark); font-weight: 700; font-size: 11px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-color); white-space: nowrap;">
                    🏢 ${aptLabel}
                </div>
            `;
    }

    miniBullesHTML += `
            <div style="background: var(--input-bg); color: var(--text-dark); font-weight: 700; font-size: 11px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-color); white-space: nowrap;">
                🚪 ${chLabel}
            </div>
        `;

    // Injection du rendu épuré (Nom en valeur + alignement horizontal des capsules)
    if (subtitleEl) {
      subtitleEl.innerHTML = `
                <div style="font-size: 16px; font-weight: 800; color: var(--text-dark); margin-bottom: 12px; letter-spacing: -0.3px;">
                    ${jeune.prenom} ${jeune.nom}
                </div>
                <div style="display: flex; gap: 5px; justify-content: center; width: 100%; flex-wrap: nowrap; margin-bottom: 5px;">
                    ${miniBullesHTML}
                </div>
            `;
    }

    // Affichage des conteneurs de la modale
    document.getElementById("absence-grid-container")?.classList.remove("hidden");
    document.getElementById("absence-autre-container")?.classList.add("hidden");
    document.getElementById("comptage-absence-modal")?.classList.remove("hidden");
  }
}

// Validation du motif d'absence (Zéro confirmation intermédiaire)
export function validerMotifAbsenceMecs(motif: string): void {
  const jeune = state.mecsJeunesCatalog[mecsIndexActuel];
  if (!mecsSessionEnCours || !jeune) return;

  mecsSessionEnCours.absents++;
  if (jeune.isMajor) mecsSessionEnCours.breakdown.majeurs.absents++;
  else mecsSessionEnCours.breakdown.mineurs.absents++;

  mecsSessionEnCours.listeAbsents.push({
    prenom: jeune.prenom,
    nom: jeune.nom,
    chambre: jeune.chambre,
    motif: motif,
    isMajor: jeune.isMajor // 👑 Sauvegarde le statut pour l'affichage différencié
  });

  if (navigator.vibrate) navigator.vibrate([60, 40]);

  document.getElementById("comptage-absence-modal")?.classList.add("hidden");

  mecsIndexActuel++;
  majDashboardComptage();
  genererCarteJeuneMecs();
}

// Écran final : Rendu global du bilan de pointage
function afficherRapportFinalMecs(): void {
  if (!mecsSessionEnCours) return;
  document.getElementById("comptage-workspace")?.classList.add("hidden");
  document.getElementById("comptage-report-screen")?.classList.remove("hidden");

  const maintenant = new Date();
  const heureFin = maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const dureeMin = Math.round((maintenant.getTime() - mecsSessionEnCours.timestampDebut) / 60000);

  mecsSessionEnCours.heureFin = heureFin;
  mecsSessionEnCours.duree = dureeMin <= 0 ? "Moins d'une minute" : `${dureeMin} min`;

  // Métadonnées d'en-tête
  const reportMeta = document.getElementById("report-meta");
  if (reportMeta) {
    reportMeta.innerHTML = `
        Tournée effectuée le <b>${mecsSessionEnCours.date}</b> de <b>${mecsSessionEnCours.heureDebut}</b> à <b>${heureFin}</b><br>
        Par : <b>${securiserTexte(mecsSessionEnCours.professionnel)}</b> · Session : <b>${securiserTexte(mecsSessionEnCours.type)}</b>
    `;
  }

  // Statistiques sous forme de tableau épuré
  const statsHtml = document.getElementById("report-stats-html");
  if (statsHtml) {
    statsHtml.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-weight:700;"><span>Total Jeunes du Foyer :</span><b style="color:var(--text-dark);">${mecsSessionEnCours.totalJeunes}</b></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:13px;"><span>🟢 Total Présents :</span><b style="color:var(--success);">${mecsSessionEnCours.presents}</b></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px;"><span>🔴 Total Absents :</span><b style="color:var(--danger);">${mecsSessionEnCours.absents}</b></div>

        <!-- 👑 Bulles verticales de fin de tournée -->
        <div style="border-top:1px solid var(--border-color); padding-top:15px; display:flex; flex-direction:column; gap:10px; width:100%;">
            <div style="background:var(--card-color); border:1px solid var(--border-color); padding:12px; border-radius:14px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;">
                <div style="font-weight:800; font-size:14px; margin-bottom:4px; color:var(--text-dark);">👶 Mineurs</div>
                <div style="font-size:12.5px; color:var(--text-gray); font-weight:600;">
                    Présents : <span style="color:var(--success); font-weight:700;">${mecsSessionEnCours.breakdown.mineurs.presents}</span> │ Absents : <span style="color:var(--danger); font-weight:700;">${mecsSessionEnCours.breakdown.mineurs.absents}</span>
                </div>
            </div>
            <div style="background:var(--card-color); border:1px solid var(--border-color); padding:12px; border-radius:14px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;">
                <div style="font-weight:800; font-size:14px; margin-bottom:4px; color:var(--text-dark);">🧑 Majeurs</div>
                <div style="font-size:12.5px; color:var(--text-gray); font-weight:600;">
                    Présents : <span style="color:var(--success); font-weight:700;">${mecsSessionEnCours.breakdown.majeurs.presents}</span> │ Absents : <span style="color:var(--danger); font-weight:700;">${mecsSessionEnCours.breakdown.majeurs.absents}</span>
                </div>
            </div>
        </div>
    `;
  }

  // Injection de la liste nominative des absents
  const listHolder = document.getElementById("report-absents-list");
  if (listHolder) {
    listHolder.innerHTML = "";

    if (mecsSessionEnCours.listeAbsents.length === 0) {
      listHolder.innerHTML = `<div style="text-align:center; color:var(--success); font-weight:600; font-size:13px; padding:10px;">✨ Aucun absent. L'établissement est complet.</div>`;
    } else {
      // 👑 Moteur de rendu identique avec distinction visuelle des mineurs
      mecsSessionEnCours.listeAbsents.forEach((ab) => {
        const row = document.createElement("div");

        const estMineur = ab.isMajor === false;
        const cardBg = estMineur ? "rgba(255, 59, 48, 0.05)" : "var(--input-bg)";
        const cardBorder = estMineur ? "1px solid rgba(255, 59, 48, 0.15)" : "1px solid transparent";
        const borderLeft = estMineur ? "border-left: 5px solid var(--danger);" : "";
        const alertTag = estMineur
          ? "<span style='font-size:10px; font-weight:800; color:var(--danger); background:rgba(255,59,48,0.1); padding:2px 7px; border-radius:6px; margin-left:8px; vertical-align:middle; letter-spacing:0.5px;'>🚨 MINEUR</span>"
          : "";

        row.style.cssText = `background:${cardBg}; border:${cardBorder}; ${borderLeft} padding:12px; border-radius:12px; font-size:13px; display:flex; justify-content:space-between; align-items:center; font-weight:600;`;
        row.innerHTML = `
            <div style="text-align:left;">
                <span style="color:var(--text-dark);">${ab.prenom} ${ab.nom} ${alertTag}</span><br>
                <span style="font-size:11px; color:var(--text-gray); font-weight:700;">🚪 ${ab.chambre}</span>
            </div>
            <div style="font-size:11px; background:var(--card-color); padding:5px 10px; border-radius:8px; border:1px solid var(--border-color); color:var(--danger); font-weight:700;">${ab.motif}</div>
        `;
        listHolder.appendChild(row);
      });
    }
  }
}

// 👑 LOGIQUE DE CLÔTURE : Sauvegarde le rapport de tournée dans le coffre crypté et synchronise le Cloud
export async function cloreComptageMecs(): Promise<void> {
  if (!mecsSessionEnCours) return;

  // Ajoute la session actuelle à l'historique global
  state.mecsComptageLogs.push(mecsSessionEnCours);

  // 📄 Génération du relevé PDF, joint au log pour envoi automatique
  try {
    const dataUri = await telechargerPDF("comptage", { silencieux: true });
    const base64 = (dataUri || "").split(",")[1];

    // Garde-fou : au-delà de ~2 Mo, on n'encombre pas le coffre local
    if (base64 && base64.length < 2000000) {
      const d = new Date();
      const p2 = (n: number) => String(n).padStart(2, "0");
      mecsSessionEnCours.pdfBase64 = base64;
      mecsSessionEnCours.nomFichier = "Releve_Presence_" + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + "_" + p2(d.getHours()) + p2(d.getMinutes()) + ".pdf";
    } else {
      console.warn("📄 PDF trop volumineux, envoi des données seules.");
    }
  } catch (e) {
    console.warn("📄 Génération du PDF impossible, envoi des données seules :", e);
  }

  // Sauvegardes et synchronisation cloud invisible
  sauvegarderToutesLesDonnees();
  synchroniserDonnees();

  // Retours haptiques et sonores premium de validation
  jouerSon("success");
  if (navigator.vibrate) navigator.vibrate([50, 50]);

  // Redirection fluide vers l'écran d'accueil du comptage
  retourSaisieComptage();
}

// --- EXTRACTION ET VISUALISATION DU DERNIER APPEL (PRISE DE SERVICE) ---
export function voirDernierComptage(): void {
  if (!state.mecsComptageLogs || state.mecsComptageLogs.length === 0) {
    if (navigator.vibrate) navigator.vibrate(100); // Micro-vibration de signalement
    jouerSon("error"); // Bip d'avertissement sonore

    document.getElementById("comptage-empty-modal")?.classList.remove("hidden");
    return;
  }

  const dernierLog = state.mecsComptageLogs[state.mecsComptageLogs.length - 1];

  document.getElementById("comptage-setup-screen")?.classList.add("hidden");
  document.getElementById("comptage-last-view")?.classList.remove("hidden");

  const backBtn = document.getElementById("comptage-back-btn") as HTMLButtonElement | null;
  if (backBtn) {
    backBtn.innerText = "← Retour";
    backBtn.onclick = retourSetupDepuisLast;
  }

  const meta = document.getElementById("last-view-meta");
  if (meta) {
    meta.innerHTML = `
        Tournée du <b>${dernierLog.date}</b> de <b>${dernierLog.heureDebut}</b> à <b>${dernierLog.heureFin || "--:--"}</b><br>
        Par : <b>${securiserTexte(dernierLog.professionnel)}</b> · Session : <b>${securiserTexte(dernierLog.type)}</b>
    `;
  }

  const stats = document.getElementById("last-view-stats-html");
  if (stats) {
    stats.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-weight:700;"><span>Total Jeunes du Foyer :</span><b style="color:var(--text-dark);">${dernierLog.totalJeunes}</b></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:13px;"><span>🟢 Présents :</span><b style="color:var(--success);">${dernierLog.presents}</b></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px;"><span>🔴 Absents :</span><b style="color:var(--danger);">${dernierLog.absents}</b></div>

        <div style="border-top:1px solid var(--border-color); padding-top:15px; display:flex; flex-direction:column; gap:10px; width:100%;">
            <div style="background:var(--card-color); border:1px solid var(--border-color); padding:12px; border-radius:14px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;">
                <div style="font-weight:800; font-size:14px; margin-bottom:4px; color:var(--text-dark);">👶 Mineurs</div>
                <div style="font-size:12.5px; color:var(--text-gray); font-weight:600;">
                    Présents : <span style="color:var(--success); font-weight:700;">${dernierLog.breakdown?.mineurs?.presents || 0}</span> │ Absents : <span style="color:var(--danger); font-weight:700;">${dernierLog.breakdown?.mineurs?.absents || 0}</span>
                </div>
            </div>
            <div style="background:var(--card-color); border:1px solid var(--border-color); padding:12px; border-radius:14px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;">
                <div style="font-weight:800; font-size:14px; margin-bottom:4px; color:var(--text-dark);">🧑 Majeurs</div>
                <div style="font-size:12.5px; color:var(--text-gray); font-weight:600;">
                    Présents : <span style="color:var(--success); font-weight:700;">${dernierLog.breakdown?.majeurs?.presents || 0}</span> │ Absents : <span style="color:var(--danger); font-weight:700;">${dernierLog.breakdown?.majeurs?.absents || 0}</span>
                </div>
            </div>
        </div>
    `;
  }

  const listHolder = document.getElementById("last-view-absents-list");
  if (listHolder) {
    listHolder.innerHTML = "";

    if (!dernierLog.listeAbsents || dernierLog.listeAbsents.length === 0) {
      listHolder.innerHTML = `<div style="text-align:center; color:var(--success); font-weight:600; font-size:13px; padding:10px;">✨ Aucun absent lors de ce contrôle. L'établissement était complet.</div>`;
    } else {
      dernierLog.listeAbsents.forEach((ab) => {
        const row = document.createElement("div");
        const estMineur = ab.isMajor === false;
        const cardBg = estMineur ? "rgba(255, 59, 48, 0.05)" : "var(--input-bg)";
        const cardBorder = estMineur ? "1px solid rgba(255, 59, 48, 0.15)" : "1px solid transparent";
        const borderLeft = estMineur ? "border-left: 5px solid var(--danger);" : "";
        const alertTag = estMineur
          ? "<span style='font-size:10px; font-weight:800; color:var(--danger); background:rgba(255,59,48,0.1); padding:2px 7px; border-radius:6px; margin-left:8px; vertical-align:middle; letter-spacing:0.5px;'>🚨 MINEUR</span>"
          : "";

        row.style.cssText = `background:${cardBg}; border:${cardBorder}; ${borderLeft} padding:12px; border-radius:12px; font-size:13px; display:flex; justify-content:space-between; align-items:center; font-weight:600;`;
        row.innerHTML = `
                <div style="text-align:left;">
                    <span style="color:var(--text-dark);">${ab.prenom} ${ab.nom} ${alertTag}</span><br>
                    <span style="font-size:11px; color:var(--text-gray); font-weight:700;">🚪 ${ab.chambre}</span>
                </div>
                <div style="font-size:11px; background:var(--card-color); padding:5px 10px; border-radius:8px; border:1px solid var(--border-color); color:var(--danger); font-weight:700;">${ab.motif}</div>
            `;
        listHolder.appendChild(row);
      });
    }
  }
}

function retourSetupDepuisLast(): void {
  document.getElementById("comptage-last-view")?.classList.add("hidden");
  document.getElementById("comptage-setup-screen")?.classList.remove("hidden");

  const backBtn = document.getElementById("comptage-back-btn") as HTMLButtonElement | null;
  if (backBtn) {
    // 👑 On remet le libellé officiel de sortie de module
    backBtn.innerText = "← Accueil";
    backBtn.onclick = retourSaisieComptage;
  }
}

export function verifierAnnulationComptage(): void {
  const workspaceHidden = document.getElementById("comptage-workspace")?.classList.contains("hidden");
  if (workspaceHidden) {
    retourSaisieComptage();
  } else {
    if (navigator.vibrate) navigator.vibrate(150);
    jouerSon("error");
    document.getElementById("comptage-cancel-modal")?.classList.remove("hidden");
  }
}

export function confirmerAbandonTournee(): void {
  fermerModals();
  mecsSessionEnCours = null;
  mecsIndexActuel = 0;
  document.getElementById("comptage-workspace")?.classList.add("hidden");
  document.getElementById("comptage-setup-screen")?.classList.remove("hidden");

  // 👑 Le bouton redevient une sortie vers l'accueil général
  const backBtn = document.getElementById("comptage-back-btn") as HTMLButtonElement | null;
  if (backBtn) {
    backBtn.innerText = "← Accueil";
    backBtn.onclick = retourSaisieComptage; // Quitte le module comptage
  }
}

// --- LOGIQUE ÉCRAN COMPTAGE : ALTERNATIVE AUTRE MOTIF ---
export function ouvrirAbsenceAutreSaisie(): void {
  document.getElementById("absence-grid-container")?.classList.add("hidden");
  document.getElementById("absence-autre-container")?.classList.remove("hidden");

  document.getElementById("absence-modal-back-btn")?.classList.add("hidden");

  const textarea = document.getElementById("absence-autre-obs") as HTMLTextAreaElement | null;
  const errorBubble = document.getElementById("absence-error-bubble");

  // 👑 Nettoyage des alertes précédentes à l'ouverture
  errorBubble?.classList.add("hidden");
  if (textarea) {
    textarea.value = "";
    textarea.style.height = "54px";
    textarea.classList.remove("input-error"); // Enlève l'ancien halo rouge
    setTimeout(() => textarea.focus(), 50);
  }
}

export function fermerAbsenceAutreSaisie(): void {
  document.getElementById("absence-autre-container")?.classList.add("hidden");
  document.getElementById("absence-grid-container")?.classList.remove("hidden");

  // 👑 Réaffiche le bouton de retour supérieur
  document.getElementById("absence-modal-back-btn")?.classList.remove("hidden");
}

export function validerAbsenceAutreMecs(): void {
  const input = document.getElementById("absence-autre-obs") as HTMLTextAreaElement | null;
  const errorBubble = document.getElementById("absence-error-bubble");
  const raisonPersonnalisee = input ? input.value.trim() : "";

  // Réinitialisation préventive
  input?.classList.remove("input-error");
  errorBubble?.classList.add("hidden");

  // 👑 INTERCEPTION DE SÉCURITÉ : Bulle d'erreur, vibreur à 200ms et bip sonore
  if (!raisonPersonnalisee) {
    input?.classList.add("input-error"); // Ajoute le halo rouge natif de style.css
    errorBubble?.classList.remove("hidden");

    if (navigator.vibrate) navigator.vibrate(200); // Vibreur haptique standard de 200ms
    jouerSon("error"); // Bruit d'avertissement sonore

    // Nettoyage automatique au bout de 3 secondes pour préserver la lisibilité
    setTimeout(() => {
      errorBubble?.classList.add("hidden");
      input?.classList.remove("input-error");
    }, 3000);
    return;
  }

  // Transmet la saisie texte directement au moteur de log global
  validerMotifAbsenceMecs(raisonPersonnalisee);
}

// 👑 LOGIQUE DE SECOURS : Ferme la modale et ré-ancre la carte Tinder au centre parfait
export function annulerAbsenceMecs(): void {
  fermerModals();
  genererCarteJeuneMecs(); // Réinitialise et replace la carte du jeune en cours
}

function effacerAbsenceAutreObs(): void {
  const textarea = document.getElementById("absence-autre-obs") as HTMLTextAreaElement | null;
  textarea?.focus();
  if (textarea) textarea.value = "";
}

const MOTIFS_ABSENCE: Record<string, string> = {
  "btn-absence-autorisee": "Absence autorisée",
  "btn-absence-formation": "Formation",
  "btn-absence-stage": "Stage",
  "btn-absence-travail": "Travail",
  "btn-absence-sport": "Sport",
  "btn-absence-hopital": "Hospitalisation",
  "btn-absence-absent": "Absent",
  "btn-absence-fugue": "Fugue"
};

/** Câble l'écran de relevé de présence : lancement, workspace, absences, rapport. */
export function initComptageListeners(): void {
  const backBtn = document.getElementById("comptage-back-btn") as HTMLButtonElement | null;
  if (backBtn) backBtn.onclick = verifierAnnulationComptage;

  document.getElementById("btn-lancer-comptage")?.addEventListener("click", lancerComptageMecs);
  document.getElementById("btn-voir-dernier-comptage")?.addEventListener("click", voirDernierComptage);

  const btnAbsent = document.getElementById("btn-comptage-absent");
  const btnPresent = document.getElementById("btn-comptage-present");
  btnAbsent?.addEventListener("click", () => animerEtValiderBouton(false));
  btnPresent?.addEventListener("click", () => animerEtValiderBouton(true));
  attacherEffetAppui(btnAbsent, 0.92);
  attacherEffetAppui(btnPresent, 0.92);

  document.getElementById("btn-cloturer-comptage")?.addEventListener("click", cloreComptageMecs);
  document.getElementById("btn-pdf-comptage")?.addEventListener("click", () => telechargerPDF("comptage"));

  document.getElementById("absence-modal-back-btn")?.addEventListener("pointerdown", annulerAbsenceMecs);
  Object.entries(MOTIFS_ABSENCE).forEach(([id, motif]) => {
    document.getElementById(id)?.addEventListener("pointerdown", () => validerMotifAbsenceMecs(motif));
  });
  document.getElementById("btn-absence-autre")?.addEventListener("pointerdown", ouvrirAbsenceAutreSaisie);
  document.getElementById("btn-absence-autre-retour")?.addEventListener("pointerdown", fermerAbsenceAutreSaisie);
  document.getElementById("btn-absence-autre-confirmer")?.addEventListener("pointerdown", validerAbsenceAutreMecs);
  document.getElementById("absence-autre-obs-effacer")?.addEventListener("click", effacerAbsenceAutreObs);

  document.getElementById("comptage-cancel-confirmer")?.addEventListener("click", confirmerAbandonTournee);
}
