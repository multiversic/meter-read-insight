import { apiRequest, buildQuery } from "@/lib/api-client";
import { mockAgents, mockRapportsAgents } from "@/services/mock-data";
import type { Agent, RapportAgent } from "@/types";

export const agentsService = {
  list() {
    return apiRequest<Agent[]>("/api/agents", { fallback: () => mockAgents });
  },

  rapport(id: number, periode?: string) {
    return apiRequest<RapportAgent[]>(`/api/agents/${id}/rapport${buildQuery({ periode })}`, {
      fallback: () =>
        ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08"].map((p, i) => ({
          agentId: id,
          periode: p,
          tauxExploitabilite: Math.min(
            98,
            (mockRapportsAgents.find((r) => r.agentId === id)?.tauxExploitabilite ?? 70) - 10 + i * 3,
          ),
        })),
    });
  },

  rapports(periode?: string) {
    return apiRequest<RapportAgent[]>(`/api/rapports-agents${buildQuery({ periode })}`, {
      fallback: () => mockRapportsAgents,
    });
  },
};
