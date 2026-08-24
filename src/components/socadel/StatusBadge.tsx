import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatutImage } from "@/types";

const CONFIG: Record<StatutImage, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  OK: {
    label: "OK",
    className: "bg-primary/10 text-primary border-primary/20",
    Icon: CheckCircle2,
  },
  KO: {
    label: "KO",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    Icon: XCircle,
  },
  EnAttenteValidation: {
    label: "En attente",
    className: "bg-warning/15 text-warning-foreground border-warning/30",
    Icon: Clock,
  },
};

export function StatusBadge({ statut, className }: { statut: StatutImage; className?: string }) {
  const { label, className: variant, Icon } = CONFIG[statut];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

export function TagBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "info";
}) {
  const tones = {
    neutral: "bg-muted text-muted-foreground border-border",
    success: "bg-primary/10 text-primary border-primary/20",
    warning: "bg-warning/15 text-warning-foreground border-warning/30",
    info: "bg-secondary/10 text-secondary border-secondary/20",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {label}
    </span>
  );
}
