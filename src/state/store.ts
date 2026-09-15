import type { InventoryItem, GenericLoan } from "@/types/inventory";
import type { MedLog } from "@/types/medication";
import type { TransLog } from "@/types/transmission";
import type { FrigoData, FrigoLog } from "@/types/frigo";
import type { PainLog } from "@/types/pain";
import type { MecsJeune, MecsSession } from "@/types/mecs";
import type { MediaData, MediaLog } from "@/types/media";
import type { AnnuaireData } from "@/types/annuaire";

function inventaireParDefaut(): InventoryItem[] {
  const items: InventoryItem[] = [];
  for (let i = 1; i <= 10; i++) {
    items.push({ id: i, category: "marmitexl", name: `Marmite XL n°${i}`, status: "available", jeune: "", pro: "", time: null });
  }
  for (let i = 1; i <= 10; i++) {
    items.push({ id: 10 + i, category: "marmite", name: `Marmite n°${i}`, status: "available", jeune: "", pro: "", time: null });
  }
  for (let i = 1; i <= 10; i++) {
    items.push({ id: 20 + i, category: "bassine", name: `Bassine n°${i}`, status: "available", jeune: "", pro: "", time: null });
  }
  items.push({ id: 31, category: "mixeur", name: "Mixeur Plongeant n°1", status: "available", jeune: "", pro: "", time: null });
  items.push({ id: 32, category: "mixeur", name: "Mixeur Plongeant n°2", status: "available", jeune: "", pro: "", time: null });
  for (let i = 1; i <= 4; i++) {
    items.push({ id: 32 + i, category: "cuiseurriz", name: `Cuiseur à riz n°${i}`, status: "available", jeune: "", pro: "", time: null });
  }
  return items;
}

function frigosDataParDefaut(): FrigoData[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `Frigo ${i + 1}`,
    cad: null,
    hyg: null,
    cont: null,
    time: null,
    pro: null,
    residents: []
  }));
}

function annuaireDataParDefaut(): AnnuaireData {
  return {
    tech: "06 14 12 28 98",
    coordF: "06 19 44 39 36",
    coordM: "06 11 28 61 07",
    chef: "06 10 85 97 04",
    astreinte1: "06 00 00 00 00",
    astreinte2: "06 00 00 00 00"
  };
}

function mediaDataParDefaut(): MediaData {
  return {
    manette: { id: "manettes", name: "Manettes Xbox S", status: "available", jeune: "", pro: "", time: null, lastJeune: "-", lastTime: "-", signature: "" },
    telecommande: { id: "telecommandes", name: "Télécommandes TV", status: "available", jeune: "", pro: "", time: null, lastJeune: "-", lastTime: "-", signature: "" },
    ordinateur1: { id: "ordinateur1", name: "Ordinateur Portable n°1", status: "available", jeune: "", pro: "", time: null, lastJeune: "-", lastTime: "-", signature: "" },
    ordinateur2: { id: "ordinateur2", name: "Ordinateur Portable n°2", status: "available", jeune: "", pro: "", time: null, lastJeune: "-", lastTime: "-", signature: "" }
  };
}

/**
 * État applicatif partagé, équivalent des `let` globaux de l'ancien script.js.
 * Exposé comme un unique objet mutable : les modules important `state`
 * peuvent réaffecter une propriété (`state.medLogs = [...]`) sans se heurter
 * à la restriction des bindings ES module en lecture seule.
 */
export const state = {
  inventory: inventaireParDefaut(),
  genericLoans: [] as GenericLoan[],
  medLogs: [] as MedLog[],
  transLogs: [] as TransLog[],
  frigoLogs: [] as FrigoLog[],
  painLogs: [] as PainLog[],
  frigosData: frigosDataParDefaut(),
  mecsComptageLogs: [] as MecsSession[],
  mediaData: mediaDataParDefaut(),
  annuaireData: annuaireDataParDefaut(),
  mediaLogs: [] as MediaLog[],
  /** Catalogue des jeunes MECS, reçu du Worker au login/GET — jamais persisté localement. */
  mecsJeunesCatalog: [] as MecsJeune[]
};
