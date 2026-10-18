import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { BotonLink } from "../../components/ui/Boton";

gsap.registerPlugin(ScrollTrigger);

const PISOS = 6;

/**
 * Edificio en plano técnico que se dibuja al cargar y se "construye" piso a piso con el scroll:
 * cimentación → columnas → losas → fachada. (La fase 3 lo reemplaza por la escena 3D; este SVG
 * queda como respaldo sin WebGL y para prefers-reduced-motion.)
 */
function EdificioPlano() {
  const svg = useRef<SVGSVGElement>(null);
  const reducido = useReducedMotion();

  useEffect(() => {
    const el = svg.current;
    if (!el || reducido) return;
    const ctx = gsap.context(() => {
      const trazos = el.querySelectorAll<SVGGeometryElement>("[data-trazo]");
      trazos.forEach((t) => {
        const largo = t.getTotalLength();
        gsap.set(t, { strokeDasharray: largo, strokeDashoffset: largo });
      });
      gsap.to(trazos, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.04, delay: 0.3 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 20%", end: "+=900", scrub: 0.6 },
      });
      tl.fromTo("[data-piso]", { opacity: 0.08 }, { opacity: 1, stagger: 0.25, duration: 0.4 })
        .fromTo("[data-vidrio]", { opacity: 0 }, { opacity: 1, stagger: 0.08, duration: 0.3 }, "-=0.6")
        .fromTo("[data-grua]", { rotate: -8 }, { rotate: 10, duration: 1.5, transformOrigin: "300px 40px" }, 0);
    }, el);
    return () => ctx.revert();
  }, [reducido]);

  const ancho = 220, x0 = 190, altoPiso = 46, base = 470;
  return (
    <svg ref={svg} viewBox="0 0 600 520" className="h-auto w-full" aria-hidden fill="none">
      {/* Grúa torre */}
      <g stroke="#8A97A8" strokeWidth="1.2" opacity="0.8">
        <path data-trazo d="M470 470V40M484 470V40" />
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} data-trazo d={`M470 ${60 + i * 30}l14 15M484 ${60 + i * 30}l-14 15`} />
        ))}
        <g data-grua>
          <path data-trazo d="M300 40h260M300 40l177-22 83 22" />
          <path data-trazo d="M360 40v80" strokeDasharray="3 4" />
          <rect data-trazo x="350" y="120" width="20" height="14" />
        </g>
      </g>

      {/* Cimentación */}
      <g stroke="#FFB400" strokeWidth="1.5">
        <path data-trazo d={`M${x0 - 30} ${base}h${ancho + 60}`} />
        <path data-trazo d={`M${x0 - 20} ${base}v24h${ancho + 40}v-24`} strokeDasharray="4 4" />
      </g>

      {/* Pisos: columnas + losa + vanos */}
      {Array.from({ length: PISOS }).map((_, p) => {
        const y = base - (p + 1) * altoPiso;
        return (
          <g key={p} data-piso>
            <g stroke="#E6E8EB" strokeWidth="1.4">
              {[0, 1, 2, 3].map((c) => (
                <path key={c} data-trazo d={`M${x0 + c * (ancho / 3)} ${y + altoPiso}V${y}`} />
              ))}
              <path data-trazo d={`M${x0 - 6} ${y}h${ancho + 12}`} strokeWidth="2.4" />
            </g>
            {[0, 1, 2].map((v) => (
              <rect
                key={v}
                data-vidrio
                x={x0 + v * (ancho / 3) + 10}
                y={y + 9}
                width={ancho / 3 - 20}
                height={altoPiso - 18}
                fill="url(#vidrio)"
                stroke="#8A97A8"
                strokeWidth="0.8"
              />
            ))}
          </g>
        );
      })}

      {/* Cotas */}
      <g stroke="#FFB400" strokeWidth="1" fontFamily="JetBrains Mono Variable, monospace" fontSize="11" fill="#FFB400">
        <path data-trazo d={`M${x0} ${base + 40}h${ancho}M${x0} ${base + 34}v12M${x0 + ancho} ${base + 34}v12`} />
        <text x={x0 + ancho / 2 - 20} y={base + 58} stroke="none">22.00 m</text>
        <path data-trazo d={`M${x0 - 46} ${base}V${base - PISOS * altoPiso}M${x0 - 52} ${base}h12M${x0 - 52} ${base - PISOS * altoPiso}h12`} />
        <text x={x0 - 100} y={base - (PISOS * altoPiso) / 2} stroke="none">18.40 m</text>
      </g>

      {/* Etiquetas ancladas */}
      <g fontFamily="JetBrains Mono Variable, monospace" fontSize="11" letterSpacing="2">
        {[
          { y: base + 12, t: "CIMENTACIÓN" },
          { y: base - 2.5 * altoPiso, t: "ESTRUCTURA" },
          { y: base - 5.5 * altoPiso, t: "ACABADOS" },
        ].map((e) => (
          <g key={e.t}>
            <path d={`M${x0 + ancho + 8} ${e.y}h40`} stroke="#FFB400" strokeWidth="1" />
            <circle cx={x0 + ancho + 8} cy={e.y} r="3" fill="#FFB400" />
            <text x={x0 + ancho + 54} y={e.y + 4} fill="#E6E8EB">{e.t}</text>
          </g>
        ))}
      </g>

      <defs>
        <linearGradient id="vidrio" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8A97A8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#102542" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Hero() {
  const reducido = useReducedMotion();
  const entrar = (d: number) => ({
    initial: { opacity: 0, y: reducido ? 0 : 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay: d, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="ruido relative isolate overflow-hidden pt-28 md:pt-32" aria-labelledby="titular">
      <div className="reticula reticula-animada absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute -right-40 top-20 -z-10 size-[36rem] rounded-full bg-naranja/10 blur-[120px]" aria-hidden />

      <div className="contenedor grid items-center gap-10 pb-16 lg:grid-cols-[1.05fr_1fr] lg:pb-24">
        <div>
          <motion.p {...entrar(0.1)} className="etiqueta mb-6 flex items-center gap-3">
            <span className="inline-block size-2 rounded-full bg-ambar" /> Lámina 01 · Est. 2012 · Lima, Perú
          </motion.p>
          <motion.h1 {...entrar(0.2)} id="titular" className="text-[2.6rem] font-bold leading-[1.02] text-white sm:text-6xl xl:text-7xl">
            No le pongas límites a tu imaginación. Cualquier{" "}
            <span className="relative inline-block text-ambar">
              RETO
              <motion.svg
                viewBox="0 0 200 20"
                className="absolute -bottom-2 left-0 w-full"
                aria-hidden
                initial={{ pathLength: 0 }}
              >
                <motion.path
                  d="M2 14 C 50 4, 120 4, 198 12"
                  stroke="#FF6A00"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, delay: 1, ease: "easeInOut" }}
                />
              </motion.svg>
            </span>{" "}
            lo hacemos realidad.
          </motion.h1>
          <motion.p {...entrar(0.35)} className="mt-7 max-w-xl text-lg text-hormigon/75">
            Expertos en diseño y construcción de obras civiles, infraestructura, saneamiento, remodelaciones y demoliciones.
          </motion.p>
          <motion.div {...entrar(0.5)} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <BotonLink to="/proyectos">
              Nuestros Proyectos <ArrowRight className="size-4" aria-hidden />
            </BotonLink>
            <BotonLink to="/contacto" variante="secundario">
              Contáctanos Ahora
            </BotonLink>
          </motion.div>
          <motion.dl {...entrar(0.65)} className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-linea pt-6">
            {[
              ["Desde", "2012"],
              ["Calidad", "INACAL ×4"],
              ["Cobertura", "Nacional"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="etiqueta">{k}</dt>
                <dd className="mt-1 font-mono text-lg text-white">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: reducido ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="cotas relative mx-auto w-full max-w-xl"
        >
          <EdificioPlano />
        </motion.div>
      </div>
    </section>
  );
}
