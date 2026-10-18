import { kv } from "./almacen";
import { esNativo, Integridad, plataforma } from "./nativo";

/**
 * Llave del dispositivo (ECDSA P-256). La privada NUNCA sale del teléfono:
 * - App Android: Android Keystore (hardware cuando existe).
 * - PWA: WebCrypto con extractable=false, guardada en IndexedDB.
 * Con ella se firman los marcajes y la renovación de sesión.
 */
export interface Llave {
  spki: string;
  modelo: string;
  plataforma: "ANDROID" | "IOS" | "WEB";
  firmar: (mensaje: string) => Promise<string>;
}

const b64 = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b)));

let cache: Promise<Llave> | null = null;

export function obtenerLlave(): Promise<Llave> {
  cache ??= esNativo() ? llaveNativa() : llaveWeb();
  return cache;
}

async function llaveNativa(): Promise<Llave> {
  const { spki, modelo } = await Integridad.clavePublica();
  return { spki, modelo, plataforma: plataforma(), firmar: async (mensaje) => (await Integridad.firmar({ mensaje })).firma };
}

async function llaveWeb(): Promise<Llave> {
  let par = await kv.get<CryptoKeyPair>("llave");
  if (!par) {
    par = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, ["sign", "verify"]);
    await kv.set("llave", par);
  }
  const spki = b64(await crypto.subtle.exportKey("spki", par.publicKey));
  const modelo = (navigator.userAgent.match(/\(([^)]+)\)/)?.[1] ?? "Navegador").slice(0, 100);
  const privada = par.privateKey;
  return {
    spki,
    modelo,
    plataforma: "WEB",
    firmar: async (mensaje) =>
      b64(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privada, new TextEncoder().encode(mensaje))),
  };
}

export async function sha256Hex(datos: Blob | ArrayBuffer): Promise<string> {
  const buf = datos instanceof Blob ? await datos.arrayBuffer() : datos;
  const h = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
