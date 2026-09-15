import type { TimeValue } from "./common";

export type InventoryCategory = "marmitexl" | "marmite" | "bassine" | "mixeur" | "cuiseurriz";
export type ItemStatus = "available" | "borrowed";

export interface InventoryItem {
  id: number;
  category: InventoryCategory;
  name: string;
  status: ItemStatus;
  jeune: string;
  pro: string;
  time: TimeValue;
}

export interface GenericCatalogItem {
  id: string;
  name: string;
}

export interface GenericLoan {
  loanId: string;
  genericId: string;
  name: string;
  qty: number;
  jeune: string;
  pro: string;
  time: TimeValue;
}
