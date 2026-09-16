import { state } from "@/state/store";
import { jouerSon } from "@/ui/sound";
import { vibrer } from "@/services/feedback";

export type RapportType = "materiel" | "comptage";

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
    comptage: { titre: "Relevé de présence", sous: "Comptage réglementaire des résidents" }
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
      absentsHTML = `<div style="text-align:center; color:#2e7d32; font-weight:600; font-size:13.5px; padding:15px; background:#e8f5e9; border-radius:10px;">✨ Aucun absent lors de ce contrôle. L'établissement était complet.</div>`;
    } else {
      dernierLog.listeAbsents.forEach((ab) => {
        const estMineur = ab.isMajor === false;
        const cardBg = estMineur ? "#fff5f5" : "#f8f9fa";
        const borderLeft = estMineur ? "border-left: 5px solid #d32f2f;" : "border-left: 5px solid #757575;";
        const alertTag = estMineur
          ? "<span style='font-size:9px; font-weight:800; color:#d32f2f; background:rgba(211,47,47,0.1); padding:2px 6px; border-radius:5px; margin-left:8px; font-family:sans-serif;'>🚨 MINEUR</span>"
          : "";

        absentsHTML += `
                        <table style="width: 100%; background:${cardBg}; border:1px solid #e0e0e0; ${borderLeft} padding: 12px; border-radius: 10px; margin-bottom: 8px; border-collapse: separate; box-sizing: border-box; font-family:'Helvetica Neue', Arial, sans-serif;">
                            <tr>
                                <td style="text-align: left; vertical-align: middle;">
                                    <span style="color:#111; font-size:13.5px; font-weight:700;">${ab.prenom} ${ab.nom} ${alertTag}</span><br>
                                    <span style="font-size:11px; color:#666; font-weight:700; margin-top:2px; display:inline-block;">🚪 ${ab.chambre}</span>
                                </td>
                                <td style="text-align: right; vertical-align: middle; padding-right: 2px;">
                                    <span style="font-size:11px; background:#ffffff; padding:5px 12px; border-radius:6px; border:1px solid #e0e0e0; color:#d32f2f; font-weight:800; text-transform:uppercase; display:inline-block; white-space:nowrap;">${ab.motif}</span>
                                </td>
                            </tr>
                        </table>
                    `;
      });
    }

    contenuHTML = `
                <div style="border:1px solid #c3d6ee; border-radius:12px; overflow:hidden; margin-bottom:24px;">
                <table style="width:100%; border-collapse:separate; border-spacing:0; font-family:'Helvetica Neue', Arial, sans-serif;">
                    <tr>
                        <td colspan="4" style="padding:7px 14px; background:#0055a4; border-radius:11px 11px 0 0;">
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

                <div style="border: 1px solid #e0e0e0; background: #ffffff; padding: 18px; border-radius: 12px; margin-bottom: 25px; font-family: 'Helvetica Neue', Arial, sans-serif;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-weight:800; font-size:14.5px; border-bottom:1px dashed #e0e0e0; padding-bottom:6px;"><span>Total Jeunes du Foyer :</span><b style="color:#0055a4;">${dernierLog.totalJeunes}</b></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:13px; font-weight:600;"><span>🟢 Présents :</span><b style="color:#2e7d32;">${dernierLog.presents}</b></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px; font-weight:600;"><span>🔴 Absents :</span><b style="color:#d32f2f;">${dernierLog.absents}</b></div>

                    <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                        <tr>
                            <td style="width:50%; padding-right:6px;">
                                <div style="background:#f8f9fa; border:1px solid #e0e0e0; padding:10px; border-radius:8px; text-align:center;">
                                    <div style="font-weight:800; font-size:12px; margin-bottom:3px; color:#222;">👶 MINEURS</div>
                                    <div style="font-size:11.5px; color:#555; font-weight:600;">Présents : <span style="color:#2e7d32; font-weight:700;">${dernierLog.breakdown?.mineurs?.presents || 0}</span> │ Absents : <span style="color:#d32f2f; font-weight:700;">${dernierLog.breakdown?.mineurs?.absents || 0}</span></div>
                                </div>
                            </td>
                            <td style="width:50%; padding-left:6px;">
                                <div style="background:#f8f9fa; border:1px solid #e0e0e0; padding:10px; border-radius:8px; text-align:center;">
                                    <div style="font-weight:800; font-size:12px; margin-bottom:3px; color:#222;">🧑 MAJEURS</div>
                                    <div style="font-size:11.5px; color:#555; font-weight:600;">Présents : <span style="color:#2e7d32; font-weight:700;">${dernierLog.breakdown?.majeurs?.presents || 0}</span> │ Absents : <span style="color:#d32f2f; font-weight:700;">${dernierLog.breakdown?.majeurs?.absents || 0}</span></div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <h4 style="text-align: center; font-size: 13.5px; color: #111; border-bottom: 2px solid #0055a4; padding-bottom: 5px; margin-bottom: 12px; text-transform: uppercase; font-weight: 800; letter-spacing:0.3px; font-family:'Helvetica Neue', Arial, sans-serif;">🚨 Détail des signalements d'absence</h4>
                <div style="width:100%;">${absentsHTML}</div>
            `;
    titreDoc = "Appel_Foyer_MECS_" + dateAujourdhui.replace(/\//g, "-");
  }

  // 2. Création de la page A4 (Largeur ajustée à 680px pour éviter la coupure droite)
  const elementTemp = document.createElement("div");
  elementTemp.innerHTML = `
        <div style="padding: 16px 28px 24px 28px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1f2b; background: #fff; width: 680px; max-width: 680px; box-sizing: border-box;">

            <!-- EN-TÊTE : logo à gauche, identité de la structure à droite -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
                <tr>
                    <td style="vertical-align: middle; text-align: left;">
                        <img src="/img/logo-coallia.png" style="height: 44px; display: block;">
                    </td>
                    <td style="vertical-align: middle; text-align: right;">
                        <div style="font-size: 12px; font-weight: 800; color: #1a1f2b; letter-spacing: 1.4px; text-transform: uppercase;">Coallia Guillaudot</div>
                        <div style="font-size: 10.5px; color: #7c8699; font-weight: 600; margin-top: 2px;">Espace Permanence</div>
                    </td>
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

            <!-- TITRE DU DOCUMENT -->
            <div style="margin-bottom: 16px;">
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
  const opt: Html2PdfOptions = {
    margin: [10, 10, 25, 10],
    filename: titreDoc + ".pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
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
