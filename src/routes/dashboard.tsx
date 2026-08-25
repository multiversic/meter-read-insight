import { createFileRoute } from "@tanstack/react-router";
import { Banknote, Clock, ImageIcon, TrendingUp } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/components/socadel/AppLayout";
import { CardsSkeleton, ChartSkeleton } from "@/components/socadel/LoadingSkeleton";
import { PageHeader } from "@/components/socadel/PageHeader";
import { ErrorState } from "@/components/socadel/EmptyState";
import { Label } from "@/components/ui/label";
import { useDashboardStats } from "@/hooks/useSocadelData";
import { STATUT_LABELS, formatFcfa, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — SOCADEL Vision" },
      {
        name: "description",
        content:
          "Indicateurs du jour : images traitées, taux d'exploitabilité, images en attente et montant facturé.",
      },
      { property: "og:title", content: "Tableau de bord — SOCADEL Vision" },
      { property: "og:description", content: "Vue d'ensemble du contrôle des compteurs SOCADEL." },
    ],
  }),
  component: DashboardPage,
});

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--warning))"];

function KpiCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function PeriodSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="periode" className="text-xs text-muted-foreground">
        Période
      </Label>
      <input
        id="periode"
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-xl border border-input bg-card px-3 text-sm"
      />
    </div>
  );
}

function DashboardPage() {
  const [periode, setPeriode] = useState("2026-08");
  const { data, isLoading, isError, refetch } = useDashboardStats(periode);

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Vue d'ensemble"
        title="Tableau de bord"
        description="Suivi quotidien du contrôle automatique des photos de compteurs et de la facturation."
        actions={<PeriodSelect value={periode} onChange={setPeriode} />}
      />

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading || !data ? (
        <>
          <CardsSkeleton count={4} />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Images traitées aujourd'hui"
              value={formatNumber(data.imagesTraiteesAujourdhui)}
              hint="Contrôle automatique effectué"
              icon={<ImageIcon className="size-4" aria-hidden />}
            />
            <KpiCard
              label="Taux d'images exploitables"
              value={`${data.tauxOK}%`}
              hint={`${data.tauxKO}% non exploitables`}
              icon={<TrendingUp className="size-4" aria-hidden />}
            />
            <KpiCard
              label="Images en attente"
              value={formatNumber(data.imagesEnAttente)}
              hint="Vérification manuelle requise"
              icon={<Clock className="size-4" aria-hidden />}
            />
            <KpiCard
              label="Montant facturé"
              value={formatFcfa(data.montantFacture)}
              hint={`Période ${periode}`}
              icon={<Banknote className="size-4" aria-hidden />}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="text-base font-semibold text-foreground">Répartition des statuts</h2>
              <p className="mb-2 text-xs text-muted-foreground">
                Classification automatique des images de la période.
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.repartitionStatuts.map((s) => ({
                        name: STATUT_LABELS[s.statut],
                        value: s.valeur,
                      }))}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {data.repartitionStatuts.map((s, i) => (
                        <Cell key={s.statut} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 flex flex-wrap gap-4">
                {data.repartitionStatuts.map((s, i) => (
                  <li key={s.statut} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      aria-hidden
                    />
                    {STATUT_LABELS[s.statut]} — {formatNumber(s.valeur)}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="text-base font-semibold text-foreground">
                Exploitabilité par agent releveur
              </h2>
              <p className="mb-2 text-xs text-muted-foreground">
                Part des photos exploitables sur la période.
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.exploitabiliteParAgent}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="agent" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis unit="%" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Bar dataKey="taux" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </>
      )}
    </AppLayout>
  );
}
