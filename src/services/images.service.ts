import { apiRequest, buildQuery } from "@/lib/api-client";
import { mockImages } from "@/services/mock-data";
import type { Image, ImagesFilters, Paginated } from "@/types";

const PAGE_SIZE = 10;

function filterMock(filters: ImagesFilters): Paginated<Image> {
  const page = filters.page ?? 1;
  const items = mockImages.filter((img) => {
    if (filters.statut && filters.statut !== "TOUS" && img.statut !== filters.statut) return false;
    if (filters.agentId && filters.agentId !== "TOUS" && img.agentId !== filters.agentId) return false;
    if (filters.dateDebut && img.dateCreation < filters.dateDebut) return false;
    if (filters.dateFin && img.dateCreation > filters.dateFin) return false;
    return true;
  });
  return {
    items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    page,
    pageSize: PAGE_SIZE,
    total: items.length,
  };
}

export const imagesService = {
  list(filters: ImagesFilters) {
    const query = buildQuery({
      statut: filters.statut,
      agentId: filters.agentId,
      dateDebut: filters.dateDebut,
      dateFin: filters.dateFin,
      page: filters.page ?? 1,
    });
    return apiRequest<Paginated<Image>>(`/api/images${query}`, {
      fallback: () => filterMock(filters),
    });
  },

  detail(id: number) {
    return apiRequest<Image>(`/api/images/${id}`, {
      fallback: () => mockImages.find((img) => img.id_image === id) ?? mockImages[0]!,
    });
  },

  enAttenteValidation() {
    return apiRequest<Image[]>("/api/images/en-attente-validation", {
      fallback: () => mockImages.filter((img) => img.statut === "EnAttenteValidation"),
    });
  },

  upload(files: File[]) {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    return apiRequest<{ uploaded: number }>("/api/images/upload", {
      method: "POST",
      body: form,
      fallback: () => ({ uploaded: files.length }),
    });
  },

  valider(id: number, decision: "valide" | "invalide") {
    return apiRequest<Image>(`/api/images/${id}/valider`, {
      method: "PATCH",
      body: JSON.stringify({ decision }),
      fallback: () => {
        const image = mockImages.find((img) => img.id_image === id) ?? mockImages[0]!;
        return { ...image, statut: decision === "valide" ? "OK" : "KO" };
      },
    });
  },
};
