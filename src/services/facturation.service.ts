import { apiRequest, buildQuery } from "@/lib/api-client";
import { mockFactures, mockFicheAbonne, mockReleves } from "@/services/mock-data";
import type { Facture, FicheAbonne, Paginated, Releve } from "@/types";

const PAGE_SIZE = 10;

export const facturationService = {
  compteur(numero: string) {
    return apiRequest<FicheAbonne>(`/api/compteurs/${numero}`, {
      fallback: () => mockFicheAbonne(numero),
    });
  },

  releves(numero: string) {
    return apiRequest<Releve[]>(`/api/compteurs/${numero}/releves`, {
      fallback: () => mockReleves(numero),
    });
  },

  facturer(numero: string) {
    return apiRequest<Facture>(`/api/facturation/${numero}`, {
      method: "POST",
      fallback: () => ({
        id_facture: Math.floor(Math.random() * 9000) + 6000,
        numeroCompteur: numero,
        montant: mockFicheAbonne(numero).montant,
        type: "abonne" as const,
        dateEmission: new Date().toISOString().slice(0, 10),
      }),
    });
  },

  factures(params: { page?: number; numeroCompteur?: string }) {
    const page = params.page ?? 1;
    return apiRequest<Paginated<Facture>>(
      `/api/factures${buildQuery({ page, numeroCompteur: params.numeroCompteur })}`,
      {
        fallback: () => {
          const items = mockFactures.filter(
            (f) => !params.numeroCompteur || f.numeroCompteur.includes(params.numeroCompteur),
          );
          return {
            items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
            page,
            pageSize: PAGE_SIZE,
            total: items.length,
          };
        },
      },
    );
  },
};
