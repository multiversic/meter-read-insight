import { apiRequest, buildQuery } from "@/lib/api-client";
import { mockPredictions } from "@/services/mock-data";
import type { Prediction } from "@/types";

export const predictionsService = {
  list(periode?: string) {
    return apiRequest<Prediction[]>(`/api/predictions${buildQuery({ periode })}`, {
      fallback: () => (periode === "2026-01" ? [] : mockPredictions),
    });
  },
};
