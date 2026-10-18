import clsx from "clsx";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useSearchParams } from "react-router";
import { Boton } from "../components/ui/Boton";
import CabeceraPagina from "../components/ui/CabeceraPagina";
import Seo from "../components/ui/Seo";
import TarjetaProyecto from "../components/ui/TarjetaProyecto";
import { useProyectos, useServicios } from "../lib/consultas";

const FILTROS = [
  { valor: "", label: "Todos" },
  { valor: "VIVIENDA", label: "Vivienda" },
  { valor: "COMERCIAL", label: "Comercial" },
  { valor: "SALUD", label: "Salud" },
  { valor: "EDUCACION", label: "Educación" },
] as const;

export default function Proyectos() {
  const [params, setParams] = useSearchParams();
  const categoria = params.get("categoria") ?? "";
  const servicio = params.get("servicio") ?? "";
  const { data: servicios } = useServicios();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useProyectos({
    category: categoria || undefined,
    service: servicio || undefined,
  });
  const proyectos = data?.pages.flatMap((p) => p.items) ?? [];

  const cambiar = (clave: string, valor: string) => {
    const nuevo = new URLSearchParams(params);
    if (valor) nuevo.set(clave, valor);
    else nuevo.delete(clave);
    setParams(nuevo, { replace: true, preventScrollReset: true });
  };

  return (
    <>
      <Seo
        title="Proyectos de construcción"
        description="Obras de vivienda, comerciales, salud y educación ejecutadas por JC & ED Constructora SAC."
        path="/proyectos"
      />
      <CabeceraPagina
        lamina="Lámina 03 · Portafolio"
        titulo="Nuestras obras hablan por nosotros"
        resaltar={["obras"]}
        migas={[{ to: "/proyectos", label: "Proyectos" }]}
      />

      <section className="contenedor seccion">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <LayoutGroup>
            <div role="group" aria-label="Filtrar por sector" className="flex flex-wrap gap-2">
              {FILTROS.map((f) => {
                const activo = categoria === f.valor;
                return (
                  <button
                    key={f.valor}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => cambiar("categoria", f.valor)}
                    className={clsx("relative min-h-12 rounded-[3px] px-5 font-display font-medium transition-colors", activo ? "text-noche" : "text-hormigon/80 hover:text-white")}
                  >
                    {activo && <motion.span layoutId="filtro-activo" className="absolute inset-0 -z-0 rounded-[3px] bg-ambar" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                    <span className="relative">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
          <label className="flex items-center gap-3">
            <span className="etiqueta">Servicio</span>
            <select
              value={servicio}
              onChange={(e) => cambiar("servicio", e.target.value)}
              className="min-h-12 rounded-[3px] border border-linea bg-marino px-4 text-white"
            >
              <option value="">Todos</option>
              {(servicios ?? []).map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
            </select>
          </label>
        </div>

        {isError && <p role="alert" className="text-[#ff8a7a]">No pudimos cargar los proyectos. Intenta nuevamente.</p>}

        <motion.ul layout className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <li key={i} className="aspect-[4/3] animate-pulse bg-marino" />)}
          <AnimatePresence mode="popLayout">
            {proyectos.map((p, i) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <TarjetaProyecto p={p} prioridad={i < 3} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {!isLoading && proyectos.length === 0 && (
          <p className="py-16 text-center text-hormigon/70">Aún no hay proyectos publicados con este filtro.</p>
        )}

        {hasNextPage && (
          <div className="mt-14 flex justify-center">
            <Boton variante="secundario" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? "Cargando…" : "Cargar más proyectos"}
            </Boton>
          </div>
        )}
      </section>
    </>
  );
}
