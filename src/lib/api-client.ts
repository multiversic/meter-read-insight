const BASE_URL = (import.meta.env['VITE_API_BASE_URL'] as string | undefined) ?? "";

export const TOKEN_KEY = "socadel.token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Appelle l'API REST. Si aucune base URL n'est configurée (ou si l'appel échoue
 * parce que le backend n'est pas encore branché), on retombe sur les données
 * mockées fournies par `fallback` afin que l'interface reste utilisable.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit & { fallback?: () => T | Promise<T> } = {},
): Promise<T> {
  const { fallback, headers, ...init } = options;

  if (!BASE_URL) {
    if (fallback) return await fallback();
    throw new ApiError("VITE_API_BASE_URL n'est pas configurée", 0);
  }

  try {
    const token = getToken();
    const isFormData = init.body instanceof FormData;
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(`Erreur ${response.status} sur ${path}`, response.status);
    }

    if (response.status === 204) return undefined as T;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return (await response.text()) as T;
    return (await response.json()) as T;
  } catch (error) {
    if (fallback) return await fallback();
    if (error instanceof ApiError) throw error;
    throw new ApiError("Impossible de joindre le serveur SOCADEL", 0);
  }
}

export function buildQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "TOUS") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function apiUrl(path: string) {
  return `${BASE_URL}${path}`;
}
