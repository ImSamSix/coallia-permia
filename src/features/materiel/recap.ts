import { state } from "@/state/store";
import { jouerSon } from "@/ui/sound";
import { vibrer } from "@/services/feedback";

interface LigneEmprunt {
  name: string;
  time: unknown;
  pro: string;
}

// Couleurs figées en HEX (et non var(--xxx)) : ce contenu alimente aussi le
// PDF via html2canvas, qui ne résout pas les variables CSS de façon fiable.
function svgPersonneRecap(taille: number, couleur: string): string {
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="${couleur}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>`;
}
function svgColisRecap(taille: number, couleur: string): string {
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="${couleur}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>`;
}

/** Récapitulatif du matériel emprunté (bilan de fin de service), base du PDF "materiel". */
export function genererRecap(): void {
  let totalItems = 0;
  const grouped: Record<string, LigneEmprunt[]> = {};
  const now = new Date();

  state.inventory
    .filter((i) => i.status === "borrowed")
    .forEach((item) => {
      const nomJeune = item.jeune.trim().toUpperCase();
      if (!grouped[nomJeune]) grouped[nomJeune] = [];
      grouped[nomJeune].push({ name: item.name, time: item.time, pro: item.pro });
      totalItems++;
    });
  state.genericLoans.forEach((loan) => {
    const nomJeune = loan.jeune.trim().toUpperCase();
    if (!grouped[nomJeune]) grouped[nomJeune] = [];
    grouped[nomJeune].push({ name: `${loan.name} (x${loan.qty})`, time: loan.time, pro: loan.pro });
    totalItems += loan.qty;
  });

  if (totalItems === 0) {
    document.getElementById("recap-empty-modal")?.classList.remove("hidden");
    vibrer([50, 50]);
    jouerSon("success");
    return;
  }

  // 3. On génère un beau HTML structuré
  let htmlText = ``;

  for (const jeune in grouped) {
    htmlText += `
        <div style="margin-bottom: 15px; page-break-inside: avoid; font-family: 'Inter', sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="background: #0055a4; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0; font-weight: bold; font-size: 13px; text-transform: uppercase; display: flex; align-items: center; gap: 8px;">
                ${svgPersonneRecap(13, "#ffffff")}${jeune}
            </div>
            <div style="background: #ffffff; border: 1px solid #e0e0e0; border-top: none; padding: 12px; border-radius: 0 0 8px 8px;">
                <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 13px; line-height: 1.6;">`;

    grouped[jeune].forEach((emprunt) => {
      const diffHours = (now.getTime() - new Date(emprunt.time as string | number | Date).getTime()) / 3600000;
      const isOverdue = diffHours >= 24;
      const alertTag = isOverdue
        ? `<span style="background: #ffebee; color: #d32f2f; font-weight: bold; border: 1px solid #d32f2f; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 6px;">⚠️ RETARD</span>`
        : "";
      const datePret = new Date(emprunt.time as string | number | Date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      const heurePret = new Date(emprunt.time as string | number | Date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

      htmlText += `<li style="margin-bottom: 6px;">${alertTag}<b style="color: #222;">${emprunt.name}</b> <br><span style="color: #888; font-size: 11px; margin-left: 2px;">Prêté le ${datePret} à ${heurePret} par ${emprunt.pro}</span></li>`;
    });

    htmlText += `</ul></div></div>`;
  }

  const texteTotal = totalItems === 1 ? "1 objet emprunté" : `${totalItems} objets empruntés`;
  htmlText += `<div style="text-align: right; font-weight: bold; font-size: 15px; color: #111; margin-top: 20px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <span style="display: inline-flex; align-items: center; gap: 7px;">${svgColisRecap(15, "#0055a4")}Total : ${texteTotal}</span>
    </div>`;

  const content = document.getElementById("recap-content");
  if (content) content.innerHTML = htmlText;
  document.getElementById("recap-modal")?.classList.remove("hidden");
}
