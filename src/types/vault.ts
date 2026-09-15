import type { InventoryItem, GenericLoan } from "./inventory";
import type { MedLog } from "./medication";
import type { TransLog } from "./transmission";
import type { FrigoData, FrigoLog } from "./frigo";
import type { PainLog } from "./pain";
import type { MecsSession } from "./mecs";
import type { MediaData, MediaLog } from "./media";
import type { AnnuaireData } from "./annuaire";

/** Forme exacte du coffre chiffré (voir sauvegarderToutesLesDonnees / dechiffrerCoffreLocal). */
export interface VaultData {
  inventory: InventoryItem[];
  genericLoans: GenericLoan[];
  medLogs: MedLog[];
  transLogs: TransLog[];
  frigoLogs: FrigoLog[];
  painLogs: PainLog[];
  frigosData: FrigoData[];
  mecsComptageLogs: MecsSession[];
  mediaData: MediaData;
  annuaireData: AnnuaireData;
  mediaLogs: MediaLog[];
}
