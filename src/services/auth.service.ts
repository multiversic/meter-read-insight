import { apiRequest } from "@/lib/api-client";
import type { LoginResponse } from "@/types";

export const authService = {
  login(email: string, password: string) {
    return apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      fallback: () => ({
        token: "mock-token",
        expert: { id: 1, nom: email.split("@")[0] || "Expert SOCADEL" },
      }),
    });
  },
  logout() {
    return apiRequest<void>("/api/auth/logout", {
      method: "POST",
      fallback: () => undefined as void,
    });
  },
};
