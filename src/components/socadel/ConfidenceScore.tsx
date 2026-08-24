import { cn } from "@/lib/utils";

function tone(score: number) {
  if (score > 96) return "text-primary";
  if (score < 42) return "text-destructive";
  return "text-warning-foreground";
}

function barTone(score: number) {
  if (score > 96) return "bg-primary";
  if (score < 42) return "bg-destructive";
  return "bg-warning";
}

export function ConfidenceScore({
  score,
  label,
  showBar = true,
  className,
}: {
  score: number;
  label?: string;
  showBar?: boolean;
  className?: string;
}) {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div className={cn("min-w-24", className)}>
      <div className="flex items-baseline justify-between gap-2">
        {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
        <span className={cn("text-sm font-semibold tabular-nums", tone(value))}>{value}%</span>
      </div>
      {showBar ? (
        <div
          className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="meter"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label ?? "Score de confiance"}
        >
          <div className={cn("h-full rounded-full transition-all", barTone(value))} style={{ width: `${value}%` }} />
        </div>
      ) : null}
    </div>
  );
}
