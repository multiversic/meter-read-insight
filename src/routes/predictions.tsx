import { createFileRoute } from "@tanstack/react-router";
import { LineChart } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/socadel/AppLayout";
import { ConfidenceScore } from "@/components/socadel/ConfidenceScore";
import { DataTable, type Column } from "@/components/socadel/DataTable";
import { EmptyState, ErrorState } from "@/components/socadel/EmptyState";
import { TableSkeleton } from "@/components/socadel/LoadingSkeleton";
import { PageHeader } from "@/components/socadel/PageHeader";
import { StatusBadge } from "@/components/socadel/StatusBadge";
import { Label } from "@/components/ui/label";
import { usePredictions } from "@/hooks/useSocadelData";
import { formatDate } from "@/lib/format";
import type { Prediction } from "@/types";

export const Route = createFileRoute("/predictions")({
  head: () => ({
    meta: [
      { title: "Prédictions IA — SOCADEL Vision" },
      {
        name: "description",
        content:
          "Suivez les prédictions du modèle : statut prédit, index extrait et score de confiance par image.",
      },
      { property: "og:title", content: "Prédictions IA — SOCADEL Vision" },
      { property: "og:description", content: "Suivi des prédictions du modèle de contrôle des compteurs." },
    ],
  }),
  component: PredictionsPage,
});

function PredictionsPage() {
  const [periode, setPeriode] = useState("2026-08");
  const { data, isLoading, isError, refetch } = usePredictions(periode);

  const columns: Column<Prediction>[] = [
    {
      key: "image",
      header: "Image",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.cheminFichier}
            alt={`Aperçu du compteur ${p.numeroCompteur}`}
            className="size-11 rounded-lg object-cover"
            loading="lazy"
          />
          <span className="font-medium text-foreground">{p.numeroCompteur}</span>
        </div>
      ),
    },
    { key: "statut", header: "Statut prédit", cell: (p) => <StatusBadge statut={p.statutPredit} /> },
    {
      key: "index",
      header: "Index extrait",
      cell: (p) => (
        <span className="font-semibold tabular-nums">
          {p.indexExtrait === null || p.indexExtrait === undefined ? "—" : p.indexExtrait}
        </span>
      ),
    },
    { key: "score", header: "Confiance", cell: (p) => <ConfidenceScore score={p.scoreConfiance} /> },
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (p) => <span className="text-muted-foreground">{formatDate(p.dateCreation)}</span>,
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Supervision du modèle"
        title="Visualiser les prédictions"
        description="Contrôlez la cohérence des prédictions du modèle en regard des images soumises."
        actions={
          <div className="flex items-center gap-2">
            <Label htmlFor="periode-predictions" className="text-xs text-muted-foreground">
              Période
            </Label>
            <input
              id="periode-predictions"
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
        <TableSkeleton cols={5} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={LineChart}
          title="Aucune prédiction disponible pour cette période"
          description="Choisissez une autre période ou attendez le prochain traitement automatique."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={data}
          getRowId={(p) => p.id_image}
          caption="Prédictions du modèle par image"
          mobileTitle={(p) => p.numeroCompteur}
        />
      )}
    </AppLayout>
  );
}
