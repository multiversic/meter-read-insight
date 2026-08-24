import { apiRequest, buildQuery } from "@/lib/api-client";
import { mockDashboardStats } from "@/services/mock-data";
import type { DashboardStats } from "@/types";

export const dashboardService = {
  stats(periode?: string) {
    return apiRequest<DashboardStats>(`/api/dashboard/stats${buildQuery({ periode })}`, {
      fallback: () => mockDashboardStats,
    });
  },
};
