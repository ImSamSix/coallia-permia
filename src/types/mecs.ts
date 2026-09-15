export type ComptageType = "Comptage du matin" | "Comptage du soir";

/** Un jeune du catalogue MECS, tel que compilé côté Worker (voir worker/src/mecs-catalog.ts). */
export interface MecsJeune {
  id: number;
  prenom: string;
  nom: string;
  age: number;
  isMajor: boolean;
  chambre: string;
  initiales: string;
}

export interface MecsAbsent {
  prenom: string;
  nom: string;
  chambre: string;
  motif: string;
  isMajor: boolean;
}

export interface MecsBreakdownSide {
  presents: number;
  absents: number;
}

export interface MecsBreakdown {
  mineurs: MecsBreakdownSide;
  majeurs: MecsBreakdownSide;
}

export interface MecsSession {
  date: string;
  heureDebut: string;
  timestampDebut: number;
  professionnel: string;
  type: ComptageType | string;
  totalJeunes: number;
  presents: number;
  absents: number;
  breakdown: MecsBreakdown;
  listeAbsents: MecsAbsent[];
  heureFin?: string;
  duree?: string;
  pdfBase64?: string;
  nomFichier?: string;
  synced?: boolean;
}
