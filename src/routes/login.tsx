import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — SOCADEL Vision" },
      { name: "description", content: "Connectez-vous à l'espace Expert SOCADEL Vision." },
      { property: "og:title", content: "Connexion — SOCADEL Vision" },
      { property: "og:description", content: "Espace réservé aux experts SOCADEL." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && isAuthenticated) void navigate({ to: "/dashboard" });
  }, [isReady, isAuthenticated, navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Connexion réussie");
      void navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-energy p-10 text-primary-foreground lg:flex">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold">
          S
        </span>
        <div>
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            Le contrôle des compteurs, assisté par l'intelligence artificielle.
          </h2>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/85">
            Classification automatique des photos, extraction des index et facturation fiabilisée
            pour les abonnés de la SOCADEL.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/70">Société Camerounaise d'Électricité</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Espace Expert
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">SOCADEL Vision</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Connectez-vous pour accéder au contrôle des images.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="expert@socadel.cm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : (
                <LockKeyhole className="mr-2 size-4" aria-hidden />
              )}
              Se connecter
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Accès réservé au personnel habilité SOCADEL.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
