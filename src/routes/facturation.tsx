import { createFileRoute } from "@tanstack/react-router";
import { Receipt, Search } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/socadel/AppLayout";
import { DataTable, Pager, type Column } from "@/components/socadel/DataTable";
import { EmptyState, ErrorState } from "@/components/socadel/EmptyState";
import { CardsSkeleton, TableSkeleton } from "@/components/socadel/LoadingSkeleton";
import { PageHeader } from "@/components/socadel/PageHeader";
import { TagBadge } from "@/components/socadel/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompteur, useFacturer, useFactures } from "@/hooks/useSocadelData";
import { formatDate, formatFcfa, formatNumber } from "@/lib/format";
import type { Facture } from "@/types";

export const Route = createFileRoute("/facturation")({
  head: () => ({
    meta: [
      { title: "Facturation — SOCADEL Vision" },
      {
        name: "description",
        content:
          "Recherchez un compteur, contrôlez la consommation calculée et générez la facture de l'abonné.",
      },
      { property: "og:title", content: "Facturation — SOCADEL Vision" },
      { property: "og:description", content: "Génération des factures d'électricité SOCADEL." },
    ],
  }),
  component: FacturationPage,
});

function FacturationPage() {
  const [saisie, setSaisie] = useState("");
  const [numero, setNumero] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { data: fiche, isLoading: loadingFiche, isError: ficheError, refetch } = useCompteur(numero);
  const { data: factures, isLoading: loadingFactures } = useFactures({ page });
  const facturer = useFacturer();

  const columns: Column<Facture>[] = [
    { key: "id", header: "N° facture", cell: (r) => <span className="tabular-nums">{r.id_facture}</span> },
    {
      key: "compteur",
      header: "Compteur",
      cell: (r) => <span className="font-medium text-foreground">{r.numeroCompteur}</span>,
    },
    {
      key: "montant",
      header: "Montant",
      cell: (r) => <span className="font-semibold tabular-nums">{formatFcfa(r.montant)}</span>,
    },
    {
      key: "type",
      header: "Type",
      cell: (r) =>
        r.type === "abonne" ? (
          <TagBadge label="Abonné" tone="info" />
        ) : (
          <TagBadge label="Spéciale" tone="warning" />
        ),
    },
    {
      key: "date",
      header: "Émission",
      hideOnMobile: true,
      cell: (r) => <span className="text-muted-foreground">{formatDate(r.dateEmission)}</span>,
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Étape 4"
        title="Facturation"
        description="Consultez la fiche d'un abonné à partir du numéro de compteur, puis générez sa facture."
      />

      <form
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setNumero(saisie.trim() || null);
        }}
      >
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="numero-compteur">Numéro de compteur</Label>
          <Input
            id="numero-compteur"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="CM4100000"
          />
        </div>
        <Button type="submit">
          <Search className="mr-2 size-4" aria-hidden />
          Rechercher
        </Button>
      </form>

      {numero ? (
        ficheError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : loadingFiche || !fiche ? (
          <CardsSkeleton count={2} />
        ) : (
          <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">{fiche.nomAbonne}</h2>
                <p className="text-sm text-muted-foreground">
                  Compteur {fiche.numeroCompteur} · {fiche.premise}
                </p>
              </div>
              <TagBadge
                label={fiche.type === "abonne" ? "Facturation abonné" : "Facturation spéciale"}
                tone={fiche.type === "abonne" ? "info" : "warning"}
              />
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl bg-muted/60 p-4">
                <dt className="text-xs text-muted-foreground">Dernier index facturé</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {formatNumber(fiche.dernierIndexFacture)}
                </dd>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <dt className="text-xs text-muted-foreground">Nouvel index extrait</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {fiche.nouvelIndexExtrait === null ? "—" : formatNumber(fiche.nouvelIndexExtrait)}
                </dd>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <dt className="text-xs text-muted-foreground">Consommation (kWh)</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {formatNumber(fiche.consommation)}
                </dd>
              </div>
              <div className="rounded-xl bg-accent p-4">
                <dt className="text-xs text-muted-foreground">Montant à facturer</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-primary">
                  {formatFcfa(fiche.montant)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => facturer.mutate(fiche.numeroCompteur)}
                disabled={facturer.isPending || fiche.nouvelIndexExtrait === null}
              >
                <Receipt className="mr-2 size-4" aria-hidden />
                Générer la facture
              </Button>
              {fiche.nouvelIndexExtrait === null ? (
                <p className="text-xs text-muted-foreground">
                  Aucun index extrait disponible : une facturation spéciale sera appliquée par le backend.
                </p>
              ) : null}
            </div>
          </section>
        )
      ) : null}

      <h2 className="mb-3 text-base font-semibold text-foreground">Factures récentes</h2>
      {loadingFactures || !factures ? (
        <TableSkeleton cols={5} />
      ) : factures.items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aucune facture générée"
          description="Recherchez un compteur puis générez sa facture."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={factures.items}
            getRowId={(r) => r.id_facture}
            caption="Historique des factures"
            mobileTitle={(r) => `Facture ${r.id_facture}`}
          />
          <Pager
            page={factures.page}
            total={factures.total}
            pageSize={factures.pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </AppLayout>
  );
}
