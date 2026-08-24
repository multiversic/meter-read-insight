export function formatFcfa(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(value))} FCFA`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export const STATUT_LABELS = {
  OK: "Exploitable (OK)",
  KO: "Non exploitable (KO)",
  EnAttenteValidation: "En attente de validation",
} as const;
