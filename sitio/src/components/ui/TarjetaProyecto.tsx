import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import type { ProyectoResumen } from "../../lib/api";
import { etiquetaCategoria } from "../../lib/empresa";
import { LaminaProvisional } from "./Planos";

export default function TarjetaProyecto({ p, prioridad = false }: { p: ProyectoResumen; prioridad?: boolean }) {
  return (
    <Link to={`/proyectos/${p.slug}`} className="group block" data-cursor="grande">
      <div className="cotas relative aspect-[4/3] overflow-hidden bg-marino">
        {p.cover ? (
          <img
            src={p.cover.url}
            alt={p.cover.alt}
            width={p.cover.width ?? undefined}
            height={p.cover.height ?? undefined}
            loading={prioridad ? "eager" : "lazy"}
            decoding="async"
            className="size-full object-cover transition-transform duration-700 ease-[var(--ease-obra)] group-hover:scale-[1.06]"
          />
        ) : (
          <LaminaProvisional categoria={p.category} titulo={p.title} className="transition-transform duration-700 ease-[var(--ease-obra)] group-hover:scale-[1.04]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-noche/90 via-noche/10 to-transparent" />
        {p.sample && (
          <span className="absolute left-3 top-3 bg-ambar px-2 py-1 font-mono text-[0.65rem] font-bold tracking-widest text-noche">EJEMPLO</span>
        )}
        <span className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-noche/70 text-ambar opacity-0 transition-all duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ArrowUpRight className="size-5" aria-hidden />
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="etiqueta mb-2 text-ambar">{etiquetaCategoria(p.category)}{p.year ? ` · ${p.year}` : ""}</p>
          <h3 className="font-display text-xl font-semibold text-white">{p.title}</h3>
          {p.location && <p className="mt-1 text-sm text-hormigon/70">{p.location}</p>}
        </div>
      </div>
    </Link>
  );
}
