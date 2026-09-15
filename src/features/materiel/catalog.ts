import type { GenericCatalogItem, InventoryCategory } from "@/types/inventory";

export const catNames: Record<InventoryCategory, string> = {
  marmitexl: "🍲 Marmites XL",
  marmite: "🥘 Marmites",
  mixeur: "🌪️ Mixeurs",
  bassine: "🥣 Bassines",
  cuiseurriz: "🍚 Cuiseurs à riz"
};

export const genericCatalog: GenericCatalogItem[] = [
  { id: "g1", name: "🍳 Poêle" },
  { id: "g2", name: "🥘 Casserole" },
  { id: "g3", name: "🔪 Planche à découper" },
  { id: "g4", name: "🍝 Passoire" },
  { id: "g5", name: "🍴 Ustensiles" }
];
