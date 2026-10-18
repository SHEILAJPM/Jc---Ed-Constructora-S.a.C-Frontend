import { kv } from "./almacen";
import { obtenerLlave } from "./llave";

const BASE = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");

export class ErrorApi extends Error {
  constructor(public estado: number, mensaje: string) {
    super(mensaje);
  }
}

/** Error de red (sin señal): el marcaje se guarda en la cola. */
export class SinConexion extends Error {}

interface Sesion {
  accessToken: string;
  refreshToken: string;
  dispositivoId: string;
  estadoDispositivo: string;
  debeCambiarPin: boolean;
}

let acceso: string | null = null;

export async function guardarSesion(s: Sesion) {
  acceso = s.accessToken;
  await kv.set("sesion", { refreshToken: s.refreshToken, dispositivoId: s.dispositivoId });
}

export async function datosSesion() {
  return kv.get<{ refreshToken: string; dispositivoId: string }>("sesion");
}

export async function cerrarSesionLocal() {
  acceso = null;
  await kv.del("sesion");
}

let renovando: Promise<Sesion | null> | null = null;

/** Renueva la sesión firmando "refreshToken.marcaTiempo" con la llave del celular. */
export function renovar(): Promise<Sesion | null> {
  renovando ??= (async () => {
    const s = await datosSesion();
    if (!s) return null;
    const llave = await obtenerLlave();
    const marcaTiempo = new Date().toISOString();
    const firma = await llave.firmar(`${s.refreshToken}.${marcaTiempo}`);
    const r = await fetch(`${BASE}/auth/campo/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: s.refreshToken, marcaTiempo, firma }),
    }).catch(() => {
      throw new SinConexion();
    });
    if (!r.ok) {
      if (r.status === 401) await cerrarSesionLocal();
      return null;
    }
    const nueva = (await r.json()) as Sesion;
    await guardarSesion(nueva);
    return nueva;
  })().finally(() => {
    renovando = null;
  });
  return renovando;
}

async function leerError(r: Response): Promise<string> {
  try {
    const d = (await r.json()) as { detail?: string; campos?: Record<string, string> };
    return d.campos ? Object.values(d.campos)[0] : d.detail ?? `Error ${r.status}`;
  } catch {
    return `Error ${r.status}`;
  }
}

export async function api<T>(ruta: string, opciones: RequestInit = {}, reintento = true): Promise<T> {
  if (!acceso && reintento) await renovar();
  const headers = new Headers(opciones.headers);
  if (acceso) headers.set("Authorization", `Bearer ${acceso}`);
  if (opciones.body && typeof opciones.body === "string") headers.set("Content-Type", "application/json");
  let r: Response;
  try {
    r = await fetch(`${BASE}${ruta}`, { ...opciones, headers });
  } catch {
    throw new SinConexion("Sin conexión");
  }
  if (r.status === 401 && reintento) {
    acceso = null;
    const s = await renovar();
    if (s) return api<T>(ruta, opciones, false);
  }
  if (!r.ok) throw new ErrorApi(r.status, await leerError(r));
  if (r.status === 204) return undefined as T;
  return (await r.json()) as T;
}

export async function login(documento: string, pin: string): Promise<Sesion> {
  const llave = await obtenerLlave();
  let r: Response;
  try {
    r = await fetch(`${BASE}/auth/campo/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documento, pin, dispositivo: { clavePublica: llave.spki, plataforma: llave.plataforma, modelo: llave.modelo } }),
    });
  } catch {
    throw new SinConexion("Necesitas conexión para ingresar la primera vez");
  }
  if (!r.ok) throw new ErrorApi(r.status, await leerError(r));
  const s = (await r.json()) as Sesion;
  await guardarSesion(s);
  return s;
}
