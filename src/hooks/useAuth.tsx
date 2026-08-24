import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { TOKEN_KEY } from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import type { Expert } from "@/types";

const EXPERT_KEY = "socadel.expert";

interface AuthContextValue {
  expert: Expert | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [expert, setExpert] = useState<Expert | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(EXPERT_KEY);
    if (raw) {
      try {
        setExpert(JSON.parse(raw) as Expert);
      } catch {
        window.localStorage.removeItem(EXPERT_KEY);
      }
    }
    setIsReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    window.localStorage.setItem(TOKEN_KEY, result.token);
    window.localStorage.setItem(EXPERT_KEY, JSON.stringify(result.expert));
    setExpert(result.expert);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(EXPERT_KEY);
      setExpert(null);
    }
  }, []);

  const value = useMemo(
    () => ({ expert, isAuthenticated: Boolean(expert), isReady, login, logout }),
    [expert, isReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}
