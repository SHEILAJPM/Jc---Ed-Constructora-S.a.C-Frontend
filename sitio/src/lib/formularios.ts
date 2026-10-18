import { z } from "zod";

export const DEPARTAMENTOS = [
  "Lima", "Callao", "Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Cusco", "Huancavelica",
  "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque", "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura",
  "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali",
].map((d) => ({ valor: d, label: d }));

export const SECTORES_INMUEBLE = [
  { valor: "Vivienda", label: "Vivienda" },
  { valor: "Oficinas / comercial", label: "Oficinas / comercial" },
  { valor: "Salud", label: "Salud" },
  { valor: "Educación", label: "Educación" },
  { valor: "Saneamiento", label: "Saneamiento" },
  { valor: "Sector público", label: "Sector público" },
  { valor: "Otro", label: "Otro" },
];

export const PLAZOS = ["Lo antes posible", "1 a 3 meses", "3 a 6 meses", "Más de 6 meses", "Aún no lo sé"].map((v) => ({ valor: v, label: v }));

export const PRESUPUESTOS = [
  "Menos de S/ 50,000", "S/ 50,000 – 150,000", "S/ 150,000 – 500,000", "S/ 500,000 – 1,500,000", "Más de S/ 1,500,000", "Prefiero no indicarlo",
].map((v) => ({ valor: v, label: v }));

export const telefono = z
  .string()
  .trim()
  .min(1, "Ingresa tu teléfono")
  .regex(/^[+0-9 ()-]{6,20}$/, "Usa solo números, espacios o +");

export const correoOpcional = z.union([z.literal(""), z.email("Correo no válido")]).optional();

export const nombre = z.string().trim().min(2, "Ingresa tu nombre").max(120);

export const aceptaPrivacidad = z.literal(true, { error: "Debes aceptar la política de privacidad" });

export const MB = 1024 * 1024;

export function validarArchivos(archivos: File[], opciones: { max: number; maxBytes: number; tipos: string[] }): string | null {
  if (archivos.length > opciones.max) return `Máximo ${opciones.max} archivos`;
  for (const f of archivos) {
    if (f.size > opciones.maxBytes) return `"${f.name}" supera ${opciones.maxBytes / MB} MB`;
    if (!opciones.tipos.includes(f.type)) return `"${f.name}" no es un formato permitido`;
  }
  return null;
}
