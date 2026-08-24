import type {
  Agent,
  DashboardStats,
  Facture,
  FicheAbonne,
  Image,
  Prediction,
  RapportAgent,
  Releve,
  ResultatExtraction,
  StatutImage,
} from "@/types";

export const mockAgents: Agent[] = [
  { id_agent: 1, nom: "Awono Étienne" },
  { id_agent: 2, nom: "Mbarga Solange" },
  { id_agent: 3, nom: "Ndoumbe Junior" },
  { id_agent: 4, nom: "Fotso Clarisse" },
  { id_agent: 5, nom: "Tchoumi Bertrand" },
];

const PREMISES = ["Douala Bonapriso", "Yaoundé Bastos", "Bafoussam Centre", "Kribi Plage", "Garoua Nord"];
const IMAGE_SOURCES = [
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=640&q=70",
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=640&q=70",
  "https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=640&q=70",
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=640&q=70",
];

function statutFromScore(score: number): StatutImage {
  if (score > 96) return "OK";
  if (score < 42) return "KO";
  return "EnAttenteValidation";
}

export const mockImages: Image[] = Array.from({ length: 48 }, (_, i) => {
  const score = Math.round(20 + ((i * 37) % 80) + (i % 3));
  const clamped = Math.min(99, Math.max(12, score));
  const agent = mockAgents[i % mockAgents.length]!;
  const day = String(((i * 3) % 27) + 1).padStart(2, "0");
  return {
    id_image: 1000 + i,
    cheminFichier: IMAGE_SOURCES[i % IMAGE_SOURCES.length]!,
    numeroCompteur: `CM${String(4100000 + i * 137)}`,
    premise: PREMISES[i % PREMISES.length]!,
    dateCreation: `2026-08-${day}`,
    heureCreation: `${String(7 + (i % 11)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
    codeAnomalie: i % 5 === 0 ? "ANO-12" : undefined,
    codeAnomaliePhoto: i % 7 === 0 ? "PHO-03" : undefined,
    codeActivite: i % 2 === 0 ? "ACT-RELEVE" : "ACT-CONTROLE",
    statut: statutFromScore(clamped),
    probabiliteClassification: clamped,
    scoreExtraction: clamped > 96 ? Math.min(99, clamped - (i % 25)) : undefined,
    agentId: agent.id_agent,
  } satisfies Image;
});

export const mockRapportsAgents: RapportAgent[] = mockAgents.map((agent, i) => ({
  agentId: agent.id_agent,
  periode: "2026-08",
  tauxExploitabilite: 62 + ((i * 9) % 34),
}));

export const mockDashboardStats: DashboardStats = {
  imagesTraiteesAujourdhui: 184,
  tauxOK: 71,
  tauxKO: 12,
  imagesEnAttente: 23,
  montantFacture: 48_320_500,
  repartitionStatuts: [
    { statut: "OK", valeur: 132 },
    { statut: "KO", valeur: 29 },
    { statut: "EnAttenteValidation", valeur: 23 },
  ],
  exploitabiliteParAgent: mockAgents.map((a, i) => ({
    agent: a.nom.split(" ")[0]!,
    taux: 62 + ((i * 9) % 34),
  })),
};

export const mockResultatsExtraction: ResultatExtraction[] = mockImages
  .filter((img) => img.statut === "OK")
  .map((img, i) => ({
    id_image: img.id_image,
    numeroCompteur: img.numeroCompteur,
    indexExtrait: String(12000 + i * 431),
    scoreExtraction: img.scoreExtraction ?? 80,
    statut: (img.scoreExtraction ?? 80) > 75 ? "Enregistre" : "AVerifier",
    dateCreation: img.dateCreation,
  }));

export const mockPredictions: Prediction[] = mockImages.slice(0, 20).map((img, i) => ({
  id_image: img.id_image,
  cheminFichier: img.cheminFichier,
  numeroCompteur: img.numeroCompteur,
  statutPredit: img.statut,
  indexExtrait: img.statut === "OK" ? String(12000 + i * 431) : undefined,
  scoreConfiance: img.probabiliteClassification,
  dateCreation: img.dateCreation,
}));

export const mockFactures: Facture[] = Array.from({ length: 26 }, (_, i) => ({
  id_facture: 5000 + i,
  numeroCompteur: mockImages[i]!.numeroCompteur,
  montant: 12_500 + i * 3_740,
  type: i % 4 === 0 ? "speciale" : "abonne",
  dateEmission: `2026-08-${String((i % 27) + 1).padStart(2, "0")}`,
}));

export function mockFicheAbonne(numeroCompteur: string): FicheAbonne {
  const dernier = 11_450;
  const nouveau = 12_310;
  return {
    numeroCompteur,
    nomAbonne: "Abonné SOCADEL",
    premise: PREMISES[numeroCompteur.length % PREMISES.length]!,
    dernierIndexFacture: dernier,
    nouvelIndexExtrait: nouveau,
    consommation: nouveau - dernier,
    montant: (nouveau - dernier) * 79,
    type: "abonne",
  };
}

export function mockReleves(numeroCompteur: string): Releve[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id_releve: 900 + i,
    numeroCompteur,
    index: String(9_600 + i * 460),
    dateReleve: `2026-0${i + 2}-12`,
  }));
}
