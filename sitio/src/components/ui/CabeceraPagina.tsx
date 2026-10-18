import type { ReactNode } from "react";
import { Link } from "react-router";
import { Reveal, TituloPalabras } from "./Animados";

/** Cabecera de páginas internas: migas, lámina técnica y titular. */
export default function CabeceraPagina({ lamina, titulo, bajada, migas, resaltar, children }: {
  lamina: string;
  titulo: string;
  bajada?: string;
  migas?: { to: string; label: string }[];
  resaltar?: string[];
  children?: ReactNode;
}) {
  return (
    <section className="ruido relative isolate overflow-hidden border-b border-linea pb-16 pt-36 md:pb-20 md:pt-44">
      <div className="reticula absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="absolute -left-40 top-10 -z-10 size-[30rem] rounded-full bg-ambar/10 blur-[120px]" aria-hidden />
      <div className="contenedor">
        <nav aria-label="Migas de pan" className="mb-8">
          <ol className="etiqueta flex flex-wrap items-center gap-2">
            <li><Link to="/" className="hover:text-ambar">Inicio</Link></li>
            {migas?.map((m) => (
              <li key={m.to} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                <Link to={m.to} className="hover:text-ambar">{m.label}</Link>
              </li>
            ))}
          </ol>
        </nav>
        <Reveal>
          <p className="etiqueta mb-5 text-ambar">{lamina}</p>
        </Reveal>
        <TituloPalabras as="h1" texto={titulo} resaltar={resaltar} className="max-w-5xl text-5xl font-bold text-white sm:text-6xl lg:text-7xl" />
        {bajada && (
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-2xl text-lg text-hormigon/75">{bajada}</p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
