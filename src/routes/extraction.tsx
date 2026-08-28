import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, Play } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/socadel/AppLayout";
import { ConfidenceScore } from "@/components/socadel/ConfidenceScore";
import { DataTable, Pager, type Column } from "@/components/socadel/DataTable";
import { EmptyState, ErrorState } from "@/components/socadel/EmptyState";
import { TableSkeleton } from "@/components/socadel/LoadingSkeleton";
import { PageHeader } from "@/components/socadel/PageHeader";
import { TagBadge } from "@/components/socadel/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLancerExtraction, useResultatsExtraction } from "@/hooks/useSocadelData";
import { formatDate } from "@/lib/format";
import { extractionService } from "@/services/extraction.service";
import type { ResultatExtraction } from "@/types";

export const Route = createFileRoute("/extraction")({
  head: () => ({
    meta: [
      { title: "Extraction & résultats — SOCADEL Vision" },
      {
        name: "description",
        content:
          "Lancez l'extraction des index sur les images exploitables et exportez les résultats au format CSV.",
      },
      { property: "og:title", content: "Extraction & résultats — SOCADEL Vision" },
      { property: "og:description", content: "Index extraits des compteurs et export CSV." },
    ],
  }),
  component: ExtractionPage,
});

function ExtractionPage() {
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<number[]>([]);
  const { data, isLoading, isError, refetch } = useResultatsExtraction({ page });
  const lancer = useLancerExtraction();

  function toggle(id: number) {
    setSelection((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  const columns: Column<ResultatExtraction>[] = [
    {
      key: "select",
      header: "Sél.",
      hideOnMobile: true,
      cell: (r) => (
        <Checkbox
          checked={selection.includes(r.id_image)}
          onCheckedChange={() => toggle(r.id_image)}
          aria-label={`Sélectionner l'image ${r.id_image}`}
        />
      ),
    },
    { key: "id", header: "ID image", cell: (r) => <span className="tabular-nums">{r.id_image}</span> },
    {
      key: "compteur",
      header: "Compteur",
      cell: (r) => <span className="font-medium text-foreground">{r.numeroCompteur}</span>,
    },
    {
      key: "index",
      header: "Index extrait",
      cell: (r) => <span className="font-semibold tabular-nums">{r.indexExtrait}</span>,
    },
    { key: "score", header: "Score", cell: (r) => <ConfidenceScore score={r.scoreExtraction} /> },
    {
      key: "statut",
      header: "Statut",
      cell: (r) =>
        r.statut === "Enregistre" ? (
          <TagBadge label="Enregistré" tone="success" />
        ) : (
          <TagBadge label="À vérifier" tone="warning" />
        ),
    },
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (r) => <span className="text-muted-foreground">{formatDate(r.dateCreation)}</span>,
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Étape 3"
        title="Extraction & résultats"
        description="Le moteur d'extraction lit l'index affiché sur les compteurs des images exploitables."
        actions={
          <>
            <Button
              onClick={() => lancer.mutate(selection, { onSuccess: () => setSelection([]) })}
              disabled={selection.length === 0 || lancer.isPending}
            >
              <Play className="mr-2 size-4" aria-hidden />
              Lancer l'extraction ({selection.length})
            </Button>
            <Button variant="outline" asChild>
              <a href={extractionService.exportCsvUrl()} download>
                <Download className="mr-2 size-4" aria-hidden />
                Exporter en CSV
              </a>
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="space-y-1.5">
          <Label htmlFor="f-statut-extraction">Statut d'enregistrement</Label>
          <select
            id="f-statut-extraction"
            className="h-9 rounded-xl border border-input bg-card px-3 text-sm"
            value={statut}
            onChange={(e) => {
              setStatut(e.target.value);
              setPage(1);
            }}
          >
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {s === "TOUS" ? "Tous" : s === "Enregistre" ? "Enregistré" : "À vérifier"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading || !data ? (
        <TableSkeleton cols={7} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="Aucun résultat d'extraction"
          description="Lancez l'extraction sur des images exploitables pour obtenir les index."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data.items}
            getRowId={(r) => r.id_image}
            caption="Résultats d'extraction des index"
            mobileTitle={(r) => r.numeroCompteur}
          />
          <Pager page={data.page} total={data.total} pageSize={data.pageSize} onPageChange={setPage} />
        </>
      )}
    </AppLayout>
  );
}
