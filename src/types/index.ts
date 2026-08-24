export type StatutImage = "OK" | "KO" | "EnAttenteValidation";

export interface Image {
  id_image: number;
  cheminFichier: string;
  numeroCompteur: string;
  premise: string;
  dateCreation: string;
  heureCreation: string;
  codeAnomalie?: string | undefined;
  codeAnomaliePhoto?: string | undefined;
  codeActivite?: string | undefined;
  statut: StatutImage;
  probabiliteClassification: number; // 0-100
  scoreExtraction?: number | undefined; // 0-100
  agentId: number;
}

export interface Agent {
  id_agent: number;
  nom: string;
}

export interface RapportAgent {
  agentId: number;
  periode: string;
  tauxExploitabilite: number; // 0-100
}

export interface Compteur {
  numeroCompteur: string;
  index: number;
}

export interface Releve {
  id_releve: number;
  numeroCompteur: string;
  index: string;
  dateReleve: string;
}

export interface Facture {
  id_facture: number;
  numeroCompteur: string;
  montant: number;
  type: "abonne" | "speciale";
  dateEmission: string;
}

export interface Expert {
  id: number;
  nom: string;
}

export interface LoginResponse {
  token: string;
  expert: Expert;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface DashboardStats {
  imagesTraiteesAujourdhui: number;
  tauxOK: number;
  tauxKO: number;
  imagesEnAttente: number;
  montantFacture: number;
  repartitionStatuts: { statut: StatutImage; valeur: number }[];
  exploitabiliteParAgent: { agent: string; taux: number }[];
}

export interface ResultatExtraction {
  id_image: number;
  numeroCompteur: string;
  indexExtrait: string;
  scoreExtraction: number;
  statut: "Enregistre" | "AVerifier";
  dateCreation: string;
}

export interface Prediction {
  id_image: number;
  cheminFichier: string;
  numeroCompteur: string;
  statutPredit: StatutImage;
  indexExtrait?: string | undefined;
  scoreConfiance: number;
  dateCreation: string;
}

export interface FicheAbonne {
  numeroCompteur: string;
  nomAbonne: string;
  premise: string;
  dernierIndexFacture: number;
  nouvelIndexExtrait: number | null;
  consommation: number;
  montant: number;
  type: "abonne" | "speciale";
}

export interface ImagesFilters {
  statut?: StatutImage | "TOUS";
  agentId?: number | "TOUS";
  dateDebut?: string;
  dateFin?: string;
  page?: number;
}
