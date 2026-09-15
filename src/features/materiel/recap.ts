import { state } from "@/state/store";
import { jouerSon } from "@/ui/sound";

interface LigneEmprunt {
  name: string;
  time: unknown;
  pro: string;
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
    if (navigator.vibrate) navigator.vibrate([50, 50]);
    jouerSon("success");
    return;
  }

  // 3. On génère un beau HTML structuré
  let htmlText = ``;

  for (const jeune in grouped) {
    htmlText += `
        <div style="margin-bottom: 15px; page-break-inside: avoid; font-family: 'Inter', sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="background: #0055a4; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0; font-weight: bold; font-size: 13px; text-transform: uppercase;">
                👤 ${jeune}
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

  htmlText += `<div style="text-align: right; font-weight: bold; font-size: 15px; color: #111; margin-top: 20px; border-top: 2px solid #0055a4; padding-top: 12px;">
        📦 Total : ${totalItems} objet(s) emprunté(s)
    </div>`;

  const content = document.getElementById("recap-content");
  if (content) content.innerHTML = htmlText;
  document.getElementById("recap-modal")?.classList.remove("hidden");
}
