import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { EncabezadoSeccion } from "../../components/ui/Animados";
import { BotonLink } from "../../components/ui/Boton";
import TarjetaProyecto from "../../components/ui/TarjetaProyecto";
import { useProyectosDestacados } from "../../lib/consultas";

gsap.registerPlugin(ScrollTrigger);

/** Carrusel horizontal "pinned": la sección se fija y las obras avanzan con el scroll (escritorio). */
export default function ProyectosDestacados() {
  const { data, isLoading } = useProyectosDestacados();
  const seccion = useRef<HTMLElement>(null);
  const pista = useRef<HTMLDivElement>(null);
  const proyectos = data?.items ?? [];

  useEffect(() => {
    if (!proyectos.length || !seccion.current || !pista.current) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const recorrido = () => pista.current!.scrollWidth - window.innerWidth + 64;
      gsap.to(pista.current, {
        x: () => -recorrido(),
        ease: "none",
        scrollTrigger: {
          trigger: seccion.current,
          start: "top top",
          end: () => `+=${recorrido()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
    });
    return () => mm.revert();
  }, [proyectos.length]);

  return (
    <section ref={seccion} className="relative overflow-hidden py-20 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0" aria-labelledby="destacados">
      <div className="contenedor mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <EncabezadoSeccion etiqueta="Proyectos destacados" titulo="Nuestras obras hablan por nosotros" resaltar={["obras"]} />
        <BotonLink to="/proyectos" variante="secundario" className="shrink-0">
          Ver todos <ArrowRight className="size-4" aria-hidden />
        </BotonLink>
      </div>
      <h2 id="destacados" className="sr-only">Proyectos destacados</h2>
      <div
        ref={pista}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 md:px-8 lg:snap-none lg:overflow-visible lg:pl-[max(2rem,calc((100vw-80rem)/2))]"
      >
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-[4/3] w-[82vw] shrink-0 animate-pulse bg-marino sm:w-[26rem]" />)}
        {proyectos.map((p, i) => (
          <div key={p.slug} className="w-[82vw] shrink-0 snap-start sm:w-[26rem] lg:w-[30rem]">
            <p className="etiqueta mb-3">Obra {String(i + 1).padStart(2, "0")}</p>
            <TarjetaProyecto p={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
