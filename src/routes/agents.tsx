import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/components/socadel/AppLayout";
import { DataTable, type Column } from "@/components/socadel/DataTable";
import { EmptyState, ErrorState } from "@/components/socadel/EmptyState";
import { ChartSkeleton, TableSkeleton } from "@/components/socadel/LoadingSkeleton";
import { PageHeader } from "@/components/socadel/PageHeader";
import { TagBadge } from "@/components/socadel/StatusBadge";
import { ConfidenceScore } from "@/components/socadel/ConfidenceScore";
import { Label } from "@/components/ui/label";
import { useAgents, useRapportAgent, useRapportsAgents } from "@/hooks/useSocadelData";
import type { RapportAgent } from "@/types";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Évaluation des agents — SOCADEL Vision" },
      {
        name: "description",
        content:
          "Comparez le taux d'images exploitables par agent releveur et suivez son évolution mensuelle.",
      },
      { property: "og:title", content: "Évaluation des agents — SOCADEL Vision" },
      { property: "og:description", content: "Qualité des relevés photo par agent SOCADEL." },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  const [periode, setPeriode] = useState("2026-08");
  const [agentId, setAgentId] = useState<number | null>(null);
  const { data: agents } = useAgents();
  const { data, isLoading, isError, refetch } = useRapportsAgents(periode);
  const { data: historique, isLoading: loadingHistorique } = useRapportAgent(agentId, periode);

  const nomAgent = (id: number) => agents?.find((a) => a.id_agent === id)?.nom ?? `Agent ${id}`;

  const columns: Column<RapportAgent>[] = [
    {
      key: "agent",
      header: "Agent releveur",
      cell: (r) => <span className="font-medium text-foreground">{nomAgent(r.agentId)}</span>,
    },
    { key: "periode", header: "Période", cell: (r) => r.periode },
    {
      key: "taux",
      header: "Taux d'exploitabilité",
      cell: (r) => <ConfidenceScore score={r.tauxExploitabilite} />,
    },
    {
      key: "appreciation",
      header: "Appréciation",
      hideOnMobile: true,
      cell: (r) =>
        r.tauxExploitabilite >= 85 ? (
          <TagBadge label="Très bon" tone="success" />
        ) : r.tauxExploitabilite >= 70 ? (
          <TagBadge label="Correct" tone="info" />
        ) : (
          <TagBadge label="À accompagner" tone="warning" />
        ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Qualité terrain"
        title="Évaluation des agents"
        description="Identifiez les agents releveurs dont les photos sont fréquemment inexploitables afin de cibler la formation."
        actions={
          <div className="flex items-center gap-2">
            <Label htmlFor="periode-agents" className="text-xs text-muted-foreground">
              Période
            </Label>
            <input
              id="periode-agents"
              type="month"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="h-9 rounded-xl border border-input bg-card px-3 text-sm"
            />
          </div>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading || !data ? (
        <TableSkeleton cols={4} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun rapport pour cette période"
          description="Sélectionnez une autre période pour consulter les performances des agents."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={data}
          getRowId={(r) => r.agentId}
          onRowClick={(r) => setAgentId(r.agentId)}
          caption="Taux d'exploitabilité par agent"
          mobileTitle={(r) => nomAgent(r.agentId)}
        />
      )}

      <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">
          {agentId ? `Évolution — ${nomAgent(agentId)}` : "Évolution mensuelle"}
        </h2>
        <p className="mb-2 text-xs text-muted-foreground">
          {agentId
            ? "Taux d'images exploitables sur les cinq dernières périodes."
            : "Sélectionnez un agent dans le tableau pour afficher son historique."}
        </p>
        {agentId === null ? (
          <EmptyState title="Aucun agent sélectionné" description="Cliquez sur une ligne du tableau." />
        ) : loadingHistorique || !historique ? (
          <ChartSkeleton />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historique}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="periode" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line
                  type="monotone"
                  dataKey="tauxExploitabilite"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
