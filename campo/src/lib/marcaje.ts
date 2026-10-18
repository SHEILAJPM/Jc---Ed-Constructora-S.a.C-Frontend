import { cola, type Pendiente } from "./almacen";
import { api, datosSesion, ErrorApi, SinConexion } from "./api";
import { obtenerLlave, sha256Hex } from "./llave";
import { esNativo, Integridad, plataforma } from "./nativo";

export interface Resultado {
  id: string;
  resultado: "VALIDO" | "RECHAZADO" | "EN_REVISION";
  motivo: string | null;
  senales: string[];
  obra: string | null;
  horaMarcaje: string;
  duplicado: boolean;
}

export interface Ubicacion {
  lat: number;
  lng: number;
  precision: number;
  mock: boolean;
  root: boolean;
  emulador: boolean;
}

/**
 * GPS SOLO en este momento (Ley 29733): una única lectura al tocar MARCAR, sin rastreo continuo.
 * En Android se usa el plugin nativo, que además informa si la ubicación es falsa (mock).
 */
export async function leerUbicacion(): Promise<Ubicacion> {
  if (esNativo()) {
    const [u, e] = await Promise.all([Integridad.ubicacion(), Integridad.estado()]);
    return { ...u, ...e };
  }
  if (!("geolocation" in navigator)) throw new Error("Este celular no tiene GPS disponible");
  const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, (err) => {
      const m = err.code === err.PERMISSION_DENIED ? "Activa el permiso de ubicación para marcar"
        : err.code === err.TIMEOUT ? "El GPS tardó demasiado. Sal a cielo abierto e inténtalo de nuevo"
        : "No se pudo obtener tu ubicación";
      reject(new Error(m));
    }, { enableHighAccuracy: true, timeout: 25_000, maximumAge: 0 }),
  );
  return { lat: pos.coords.latitude, lng: pos.coords.longitude, precision: pos.coords.accuracy, mock: false, root: false, emulador: false };
}

/** Reduce la selfie (máx. 480 px, JPEG ~0,7): pocas decenas de KB, ideal para 3G. */
export async function comprimir(fuente: HTMLVideoElement | HTMLCanvasElement): Promise<Blob> {
  const ancho = fuente instanceof HTMLVideoElement ? fuente.videoWidth : fuente.width;
  const alto = fuente instanceof HTMLVideoElement ? fuente.videoHeight : fuente.height;
  const escala = Math.min(1, 480 / Math.max(ancho, alto));
  const c = document.createElement("canvas");
  c.width = Math.round(ancho * escala);
  c.height = Math.round(alto * escala);
  c.getContext("2d")!.drawImage(fuente, 0, 0, c.width, c.height);
  for (const calidad of [0.7, 0.55, 0.4]) {
    const b = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", calidad));
    if (b && b.size <= 300 * 1024) return b;
  }
  throw new Error("No se pudo preparar la foto");
}

async function firmarPayload(datos: Record<string, unknown>) {
  const payload = JSON.stringify(datos);
  const firma = await (await obtenerLlave()).firmar(payload);
  return { payload, firma };
}

async function enviar(payload: string, firma: string, selfie: Blob): Promise<Resultado> {
  const form = new FormData();
  form.append("payload", payload);
  form.append("firma", firma);
  form.append("selfie", selfie, "selfie.jpg");
  return api<Resultado>("/campo/marcajes", { method: "POST", body: form });
}

/**
 * Arma el marcaje firmado y lo envía. Si no hay señal, lo vuelve a firmar con offline=true
 * (misma hora e idempotencia) y lo guarda en la cola: se enviará solo al volver la conexión.
 */
export async function marcar(tipo: "ENTRADA" | "SALIDA", selfie: Blob, u: Ubicacion): Promise<{ resultado?: Resultado; enCola?: boolean }> {
  const sesion = await datosSesion();
  if (!sesion) throw new Error("Vuelve a ingresar");
  const base = {
    v: 1,
    idempotencia: crypto.randomUUID(),
    tipo,
    horaDispositivo: new Date().toISOString(),
    lat: u.lat,
    lng: u.lng,
    precision: Math.round(u.precision * 100) / 100,
    selfieSha256: await sha256Hex(selfie),
    banderas: { mock: u.mock, root: u.root, emulador: u.emulador, plataforma: plataforma() },
    dispositivoId: sesion.dispositivoId,
  };
  if (navigator.onLine) {
    const { payload, firma } = await firmarPayload({ ...base, offline: false });
    try {
      return { resultado: await enviar(payload, firma, selfie) };
    } catch (e) {
      if (!(e instanceof SinConexion)) throw e;
    }
  }
  const { payload, firma } = await firmarPayload({ ...base, offline: true });
  await cola.guardar({ idempotencia: base.idempotencia, payload, firma, selfie, tipo, hora: base.horaDispositivo, intentos: 0 });
  return { enCola: true };
}

let sincronizando = false;

/** Envía la cola. Reintenta en errores de red; descarta solo lo que el servidor rechazó por formato. */
export async function sincronizar(alResultado?: (p: Pendiente, r: Resultado) => void): Promise<number> {
  if (sincronizando || !navigator.onLine) return 0;
  sincronizando = true;
  let enviados = 0;
  try {
    for (const p of await cola.todos()) {
      try {
        const r = await enviar(p.payload, p.firma, p.selfie);
        await cola.quitar(p.idempotencia);
        enviados++;
        alResultado?.(p, r);
      } catch (e) {
        if (e instanceof SinConexion) break;
        if (e instanceof ErrorApi && e.estado >= 400 && e.estado < 500 && e.estado !== 401 && e.estado !== 429) {
          await cola.guardar({ ...p, intentos: p.intentos + 1, ultimoError: e.message });
          if (p.intentos + 1 >= 5) await cola.quitar(p.idempotencia);
        } else {
          await cola.guardar({ ...p, intentos: p.intentos + 1, ultimoError: e instanceof Error ? e.message : String(e) });
        }
      }
    }
  } finally {
    sincronizando = false;
  }
  return enviados;
}
