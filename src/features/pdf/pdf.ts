import { state } from "@/state/store";
import { jouerSon } from "@/ui/sound";
import { vibrer } from "@/services/feedback";

export type RapportType = "materiel" | "comptage";

/* ==========================================================================
   Icônes SVG pour le PDF — mêmes tracés que dans l'app, mais avec une
   couleur figée en HEX passée en paramètre : html2canvas ne résout pas les
   variables CSS (var(--xxx)) de façon fiable au moment du rendu du canvas.
   ========================================================================== */
function svgEnfant(taille: number, couleur: string): string {
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="${couleur}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4.5"></circle><path d="M18 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 6 19.5V21"></path></svg>`;
}
function svgAdulte(taille: number, couleur: string): string {
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="${couleur}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>`;
}
function svgCheck(taille: number, couleur: string): string {
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="${couleur}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`;
}
function svgCroix(taille: number, couleur: string): string {
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="${couleur}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
}
function svgAlerte(taille: number, couleur: string): string {
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="${couleur}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
}
function svgBatiment(taille: number, couleur: string): string {
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="${couleur}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v18"></path><path d="M14 9h4a1 1 0 0 1 1 1v12"></path><path d="M10 6h.01M10 10h.01M10 14h.01M6 6h.01M6 10h.01M6 14h.01M6 18h.01M10 18h.01M17 13h.01M17 17h.01"></path></svg>`;
}
function svgPorte(taille: number, couleur: string): string {
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="${couleur}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1"></rect><path d="M14 12h.01"></path></svg>`;
}
function svgLit(taille: number, couleur: string): string {
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="${couleur}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"></path><path d="M3 18h18"></path><path d="M3 22v-4"></path><path d="M21 22v-4"></path><path d="M6 10V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4"></path></svg>`;
}

/** Fil d'Ariane Bâtiment › Appartement › Chambre, version PDF (texte discret, centré). */
function itinerairePdf(chambreTexte: string): string {
  const parts = chambreTexte.split("│");
  const batimentBrut = (parts[0] ? parts[0].trim() : "").replace(/^[⚓🏢]\s*/u, "");
  const detailsBrut = parts[1] ? parts[1].trim() : "";

  let aptBrut = "";
  let chBrut = detailsBrut;
  if (detailsBrut.includes("-")) {
    const sub = detailsBrut.split("-");
    aptBrut = sub[0] ? sub[0].trim() : "";
    chBrut = sub[1] ? sub[1].trim() : "";
  }

  const couleur = "#8a93a5";
  const segment = (icone: string, texte: string): string =>
    `<span style="display:inline-flex; align-items:center; gap:5px;">${icone}${texte}</span>`;
  const separateur = `<span style="opacity:0.5;">›</span>`;

  const morceaux = [segment(svgBatiment(11, couleur), batimentBrut)];
  if (aptBrut) {
    morceaux.push(separateur, segment(svgPorte(11, couleur), aptBrut));
  }
  morceaux.push(separateur, segment(svgLit(11, couleur), chBrut));

  return `<div style="display:flex; align-items:center; justify-content:center; gap:7px; flex-wrap:wrap; font-size:11px; font-weight:700; color:${couleur};">${morceaux.join("")}</div>`;
}

/** Carte de répartition Mineurs/Majeurs, version PDF (mêmes codes couleur que l'app). */
function bulleRepartitionPdf(icone: string, label: string, couleurFond: string, presents: number, absents: number): string {
  return `
        <div style="background:#ffffff; border:1px solid #e3e8f0; border-radius:12px; padding:12px; text-align:center;">
            <div style="display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:9px;">
                <span style="display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:50%; background:${couleurFond};">${icone}</span>
                <span style="font-weight:800; font-size:12.5px; color:#1a1f2b;">${label}</span>
            </div>
            <div style="display:flex; gap:6px;">
                <span style="flex:1; display:flex; align-items:center; justify-content:center; gap:4px; background:rgba(46,125,50,0.12); color:#2e7d32; font-weight:700; font-size:11.5px; padding:6px 4px; border-radius:8px;">${svgCheck(10, "#2e7d32")}${presents}</span>
                <span style="flex:1; display:flex; align-items:center; justify-content:center; gap:4px; background:rgba(211,47,47,0.1); color:#d32f2f; font-weight:700; font-size:11.5px; padding:6px 4px; border-radius:8px;">${svgCroix(10, "#d32f2f")}${absents}</span>
            </div>
        </div>`;
}

interface TelechargerPdfOptions {
  /** Mode silencieux : génère le PDF sans le télécharger ni toucher au bouton (envoi Power Automate). */
  silencieux?: boolean;
}

/** Génération de rapports PDF (bilan matériel / relevé de présence MECS). */
export function telechargerPDF(type: RapportType, options?: TelechargerPdfOptions): Promise<string> | Promise<void> | undefined {
  const silencieux = !!(options && options.silencieux);

  const btnId = type === "comptage" ? "btn-pdf-comptage" : "btn-pdf-mat";
  const btn = document.getElementById(btnId) as HTMLButtonElement | null;
  const originalText = btn ? btn.innerText : "";
  if (!silencieux && btn) {
    btn.innerText = "⏳ Création du document...";
    btn.disabled = true;
  }

  // 1. Récupération des données formatées
  let contenuHTML = "";
  let titreDoc = "";
  const maintenant = new Date();
  const dateAujourdhui = maintenant.toLocaleDateString("fr-FR");
  const heureAujourdhui = maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  // 📄 Identité documentaire par type de rapport
  const META_DOC: Record<RapportType, { titre: string; sous: string }> = {
    materiel: { titre: "Bilan du matériel prêté", sous: "État des emprunts en cours" },
    comptage: { titre: "Relevé de présence", sous: "Relevé réglementaire des jeunes" }
  };
  const meta = META_DOC[type] || { titre: "Rapport de permanence", sous: "" };

  // Référence unique : PRM-AAAAMMJJ-HHMM
  const p2 = (n: number) => String(n).padStart(2, "0");
  const refDoc =
    `PRM-${maintenant.getFullYear()}${p2(maintenant.getMonth() + 1)}${p2(maintenant.getDate())}` + `-${p2(maintenant.getHours())}${p2(maintenant.getMinutes())}`;
  const auteurDoc = localStorage.getItem("coallia_pro_prenom") || "—";

  if (type === "materiel") {
    contenuHTML = document.getElementById("recap-content")?.innerHTML ?? "";
    titreDoc = "Bilan_Materiel_" + dateAujourdhui.replace(/\//g, "-");
  } else if (type === "comptage") {
    if (!state.mecsComptageLogs || state.mecsComptageLogs.length === 0) return undefined;
    const dernierLog = state.mecsComptageLogs[state.mecsComptageLogs.length - 1];

    let absentsHTML = "";
    if (!dernierLog.listeAbsents || dernierLog.listeAbsents.length === 0) {
      absentsHTML = `<div style="display:flex; align-items:center; justify-content:center; gap:7px; text-align:center; color:#2e7d32; font-weight:600; font-size:13px; padding:14px; background:#ffffff; border:1px solid #e3e8f0; border-radius:12px; font-family:'Helvetica Neue', Arial, sans-serif;">${svgCheck(14, "#2e7d32")}Aucun absent lors de ce contrôle. L'établissement était complet.</div>`;
    } else {
      dernierLog.listeAbsents.forEach((ab) => {
        const estMineur = ab.isMajor === false;
        const cardBg = estMineur ? "rgba(211,47,47,0.05)" : "#ffffff";
        const cardBorder = estMineur ? "1px solid rgba(211,47,47,0.22)" : "1px solid #e3e8f0";
        const borderLeft = estMineur ? "border-left: 5px solid #d32f2f;" : "";
        const alertTag = estMineur
          ? `<span style="display:inline-flex; align-items:center; gap:4px; font-size:9px; font-weight:800; color:#d32f2f; background:rgba(211,47,47,0.1); padding:2px 7px; border-radius:6px; margin-left:6px;">${svgEnfant(9, "#d32f2f")}MINEUR</span>`
          : "";

        // page-break-inside:avoid (+ préfixe break-inside) : une carte ne
        // doit jamais être coupée entre deux pages du PDF.
        absentsHTML += `
                        <div style="background:${cardBg}; border:${cardBorder}; ${borderLeft} border-radius:12px; padding:12px 14px; margin-bottom:8px; box-sizing:border-box; font-family:'Helvetica Neue', Arial, sans-serif; page-break-inside:avoid; break-inside:avoid;">
                            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:9px;">
                                <span style="color:#111; font-size:13px; font-weight:700; display:inline-flex; align-items:center;">${ab.prenom} ${ab.nom}${alertTag}</span>
                                <span style="font-size:10.5px; background:rgba(211,47,47,0.08); padding:4px 10px; border-radius:7px; color:#d32f2f; font-weight:700; white-space:nowrap; flex-shrink:0;">${ab.motif}</span>
                            </div>
                            ${itinerairePdf(ab.chambre)}
                        </div>
                    `;
      });
    }

    contenuHTML = `
                <div style="border:1px solid #c3d6ee; border-radius:12px; overflow:hidden; margin-bottom:24px; page-break-inside:avoid; break-inside:avoid;">
                <table style="width:100%; border-collapse:separate; border-spacing:0; font-family:'Helvetica Neue', Arial, sans-serif;">
                    <tr>
                        <td colspan="4" style="padding:7px 14px; background:#0055a4; border-radius:11px 11px 0 0; text-align:center;">
                            <span style="font-size:9px; color:#ffffff; font-weight:800; letter-spacing:1.5px; text-transform:uppercase;">Tournée de contrôle</span>
                        </td>
                    </tr>
                    <tr style="background:#f2f7fd;">
                        <td style="padding:12px 14px; width:24%; border-right:1px solid #d8e4f3; vertical-align:top; border-radius:0 0 0 11px;">
                            <div style="font-size:8.5px; color:#6b7f9c; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:4px;">Date</div>
                            <div style="font-size:12px; color:#0d1b2f; font-weight:700;">${dernierLog.date}</div>
                        </td>
                        <td style="padding:12px 14px; width:24%; border-right:1px solid #d8e4f3; vertical-align:top;">
                            <div style="font-size:8.5px; color:#6b7f9c; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:4px;">Créneau</div>
                            <div style="font-size:12px; color:#0d1b2f; font-weight:700;">${dernierLog.heureDebut} — ${dernierLog.heureFin || "--:--"}</div>
                        </td>
                        <td style="padding:12px 14px; width:26%; border-right:1px solid #d8e4f3; vertical-align:top;">
                            <div style="font-size:8.5px; color:#6b7f9c; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:4px;">Session</div>
                            <div style="font-size:12px; color:#0d1b2f; font-weight:700;">${dernierLog.type}</div>
                        </td>
                        <td style="padding:12px 14px; width:26%; vertical-align:top; border-radius:0 0 11px 0;">
                            <div style="font-size:8.5px; color:#6b7f9c; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:4px;">Contrôle effectué par</div>
                            <div style="font-size:12px; color:#0d1b2f; font-weight:700;">${dernierLog.professionnel}</div>
                        </td>
                    </tr>
                </table>
                </div>

                <div style="background:#ffffff; border:1px solid #e3e8f0; box-shadow:0 3px 10px rgba(10,22,44,0.05); padding:16px 18px; border-radius:14px; margin-bottom:24px; font-family:'Helvetica Neue', Arial, sans-serif; page-break-inside:avoid; break-inside:avoid;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-weight:800; font-size:14px; border-bottom:1px dashed #e3e8f0; padding-bottom:8px;"><span>Total Jeunes du Foyer :</span><b style="color:#0055a4;">${dernierLog.totalJeunes}</b></div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; font-size:12.5px; font-weight:600;"><span style="display:inline-flex; align-items:center; gap:6px;"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#2e7d32;"></span>Total Présents :</span><b style="color:#2e7d32;">${dernierLog.presents}</b></div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; font-size:12.5px; font-weight:600;"><span style="display:inline-flex; align-items:center; gap:6px;"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#d32f2f;"></span>Total Absents :</span><b style="color:#d32f2f;">${dernierLog.absents}</b></div>

                    <table style="width:100%; border-collapse:separate; border-spacing:5px 0; margin:8px -5px 0 -5px;">
                        <tr>
                            <td style="width:50%; padding:0;">${bulleRepartitionPdf(svgEnfant(13, "#c97a00"), "Mineurs", "rgba(255,159,10,0.16)", dernierLog.breakdown?.mineurs?.presents || 0, dernierLog.breakdown?.mineurs?.absents || 0)}</td>
                            <td style="width:50%; padding:0;">${bulleRepartitionPdf(svgAdulte(13, "#0055a4"), "Majeurs", "rgba(0,85,164,0.14)", dernierLog.breakdown?.majeurs?.presents || 0, dernierLog.breakdown?.majeurs?.absents || 0)}</td>
                        </tr>
                    </table>
                </div>

                <h4 style="text-align: center; font-size: 13.5px; color: #111; border-bottom: 2px solid #0055a4; padding-bottom: 5px; margin-bottom: 12px; text-transform: uppercase; font-weight: 800; letter-spacing:0.3px; font-family:'Helvetica Neue', Arial, sans-serif; display:flex; align-items:center; justify-content:center; gap:7px;">${svgAlerte(13, "#d32f2f")}Jeunes absents lors de ce contrôle</h4>
                <div style="width:100%;">${absentsHTML}</div>
            `;
    titreDoc = "Appel_Foyer_MECS_" + dateAujourdhui.replace(/\//g, "-");
  }

  // 2. Création de la page A4 (Largeur ajustée à 680px pour éviter la coupure droite)
  const elementTemp = document.createElement("div");
  elementTemp.innerHTML = `
        <div style="padding: 16px 28px 24px 28px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1f2b; background: #fff; width: 680px; max-width: 680px; box-sizing: border-box;">

            <!-- EN-TÊTE : logo (identique au splash screen) calé à gauche, identité de la
                 structure centrée sur la page — une colonne fantôme à droite, de même
                 largeur que le logo, équilibre la mise en page pour un centrage réel. -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
                <tr>
                    <td style="width: 90px; vertical-align: middle; text-align: left;">
                        <img src="/img/app-icon-transparent.png" style="height: 50px; display: block;">
                    </td>
                    <td style="vertical-align: middle; text-align: center;">
                        <div style="font-size: 12px; font-weight: 800; color: #1a1f2b; letter-spacing: 1.4px; text-transform: uppercase;">Coallia Guillaudot</div>
                        <div style="font-size: 10.5px; color: #7c8699; font-weight: 600; margin-top: 2px;">Espace Permanence</div>
                    </td>
                    <td style="width: 90px;"></td>
                </tr>
            </table>

            <!-- FILET TRICOLORE -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="height: 3px; background: #6B3FA0; width: 30%;"></td>
                    <td style="height: 3px; background: #0055a4; width: 44%;"></td>
                    <td style="height: 3px; background: #A8175A; width: 26%;"></td>
                </tr>
            </table>

            <!-- TITRE DU DOCUMENT, centré -->
            <div style="text-align: center; margin-bottom: 16px;">
                <div style="font-size: 9.5px; font-weight: 800; color: #A8175A; letter-spacing: 1.6px; text-transform: uppercase; margin-bottom: 5px;">Document de permanence</div>
                <h1 style="margin: 0; font-size: 23px; font-weight: 800; color: #1a1f2b; letter-spacing: -0.3px;">${meta.titre}</h1>
                ${meta.sous ? `<div style="font-size: 12px; color: #7c8699; margin-top: 4px; font-weight: 500;">${meta.sous}</div>` : ``}
            </div>

            <!-- BANDEAU DE MÉTADONNÉES -->
            <table style="width: 100%; border-collapse: collapse; background: #f5f7fb; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                    <td style="padding: 11px 14px; width: 33.33%; border-right: 1px solid #e3e8f0;">
                        <div style="font-size: 8.5px; color: #8a93a5; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 3px;">Édité le</div>
                        <div style="font-size: 11.5px; color: #1a1f2b; font-weight: 700;">${dateAujourdhui} à ${heureAujourdhui}</div>
                    </td>
                    <td style="padding: 11px 14px; width: 33.33%; border-right: 1px solid #e3e8f0;">
                        <div style="font-size: 8.5px; color: #8a93a5; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 3px;">Édité par</div>
                        <div style="font-size: 11.5px; color: #1a1f2b; font-weight: 700;">${auteurDoc}</div>
                    </td>
                    <td style="padding: 11px 14px; width: 33.33%;">
                        <div style="font-size: 8.5px; color: #8a93a5; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 3px;">Référence</div>
                        <div style="font-size: 11.5px; color: #1a1f2b; font-weight: 700; font-family: 'Courier New', monospace;">${refDoc}</div>
                    </td>
                </tr>
            </table>

            <!-- CORPS DU RAPPORT -->
            <div style="font-size: 13px; width: 100%; line-height: 1.55;">
                ${contenuHTML}
            </div>
        </div>
    `;

  // 3. Configuration du PDF (On laisse 25mm de vide en bas pour le pied de page)
  //    pagebreak "css" : respecte page-break-inside:avoid posé sur les cartes
  //    (stats, absents) pour qu'aucune ne soit jamais coupée entre deux pages.
  const opt: Html2PdfOptions = {
    margin: [10, 10, 25, 10],
    filename: titreDoc + ".pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] }
  };

  // 4. Génération avec injection du Footer en bas de CHAQUE page !
  const tache = html2pdf()
    .set(opt)
    .from(elementTemp)
    .toPdf()
    .get("pdf")
    .then(function (pdf) {
      const totalPages = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150); // Gris clair pro

        // Ligne subtile au dessus du footer
        const y = pdf.internal.pageSize.getHeight() - 12; // À 12mm du bord bas
        pdf.setDrawColor(220, 220, 220);
        const largeurPage = pdf.internal.pageSize.getWidth();

        // Filet fin sur toute la largeur utile
        pdf.setDrawColor(224, 228, 236);
        pdf.setLineWidth(0.3);
        pdf.line(15, y - 4, largeurPage - 15, y - 4);

        // Gauche : référence du document
        pdf.setFontSize(7.5);
        pdf.setTextColor(140, 148, 162);
        pdf.text(refDoc, 15, y);

        // Centre : mention de confidentialité
        const mention = "Document interne — Coallia Guillaudot";
        pdf.text(mention, (largeurPage - pdf.getTextWidth(mention)) / 2, y);

        // Droite : pagination
        const pagination = i + " / " + totalPages;
        pdf.text(pagination, largeurPage - 15 - pdf.getTextWidth(pagination), y);
      }
    });

  // 🤫 En mode silencieux : on renvoie le document encodé, sans téléchargement
  if (silencieux) {
    return tache.outputPdf("datauristring");
  }

  const resultat: Promise<void> = tache.save().then(() => {
    // Succès !
    if (btn) {
      btn.innerText = "✅ PDF Téléchargé";
      btn.style.backgroundColor = "var(--success)";
    }
    vibrer([100, 50, 100]);
    jouerSon("success");

    setTimeout(() => {
      if (btn) {
        btn.innerText = originalText;

        // 🎨 Tous les boutons d'export reviennent au bleu Coallia
        btn.style.backgroundColor = "var(--coallia-blue)";

        btn.disabled = false;
      }
    }, 3000);
  });
  return resultat;
}
