import clsx from "clsx";
import { useRef, type ComponentProps, type ReactNode } from "react";
import { Link } from "react-router";

type Variante = "primario" | "secundario" | "fantasma";

const estilos: Record<Variante, string> = {
  primario:
    "bg-gradient-to-r from-ambar to-naranja text-noche shadow-[0_10px_40px_-12px_rgb(255_140_0/0.7)] hover:shadow-[0_14px_50px_-10px_rgb(255_140_0/0.9)]",
  secundario: "vidrio text-hormigon hover:border-ambar/60",
  fantasma: "text-hormigon underline-offset-4 hover:text-ambar hover:underline",
};

const base =
  "relative inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] px-6 py-3 font-display text-[0.95rem] font-semibold tracking-wide transition-[box-shadow,color,border-color,transform] duration-300 ease-[var(--ease-obra)] will-change-transform disabled:pointer-events-none disabled:opacity-50";

/** Efecto magnético: el botón sigue levemente al puntero (solo escritorio, sin reduced-motion). */
function useMagnetico<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const activo = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !activo()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.22;
    const y = (e.clientY - r.top - r.height / 2) * 0.32;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onPointerLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return { ref, onPointerMove, onPointerLeave };
}

interface Comunes {
  variante?: Variante;
  children: ReactNode;
  className?: string;
}

export function Boton({ variante = "primario", className, children, ...resto }: Comunes & ComponentProps<"button">) {
  const m = useMagnetico<HTMLButtonElement>();
  return (
    <button {...resto} {...m} data-cursor="grande" className={clsx(base, estilos[variante], className)}>
      {children}
    </button>
  );
}

export function BotonLink({ variante = "primario", className, children, to, ...resto }: Comunes & ComponentProps<typeof Link>) {
  const m = useMagnetico<HTMLAnchorElement>();
  return (
    <Link {...resto} to={to} {...m} data-cursor="grande" className={clsx(base, estilos[variante], className)}>
      {children}
    </Link>
  );
}

export function BotonExterno({ variante = "primario", className, children, ...resto }: Comunes & ComponentProps<"a">) {
  const m = useMagnetico<HTMLAnchorElement>();
  return (
    <a {...resto} {...m} target="_blank" rel="noopener noreferrer" data-cursor="grande" className={clsx(base, estilos[variante], className)}>
      {children}
    </a>
  );
}
