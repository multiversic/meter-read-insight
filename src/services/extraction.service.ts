import { apiRequest, apiUrl, buildQuery } from "@/lib/api-client";
import { mockResultatsExtraction } from "@/services/mock-data";
import type { Paginated, ResultatExtraction } from "@/types";

const PAGE_SIZE = 10;

export const extractionService = {
  resultats(params: { statut?: string; page?: number }) {
    const page = params.page ?? 1;
    return apiRequest<Paginated<ResultatExtraction>>(
      `/api/extraction/resultats${buildQuery({ statut: params.statut, page })}`,
      {
        fallback: () => {
          const items = mockResultatsExtraction.filter(
            (r) => !params.statut || params.statut === "TOUS" || r.statut === params.statut,
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

  lancer(id: number) {
    return apiRequest<ResultatExtraction>(`/api/images/${id}/extraction`, {
      method: "POST",
      fallback: () =>
        mockResultatsExtraction.find((r) => r.id_image === id) ?? mockResultatsExtraction[0]!,
    });
  },

  lancerLot(ids: number[]) {
    return apiRequest<{ lances: number }>("/api/extraction/batch", {
      method: "POST",
      body: JSON.stringify({ ids }),
      fallback: () => ({ lances: ids.length }),
    });
  },

  exportCsvUrl() {
    return apiUrl("/api/extraction/export-csv");
  },
};
