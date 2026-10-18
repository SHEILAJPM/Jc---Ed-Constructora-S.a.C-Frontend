import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  api,
  type Certificado,
  type Cifra,
  type Convocatoria,
  type Pagina,
  type ProyectoDetalle,
  type ProyectoResumen,
  type ServicioDetalle,
  type ServicioResumen,
  type Testimonio,
} from "./api";

const get = <T,>(url: string, params?: Record<string, unknown>) => api.get<T>(url, { params }).then((r) => r.data);

export const useServicios = () => useQuery({ queryKey: ["servicios"], queryFn: () => get<ServicioResumen[]>("/services") });

export const useServicio = (slug: string) =>
  useQuery({ queryKey: ["servicio", slug], queryFn: () => get<ServicioDetalle>(`/services/${slug}`) });

export const useCifras = () => useQuery({ queryKey: ["cifras"], queryFn: () => get<Cifra[]>("/stats") });

export const useTestimonios = () => useQuery({ queryKey: ["testimonios"], queryFn: () => get<Testimonio[]>("/testimonials") });

export const useCertificados = () => useQuery({ queryKey: ["certificados"], queryFn: () => get<Certificado[]>("/certificates") });

export const useConvocatorias = () => useQuery({ queryKey: ["convocatorias"], queryFn: () => get<Convocatoria[]>("/jobs") });

export const useProyectosDestacados = () =>
  useQuery({
    queryKey: ["proyectos", "destacados"],
    queryFn: () => get<Pagina<ProyectoResumen>>("/projects", { featured: true, size: 6 }),
  });

export const useProyectosRelacionados = (servicio: string) =>
  useQuery({
    queryKey: ["proyectos", "servicio", servicio],
    queryFn: () => get<Pagina<ProyectoResumen>>("/projects", { service: servicio, size: 3 }),
  });

export function useProyectos(filtros: { category?: string; service?: string }) {
  return useInfiniteQuery({
    queryKey: ["proyectos", "lista", filtros],
    queryFn: ({ pageParam }) => get<Pagina<ProyectoResumen>>("/projects", { ...filtros, page: pageParam, size: 9 }),
    initialPageParam: 0,
    getNextPageParam: (ultima) => (ultima.hasNext ? ultima.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

export const useProyecto = (slug: string) =>
  useQuery({ queryKey: ["proyecto", slug], queryFn: () => get<ProyectoDetalle>(`/projects/${slug}`) });
