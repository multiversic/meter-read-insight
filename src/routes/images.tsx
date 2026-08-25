import { createFileRoute } from "@tanstack/react-router";
import { Images as ImagesIcon, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { AppLayout } from "@/components/socadel/AppLayout";
import { ConfidenceScore } from "@/components/socadel/ConfidenceScore";
import { DataTable, Pager, type Column } from "@/components/socadel/DataTable";
import { EmptyState, ErrorState } from "@/components/socadel/EmptyState";
import { TableSkeleton } from "@/components/socadel/LoadingSkeleton";
import { PageHeader } from "@/components/socadel/PageHeader";
import { StatusBadge, TagBadge } from "@/components/socadel/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAgents, useImages, useUploadImages } from "@/hooks/useSocadelData";
import { formatDate } from "@/lib/format";
import type { Image, ImagesFilters, StatutImage } from "@/types";

export const Route = createFileRoute("/images")({
  head: () => ({
    meta: [
      { title: "Contrôle des images — SOCADEL Vision" },
      {
        name: "description",
        content:
          "Importez les photos de compteurs et consultez le résultat du contrôle automatique par statut, agent et date.",
      },
      { property: "og:title", content: "Contrôle des images — SOCADEL Vision" },
      { property: "og:description", content: "Import et contrôle automatique des photos de compteurs." },
    ],
  }),
  component: ImagesPage,
});

const STATUTS: (StatutImage | "TOUS")[] = ["TOUS", "OK", "KO", "EnAttenteValidation"];

function ImagesPage() {
  const [filters, setFilters] = useState<ImagesFilters>({ statut: "TOUS", agentId: "TOUS", page: 1 });
  const [selected, setSelected] = useState<Image | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, isError, refetch } = useImages(filters);
  const { data: agents } = useAgents();
  const upload = useUploadImages();

  const columns: Column<Image>[] = [
    { key: "id", header: "ID", cell: (r) => <span className="tabular-nums">{r.id_image}</span> },
    {
      key: "compteur",
      header: "Compteur",
      cell: (r) => (
        <div>
          <p className="font-medium text-foreground">{r.numeroCompteur}</p>
          <p className="text-xs text-muted-foreground">{r.premise}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Prise de vue",
      cell: (r) => (
        <span className="text-muted-foreground">
          {formatDate(r.dateCreation)} · {r.heureCreation}
        </span>
      ),
    },
    { key: "statut", header: "Statut", cell: (r) => <StatusBadge statut={r.statut} /> },
    {
      key: "score",
      header: "Confiance",
      cell: (r) => <ConfidenceScore score={r.probabiliteClassification} />,
    },
    {
      key: "codes",
      header: "Anomalies",
      hideOnMobile: true,
      cell: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {r.codeAnomalie ? <TagBadge label={r.codeAnomalie} tone="warning" /> : null}
          {r.codeAnomaliePhoto ? <TagBadge label={r.codeAnomaliePhoto} tone="neutral" /> : null}
          {!r.codeAnomalie && !r.codeAnomaliePhoto ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Étape 1"
        title="Contrôle des images"
        description="Importez les photos issues des tournées de relève : le moteur de classification indique si chaque image est exploitable."
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              aria-label="Sélectionner des photos de compteurs"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) upload.mutate(files);
                e.target.value = "";
              }}
            />
            <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
              {upload.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : (
                <Upload className="mr-2 size-4" aria-hidden />
              )}
              Importer des images
            </Button>
          </>
        }
      />

      <div className="mb-5 grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="f-statut">Statut</Label>
          <select
            id="f-statut"
            className="h-9 w-full rounded-xl border border-input bg-card px-3 text-sm"
            value={filters.statut}
            onChange={(e) =>
              setFilters((f) => ({ ...f, statut: e.target.value as StatutImage | "TOUS", page: 1 }))
            }
          >
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {s === "TOUS" ? "Tous les statuts" : s === "EnAttenteValidation" ? "En attente" : s}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-agent">Agent releveur</Label>
          <select
            id="f-agent"
            className="h-9 w-full rounded-xl border border-input bg-card px-3 text-sm"
            value={String(filters.agentId)}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                agentId: e.target.value === "TOUS" ? "TOUS" : Number(e.target.value),
                page: 1,
              }))
            }
          >
            <option value="TOUS">Tous les agents</option>
            {agents?.map((a) => (
              <option key={a.id_agent} value={a.id_agent}>
                {a.nom}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-debut">Date de début</Label>
          <input
            id="f-debut"
            type="date"
            className="h-9 w-full rounded-xl border border-input bg-card px-3 text-sm"
            value={filters.dateDebut ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, dateDebut: e.target.value, page: 1 }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-fin">Date de fin</Label>
          <input
            id="f-fin"
            type="date"
            className="h-9 w-full rounded-xl border border-input bg-card px-3 text-sm"
            value={filters.dateFin ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, dateFin: e.target.value, page: 1 }))}
          />
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading || !data ? (
        <TableSkeleton cols={6} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={ImagesIcon}
          title="Aucune image pour ces critères"
          description="Modifiez les filtres ou importez de nouvelles photos de compteurs."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data.items}
            getRowId={(r) => r.id_image}
            onRowClick={setSelected}
            caption="Liste des images contrôlées"
            mobileTitle={(r) => r.numeroCompteur}
          />
          <Pager
            page={data.page}
            total={data.total}
            pageSize={data.pageSize}
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        </>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Image {selected?.id_image}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              <img
                src={selected.cheminFichier}
                alt={`Photo du compteur ${selected.numeroCompteur}`}
                className="aspect-video w-full rounded-xl object-cover"
                loading="lazy"
              />
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Compteur</dt>
                  <dd className="font-medium">{selected.numeroCompteur}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Premise</dt>
                  <dd>{selected.premise}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Prise de vue</dt>
                  <dd>
                    {formatDate(selected.dateCreation)} · {selected.heureCreation}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Statut</dt>
                  <dd>
                    <StatusBadge statut={selected.statut} />
                  </dd>
                </div>
              </dl>
              <ConfidenceScore
                score={selected.probabiliteClassification}
                label="Probabilité de classification"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
