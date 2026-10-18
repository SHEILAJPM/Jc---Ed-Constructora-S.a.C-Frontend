import axios, { AxiosError } from "axios";
import type { Categoria } from "./empresa";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 20_000,
});

/** Mensaje legible de un error del API (ProblemDetail en español) o de red. */
export function mensajeDeError(e: unknown): string {
  if (e instanceof AxiosError) {
    const detalle = (e.response?.data as { detail?: string } | undefined)?.detail;
    if (detalle) return detalle;
    if (e.code === "ECONNABORTED" || !e.response) return "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.";
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

export function camposConError(e: unknown): Record<string, string> {
  if (e instanceof AxiosError) return (e.response?.data as { campos?: Record<string, string> })?.campos ?? {};
  return {};
}

// ---- Tipos del API ----

export interface Imagen {
  id: string;
  url: string;
  alt: string;
  kind: "GALLERY" | "BEFORE" | "AFTER";
  width: number | null;
  height: number | null;
}

export interface ServicioResumen {
  slug: string;
  title: string;
  shortDescription: string;
  icon: string;
  coverImageUrl: string | null;
}

export interface ServicioDetalle extends ServicioResumen {
  description: string;
  includes: string[];
  stages: { title: string; description: string }[];
  safetyMeasures: string[];
  faqs: { question: string; answer: string }[];
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface ProyectoResumen {
  slug: string;
  title: string;
  category: Categoria;
  serviceSlug: string | null;
  serviceTitle: string | null;
  summary: string;
  location: string | null;
  year: number | null;
  areaM2: number | null;
  featured: boolean;
  sample: boolean;
  cover: Imagen | null;
}

export interface ProyectoDetalle extends Omit<ProyectoResumen, "featured" | "cover"> {
  challenge: string | null;
  solution: string | null;
  clientName: string | null;
  durationText: string | null;
  videoUrl: string | null;
  gallery: Imagen[];
  before: Imagen | null;
  after: Imagen | null;
  previousSlug: string | null;
  nextSlug: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface Pagina<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}

export interface Cifra {
  code: string;
  label: string;
  value: number;
  prefix: string;
  suffix: string;
}

export interface Testimonio {
  id: string;
  authorName: string;
  authorRole: string | null;
  company: string | null;
  quote: string;
}

export interface Certificado {
  id: string;
  name: string;
  issuer: string;
  code: string | null;
  issuedOn: string | null;
  description: string | null;
  imageUrl: string | null;
}

export interface Convocatoria {
  id: string;
  slug: string;
  title: string;
  location: string;
  employment: string;
  description: string;
  requirements: string[];
  closesOn: string | null;
}

export interface LeadCreado {
  code: string;
  message: string;
}

export interface ReclamoCreado {
  code: string;
  dueDate: string;
  createdAt: string;
}

/** Envío multipart: parte "data" en JSON + archivos opcionales. */
export function multipart(data: unknown, archivos: { campo: string; files: File[] }[] = []) {
  const form = new FormData();
  form.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  for (const { campo, files } of archivos) for (const f of files) form.append(campo, f, f.name);
  return form;
}
