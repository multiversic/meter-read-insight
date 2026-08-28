import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  CheckCheck,
  FileSpreadsheet,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useImagesEnAttente } from "@/hooks/useSocadelData";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/images", label: "Contrôle des images", icon: Images },
  { to: "/verification", label: "Vérification manuelle", icon: CheckCheck },
  { to: "/agents", label: "Évaluation des agents", icon: Users },
  { to: "/extraction", label: "Extraction & résultats", icon: FileSpreadsheet },
  { to: "/facturation", label: "Facturation", icon: Receipt },
] as const;

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-3 px-2 py-1">
      {/* Emplacement réservé au logo SOCADEL */}
      <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-energy text-sm font-bold text-primary-foreground">
        S
      </span>
      <span className="leading-tight">
        <span className="block text-base font-bold tracking-tight text-foreground">SOCADEL</span>
        <span className="block text-[11px] font-medium uppercase tracking-wider text-secondary">Vision</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="mt-6 space-y-1" aria-label="Navigation principale">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className={cn("size-[18px]", active ? "text-primary" : "text-secondary")} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { expert, isAuthenticated, isReady, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: enAttente } = useImagesEnAttente();

  useEffect(() => {
    if (isReady && !isAuthenticated) void navigate({ to: "/login" });
  }, [isReady, isAuthenticated, navigate]);

  if (!isReady || !isAuthenticated) {
    return <div className="min-h-screen bg-background" aria-busy="true" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <Brand />
        <NavLinks />
        <p className="mt-auto px-2 text-[11px] leading-relaxed text-muted-foreground">
          Contrôle des compteurs & facturation assistés par IA
        </p>
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/20"
            aria-label="Fermer le menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative h-full w-72 border-r border-sidebar-border bg-sidebar px-4 py-5">
            <div className="flex items-center justify-between">
              <Brand />
              <Button variant="ghost" size="icon" aria-label="Fermer" onClick={() => setMenuOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <NavLinks onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/85 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Ouvrir le menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <div className="lg:hidden">
              <Brand />
            </div>
            <span className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
              <BarChart3 className="size-4 text-secondary" aria-hidden />
              Espace Expert SOCADEL
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/verification"
              className="relative inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted"
              aria-label={`Notifications : ${enAttente?.length ?? 0} image(s) en attente de validation`}
            >
              <Bell className="size-5" aria-hidden />
              {enAttente && enAttente.length > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-bold text-warning-foreground">
                  {enAttente.length}
                </span>
              ) : null}
            </Link>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{expert?.nom}</p>
              <p className="text-xs text-muted-foreground">Expert SOCADEL</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                void navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-1.5 size-4" aria-hidden />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
