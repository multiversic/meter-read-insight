import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { agentsService } from "@/services/agents.service";
import { dashboardService } from "@/services/dashboard.service";
import { extractionService } from "@/services/extraction.service";
import { facturationService } from "@/services/facturation.service";
import { imagesService } from "@/services/images.service";
import { predictionsService } from "@/services/predictions.service";
import type { ImagesFilters } from "@/types";

function onError(error: unknown) {
  toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
}

export function useDashboardStats(periode?: string) {
  return useQuery({
    queryKey: ["dashboard", periode],
    queryFn: () => dashboardService.stats(periode),
  });
}

export function useImages(filters: ImagesFilters) {
  return useQuery({
    queryKey: ["images", filters],
    queryFn: () => imagesService.list(filters),
  });
}

export function useImagesEnAttente() {
  return useQuery({
    queryKey: ["images", "en-attente"],
    queryFn: () => imagesService.enAttenteValidation(),
  });
}

export function useUploadImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => imagesService.upload(files),
    onSuccess: (res) => {
      toast.success(`${res.uploaded} image(s) envoyée(s) au contrôle automatique`);
      void qc.invalidateQueries({ queryKey: ["images"] });
    },
    onError,
  });
}

export function useValiderImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: "valide" | "invalide" }) =>
      imagesService.valider(id, decision),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.decision === "valide" ? "Image validée (exploitable)" : "Image invalidée (non exploitable)",
      );
      void qc.invalidateQueries({ queryKey: ["images"] });
    },
    onError,
  });
}

export function useAgents() {
  return useQuery({ queryKey: ["agents"], queryFn: () => agentsService.list() });
}

export function useRapportsAgents(periode?: string) {
  return useQuery({
    queryKey: ["rapports-agents", periode],
    queryFn: () => agentsService.rapports(periode),
  });
}

export function useRapportAgent(id: number | null, periode?: string) {
  return useQuery({
    queryKey: ["rapport-agent", id, periode],
    queryFn: () => agentsService.rapport(id as number, periode),
    enabled: id !== null,
  });
}

export function useResultatsExtraction(params: { statut?: string; page?: number }) {
  return useQuery({
    queryKey: ["extraction", params],
    queryFn: () => extractionService.resultats(params),
  });
}

export function useLancerExtraction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      if (ids.length === 1) {
        await extractionService.lancer(ids[0]!);
        return { lances: 1 };
      }
      return extractionService.lancerLot(ids);
    },
    onSuccess: () => {
      toast.success("Extraction lancée");
      void qc.invalidateQueries({ queryKey: ["extraction"] });
    },
    onError,
  });
}

export function usePredictions(periode?: string) {
  return useQuery({
    queryKey: ["predictions", periode],
    queryFn: () => predictionsService.list(periode),
  });
}

export function useCompteur(numero: string | null) {
  return useQuery({
    queryKey: ["compteur", numero],
    queryFn: () => facturationService.compteur(numero as string),
    enabled: Boolean(numero),
  });
}

export function useFactures(params: { page?: number; numeroCompteur?: string }) {
  return useQuery({
    queryKey: ["factures", params],
    queryFn: () => facturationService.factures(params),
  });
}

export function useFacturer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (numero: string) => facturationService.facturer(numero),
    onSuccess: () => {
      toast.success("Facture générée avec succès");
      void qc.invalidateQueries({ queryKey: ["factures"] });
    },
    onError,
  });
}
