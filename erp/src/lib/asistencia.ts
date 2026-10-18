import type { ResultadoMarcaje } from "./tipos";

/** Señales del servidor en lenguaje del usuario (nunca se muestran los códigos). */
const SENALES: Record<string, { texto: string; grave: boolean }> = {
  FIRMA_INVALIDA: { texto: "La firma del celular no es válida", grave: true },
  DISPOSITIVO_PENDIENTE: { texto: "Celular nuevo pendiente de aprobación", grave: true },
  DISPOSITIVO_NO_VINCULADO: { texto: "Celular no vinculado al trabajador", grave: true },
  SIN_ASIGNACION: { texto: "Sin asignación vigente a la obra", grave: true },
  FUERA_DE_GEOCERCA: { texto: "Fuera de la zona de la obra", grave: true },
  GPS_FALSO: { texto: "Se detectó una app de GPS falso", grave: true },
  HORA_FUTURA: { texto: "La hora del celular está adelantada", grave: true },
  SELFIE_NO_COINCIDE: { texto: "La selfie no coincide", grave: true },
  ROOT: { texto: "Celular modificado (root)", grave: false },
  EMULADOR: { texto: "Parece un emulador, no un celular real", grave: false },
  INTEGRIDAD_FALLIDA: { texto: "Falló la verificación de integridad", grave: false },
  PRECISION_BAJA: { texto: "GPS poco preciso", grave: false },
  PRECISION_SOSPECHOSA: { texto: "Precisión del GPS sospechosamente perfecta", grave: false },
  VELOCIDAD_IMPOSIBLE: { texto: "Distancia imposible desde el marcaje anterior", grave: false },
  HORA_DESFASADA: { texto: "Hora del celular desfasada", grave: false },
  SINCRONIZACION_TARDIA: { texto: "Llegó muy tarde (marcado sin conexión)", grave: false },
  SIN_VERIFICACION_NATIVA: { texto: "Marcado desde el navegador (sin app nativa)", grave: false },
};

const DOCS: Record<string, string> = {
  SCTR: "SCTR", EMO: "examen médico (EMO)", INDUCCION: "inducción", DNI: "DNI", CONTRATO: "contrato", LICENCIA: "licencia", OTRO: "documento",
};

export function textoSenal(codigo: string): string {
  if (SENALES[codigo]) return SENALES[codigo].texto;
  const [base, extra] = codigo.split(":");
  if (base === "DOCUMENTO_FALTANTE") return `Falta ${DOCS[extra] ?? extra}`;
  if (base === "DOCUMENTO_VENCIDO") return `${DOCS[extra] ?? extra} vencido`.replace(/^./, (c) => c.toUpperCase());
  if (base === "GEOCERCA") return `Dentro de la zona: ${extra}`;
  if (base === "COMISION") return "Marcado en comisión autorizada";
  return "Otra observación";
}

export const esGrave = (codigo: string) => SENALES[codigo]?.grave ?? codigo.startsWith("DOCUMENTO_");

export const RESULTADO: Record<ResultadoMarcaje, { label: string; color: "verde" | "rojo" | "ambar" }> = {
  VALIDO: { label: "Válido", color: "verde" },
  RECHAZADO: { label: "Rechazado", color: "rojo" },
  EN_REVISION: { label: "En revisión", color: "ambar" },
};

export const ESTADO_DISPOSITIVO: Record<string, string> = {
  ACTIVO: "Activo", PENDIENTE: "Pendiente de aprobación", RECHAZADO: "Rechazado", REVOCADO: "Desvinculado", REEMPLAZADO: "Reemplazado",
};

/** Zona donde marcó: OBRA / COMISION / nombre de geocerca. */
export const textoZona = (z: string | null) =>
  !z ? null : z === "OBRA" ? "Dentro de la obra" : z.startsWith("COMISION") ? "Destino de comisión" : z.startsWith("GEOCERCA:") ? z.slice(9) : "Otra zona";

/** "WEB · Windows…" → "Navegador · Windows…". */
export const textoCelular = (d: string | null) =>
  d?.replace(/^WEB/, "Navegador").replace(/^ANDROID/, "App Android").replace(/^IOS/, "App iPhone") ?? null;

export const hoyLima = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });

export const fecha = (iso: string | null | undefined) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("es-PE", { dateStyle: "medium" }) : "—";

export const hora = (iso: string) => new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" });
