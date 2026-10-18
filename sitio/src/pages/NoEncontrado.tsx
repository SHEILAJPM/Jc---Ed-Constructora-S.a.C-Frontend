import { motion, useReducedMotion } from "motion/react";
import { BotonLink } from "../components/ui/Boton";
import Seo from "../components/ui/Seo";

/** 404 creativo: "Esta zona está en construcción", con una grúa que mueve su carga. */
export default function NoEncontrado() {
  const reducido = useReducedMotion();
  return (
    <section className="reticula relative flex min-h-[85vh] items-center pt-28">
      <Seo title="Página no encontrada" description="Esta zona está en construcción." path="/404" noIndex />
      <div className="contenedor grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="etiqueta mb-4 text-ambar">Error 404 · Zona restringida</p>
          <h1 className="text-5xl font-bold text-white sm:text-7xl">Esta zona está en construcción</h1>
          <p className="mt-6 max-w-md text-lg text-hormigon/75">La página que buscas no existe o fue movida. Volvamos a terreno firme.</p>
          <BotonLink to="/" className="mt-10">Volver al inicio</BotonLink>
        </div>
        <svg viewBox="0 0 300 260" className="mx-auto w-full max-w-sm" aria-hidden fill="none" stroke="#8A97A8" strokeWidth="2">
          <path d="M80 250V30M100 250V30" />
          {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M80 ${40 + i * 30}l20 15M100 ${40 + i * 30}l-20 15`} />)}
          <path d="M20 30h270M20 30l70-20 200 20" />
          <motion.g
            animate={reducido ? undefined : { x: [0, 120, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M150 30v70" strokeDasharray="4 4" />
            <rect x="130" y="100" width="40" height="28" fill="#FFB400" stroke="none" />
            <text x="150" y="119" textAnchor="middle" fill="#07122A" stroke="none" fontFamily="JetBrains Mono Variable, monospace" fontSize="13" fontWeight="700">404</text>
          </motion.g>
          <path d="M30 250h240" stroke="#FFB400" />
          <rect x="30" y="236" width="240" height="14" fill="url(#cinta404)" stroke="none" />
          <defs>
            <pattern id="cinta404" width="20" height="14" patternUnits="userSpaceOnUse" patternTransform="skewX(-45)">
              <rect width="10" height="14" fill="#FFB400" />
              <rect x="10" width="10" height="14" fill="#111" />
            </pattern>
          </defs>
        </svg>
      </div>
    </section>
  );
}
