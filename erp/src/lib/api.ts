import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * Cliente del API. El access token vive SOLO en memoria (no en localStorage, a salvo de XSS
 * persistente). El refresh token está en una cookie HttpOnly que JavaScript no puede leer.
 */
export const api = axios.create({ baseURL: "/api", timeout: 30_000 });

let accessToken: string | null = null;
let alExpirarSesion: (() => void) | null = null;

export function fijarToken(token: string | null) {
  accessToken = token;
}

export function alPerderSesion(fn: () => void) {
  alExpirarSesion = fn;
}

api.interceptors.request.use((cfg) => {
  if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
  return cfg;
});

let renovando: Promise<string | null> | null = null;

/** Pide un access token nuevo con la cookie de refresh. Una sola petición aunque haya varias en paralelo. */
export function renovar(): Promise<string | null> {
  renovando ??= axios
    .post<{ accessToken: string }>("/api/auth/refresh", null, { headers: { "X-ERP-Cliente": "web" }, withCredentials: true })
    .then((r) => {
      fijarToken(r.data.accessToken);
      return r.data.accessToken;
    })
    .catch(() => {
      fijarToken(null);
      return null;
    })
    .finally(() => {
      renovando = null;
    });
  return renovando;
}

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _reintento?: boolean }) | undefined;
  const esAuth = original?.url?.startsWith("/auth/");
  if (error.response?.status === 401 && original && !original._reintento && !esAuth) {
    original._reintento = true;
    const nuevo = await renovar();
    if (nuevo) return api(original);
    alExpirarSesion?.();
  }
  return Promise.reject(error);
});

export function mensajeDeError(e: unknown): string {
  if (e instanceof AxiosError) {
    const d = e.response?.data as { detail?: string; campos?: Record<string, string> } | undefined;
    if (d?.campos && Object.keys(d.campos).length) return Object.values(d.campos)[0];
    if (d?.detail) return d.detail;
    if (e.response?.status === 403) return "No tienes permiso para esta acción.";
    if (!e.response) return "No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.";
  }
  return "Ocurrió un error inesperado.";
}
