import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
      <h3 className="text-base font-semibold text-destructive">Chargement impossible</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {message ?? "Le service SOCADEL n'a pas répondu. Vérifiez votre connexion puis réessayez."}
      </p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center justify-center rounded-xl border border-input bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Réessayer
        </button>
      ) : null}
    </div>
  );
}
