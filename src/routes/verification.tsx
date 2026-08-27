import { createFileRoute } from "@tanstack/react-router";
import { CheckCheck, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/socadel/AppLayout";
import { ConfidenceScore } from "@/components/socadel/ConfidenceScore";
import { EmptyState, ErrorState } from "@/components/socadel/EmptyState";
import { CardsSkeleton } from "@/components/socadel/LoadingSkeleton";
import { PageHeader } from "@/components/socadel/PageHeader";
import { TagBadge } from "@/components/socadel/StatusBadge";
import { Button } from "@/components/ui/button";
import { useImagesEnAttente, useValiderImage } from "@/hooks/useSocadelData";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "Vérification manuelle — SOCADEL Vision" },
      {
        name: "description",
        content:
          "Validez ou invalidez les photos de compteurs dont la classification automatique est incertaine.",
      },
      { property: "og:title", content: "Vérification manuelle — SOCADEL Vision" },
      { property: "og:description", content: "Arbitrage expert des images en attente de validation." },
    ],
  }),
  component: VerificationPage,
});

function VerificationPage() {
  const { data, isLoading, isError, refetch } = useImagesEnAttente();
  const valider = useValiderImage();
  const [index, setIndex] = useState(0);

  const images = data ?? [];
  const current = images[Math.min(index, Math.max(0, images.length - 1))];

  function decide(decision: "valide" | "invalide") {
    if (!current) return;
    valider.mutate(
      { id: current.id_image, decision },
      { onSuccess: () => setIndex((i) => i + 1) },
    );
  }

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Étape 2"
        title="Vérification manuelle"
        description="Les images dont le score de confiance est intermédiaire nécessitent l'arbitrage d'un expert."
        actions={
          images.length > 0 ? (
            <TagBadge label={`${images.length} image(s) en attente`} tone="warning" />
          ) : undefined
        }
      />

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading ? (
        <CardsSkeleton count={2} />
      ) : !current ? (
        <EmptyState
          icon={CheckCheck}
          title="Aucune image en attente"
          description="Toutes les photos de compteurs ont été classées ou arbitrées. Revenez après la prochaine tournée de relève."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <img
              src={current.cheminFichier}
              alt={`Photo du compteur ${current.numeroCompteur} à ${current.premise}`}
              className="aspect-video w-full object-cover"
              loading="lazy"
            />
            <figcaption className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
              Compteur <span className="font-medium text-foreground">{current.numeroCompteur}</span> ·{" "}
              {current.premise} · {formatDate(current.dateCreation)} à {current.heureCreation}
            </figcaption>
          </figure>

          <aside className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div>
              <h2 className="text-base font-semibold text-foreground">Analyse automatique</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Résultat du modèle de classification pour cette image.
              </p>
            </div>
            <ConfidenceScore
              score={current.probabiliteClassification}
              label="Probabilité d'exploitabilité"
            />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Code activité</dt>
                <dd>{current.codeActivite ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Code anomalie</dt>
                <dd>{current.codeAnomalie ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Anomalie photo</dt>
                <dd>{current.codeAnomaliePhoto ?? "—"}</dd>
              </div>
            </dl>

            <div className="space-y-2 border-t border-border pt-4">
              <Button className="w-full" onClick={() => decide("valide")} disabled={valider.isPending}>
                <ThumbsUp className="mr-2 size-4" aria-hidden />
                Image exploitable
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => decide("invalide")}
                disabled={valider.isPending}
              >
                <ThumbsDown className="mr-2 size-4" aria-hidden />
                Image non exploitable
              </Button>
              <p className="pt-1 text-center text-xs text-muted-foreground">
                Image {Math.min(index + 1, images.length)} sur {images.length}
              </p>
            </div>
          </aside>
        </div>
      )}
    </AppLayout>
  );
}
