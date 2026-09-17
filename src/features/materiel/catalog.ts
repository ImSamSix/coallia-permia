import type { GenericCatalogItem, InventoryCategory } from "@/types/inventory";

export const catNames: Record<InventoryCategory, string> = {
  marmitexl: "Marmites XL",
  marmite: "Marmites",
  mixeur: "Mixeurs",
  bassine: "Bassines",
  cuiseurriz: "Cuiseurs à riz"
};

export const genericCatalog: GenericCatalogItem[] = [
  { id: "g1", name: "Poêle" },
  { id: "g2", name: "Casserole" },
  { id: "g3", name: "Planche à découper" },
  { id: "g4", name: "Passoire" },
  { id: "g5", name: "Ustensiles" }
];

/* ==========================================================================
   Icônes SVG par matériel (remplacent les emojis) — stroke="currentColor" :
   héritent la couleur du texte qui les entoure, quel que soit le contexte.
   ========================================================================== */
export const catIcons: Record<InventoryCategory, string> = {
  // Grande marmite : corps large, deux poignées latérales, couvercle
  marmitexl: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="9" width="16" height="9" rx="2"></rect><path d="M1 11h3M20 11h3"></path><line x1="6" y1="9" x2="18" y2="9"></line><line x1="12" y1="9" x2="12" y2="6"></line><circle cx="12" cy="5" r="1"></circle></svg>`,
  // Marmite : cocotte avec couvercle, sans poignées latérales
  marmite: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 10h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6Z"></path><line x1="5" y1="10" x2="19" y2="10"></line><line x1="12" y1="10" x2="12" y2="7"></line><circle cx="12" cy="6" r="1"></circle></svg>`,
  // Mixeur : bol tapered sur un socle
  mixeur: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l-1.5 10h-5L8 3Z"></path><rect x="6" y="13" width="12" height="4" rx="1"></rect><rect x="7" y="17" width="10" height="4" rx="1"></rect></svg>`,
  // Bassine : bassin large et évasé
  bassine: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18l-2 7a2 2 0 0 1-2 1.5H7A2 2 0 0 1 5 17L3 10Z"></path><line x1="2" y1="10" x2="22" y2="10"></line></svg>`,
  // Cuiseur à riz : appareil rectangulaire avec bouton
  cuiseurriz: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="3"></rect><line x1="4" y1="12" x2="20" y2="12"></line><circle cx="12" cy="16" r="1.3"></circle><line x1="9" y1="5" x2="9" y2="8"></line><line x1="15" y1="5" x2="15" y2="8"></line></svg>`
};

export const genericIcons: Record<string, string> = {
  // Poêle : vue de profil (fond évasé peu profond) + long manche horizontal,
  // pour ne pas être confondue avec une loupe (cercle + trait diagonal)
  g1: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 11a7 3.4 0 0 0 14 0"></path><line x1="2" y1="11" x2="2" y2="9"></line><line x1="16" y1="11" x2="16" y2="9"></line><line x1="16" y1="10" x2="22" y2="10"></line></svg>`,
  // Casserole : corps haut + manche droit + couvercle
  g2: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="9" width="12" height="9" rx="2"></rect><line x1="17" y1="12" x2="22" y2="12"></line><line x1="11" y1="9" x2="11" y2="6"></line><circle cx="11" cy="5" r="1"></circle></svg>`,
  // Planche à découper : rectangle arrondi + trou de suspension
  g3: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="13" rx="2"></rect><circle cx="18" cy="8.5" r="1"></circle></svg>`,
  // Passoire : bassin + poignées + trous
  g4: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18l-2 6a2.5 2.5 0 0 1-2.4 1.8H7.4A2.5 2.5 0 0 1 5 16l-2-6Z"></path><path d="M1 10.5h3M20 10.5h3"></path><circle cx="9" cy="13" r="0.6" fill="currentColor" stroke="none"></circle><circle cx="12" cy="14" r="0.6" fill="currentColor" stroke="none"></circle><circle cx="15" cy="13" r="0.6" fill="currentColor" stroke="none"></circle></svg>`,
  // Ustensiles : fourchette + cuillère
  g5: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2v7a2 2 0 0 0 2 2v11"></path><path d="M7 2v5M11 2v5"></path><path d="M17 2c1.8.6 2 2.8 2 4.5S18 11 16 11c0 0 1 1 1 3v8"></path></svg>`
};
