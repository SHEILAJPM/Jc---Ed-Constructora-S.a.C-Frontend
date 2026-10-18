import clsx from "clsx";

/**
 * Ilustraciones técnicas en línea (estilo plano). Se usan como íconos de servicio y como
 * imagen provisional de proyectos que aún no tienen fotos reales.
 */
type P = { className?: string };
const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "square" as const };

export const PlanoEdificio = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden {...trazo}>
    <path d="M12 58V18l20-10 20 10v40" />
    <path d="M6 58h52M22 26h6v6h-6zM36 26h6v6h-6zM22 38h6v6h-6zM36 38h6v6h-6zM28 58V48h8v10" />
    <path d="M12 18h40" strokeDasharray="2 3" />
  </svg>
);

export const PlanoMartillo = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden {...trazo}>
    <path d="M10 54 34 30M30 26l8-8 8 8-8 8z" />
    <path d="M38 18l6-6 10 4-6 6" />
    <path d="M44 44h12v12H44zM8 12h14v8H8z" strokeDasharray="2 3" />
  </svg>
);

export const PlanoDemolicion = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden {...trazo}>
    <path d="M8 58h48M14 58V30h18v28M38 58V40h12v18" />
    <path d="M14 30l6-6 4 4 8-8" />
    <path d="M40 8v14" />
    <circle cx="40" cy="28" r="6" />
    <path d="M30 16l3 2M50 16l-3 2M20 40l4 2M44 48l3 3" strokeDasharray="1 3" />
  </svg>
);

export const PlanoExcavadora = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden {...trazo}>
    <path d="M6 46h30v-10H18l-4 10" />
    <path d="M22 36v-8h10v8M36 40l12-16 8 6-4 6h-6" />
    <rect x="6" y="46" width="30" height="8" rx="4" />
    <path d="M10 50h22" strokeDasharray="2 3" />
    <path d="M44 58c4-3 8-3 14 0" />
  </svg>
);

export const PlanoGrua = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden {...trazo}>
    <path d="M20 58V10M26 58V10M20 14l6 6M26 14l-6 6M20 26l6 6M26 26l-6 6M20 38l6 6M26 38l-6 6" />
    <path d="M8 10h50M8 10l12-6M58 10l-32-6" />
    <path d="M48 10v14" />
    <rect x="44" y="24" width="8" height="6" />
    <path d="M12 58h22" />
  </svg>
);

export const ICONOS_SERVICIO: Record<string, (p: P) => React.JSX.Element> = {
  building: PlanoEdificio,
  hammer: PlanoMartillo,
  demolition: PlanoDemolicion,
  excavator: PlanoExcavadora,
};

const POR_CATEGORIA: Record<string, (p: P) => React.JSX.Element> = {
  VIVIENDA: PlanoEdificio,
  COMERCIAL: PlanoMartillo,
  SALUD: PlanoEdificio,
  EDUCACION: PlanoEdificio,
  SANEAMIENTO: PlanoExcavadora,
  PUBLICO: PlanoGrua,
};

/** Lámina técnica provisional para proyectos sin fotografía. */
export function LaminaProvisional({ categoria, titulo, className }: { categoria: string; titulo: string; className?: string }) {
  const Dibujo = POR_CATEGORIA[categoria] ?? PlanoEdificio;
  return (
    <div className={clsx("reticula relative flex size-full items-center justify-center overflow-hidden bg-marino", className)} role="img" aria-label={`Ilustración de ${titulo}`}>
      <Dibujo className="size-2/5 text-ambar/70" />
      <span className="etiqueta absolute bottom-3 left-3">Foto por reemplazar</span>
      <span className="etiqueta absolute right-3 top-3">Lámina · {categoria.slice(0, 3)}</span>
    </div>
  );
}
