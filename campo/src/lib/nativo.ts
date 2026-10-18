import { Capacitor, registerPlugin } from "@capacitor/core";

/**
 * Plugin nativo propio (android/app/src/main/java/pe/jced/campo/IntegridadPlugin.java):
 * llave en Android Keystore, ubicación con detección de GPS falso y señales de root/emulador.
 */
export interface IntegridadPlugin {
  clavePublica(): Promise<{ spki: string; modelo: string }>;
  firmar(opts: { mensaje: string }): Promise<{ firma: string }>;
  ubicacion(): Promise<{ lat: number; lng: number; precision: number; mock: boolean }>;
  estado(): Promise<{ root: boolean; emulador: boolean }>;
}

export const Integridad = registerPlugin<IntegridadPlugin>("Integridad");

export const esNativo = () => Capacitor.isNativePlatform();

export const plataforma = (): "ANDROID" | "IOS" | "WEB" => {
  const p = Capacitor.getPlatform();
  return p === "android" ? "ANDROID" : p === "ios" ? "IOS" : "WEB";
};
