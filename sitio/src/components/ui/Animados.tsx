import clsx from "clsx";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform, useVelocity, useSpring } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Aparición al entrar en pantalla (fade-up). */
export function Reveal({ children, delay = 0, className, as = "div", y = 28 }: {
  children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "aside" | "section"; y?: number;
}) {
  const reducido = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: reducido ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

/** Titular que se revela palabra por palabra con máscara. */
export function TituloPalabras({ texto, className, as = "h2", resaltar }: {
  texto: string; className?: string; as?: "h1" | "h2" | "h3"; resaltar?: string[];
}) {
  const reducido = useReducedMotion();
  const Tag = as;
  const palabras = texto.split(" ");
  return (
    <Tag className={className} aria-label={texto}>
      {palabras.map((p, i) => {
        const limpia = p.replace(/[.,;:!?¿¡]/g, "");
        return (
          <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              className={clsx("inline-block", resaltar?.includes(limpia) && "degradado-acento")}
              initial={{ y: reducido ? 0 : "110%", opacity: reducido ? 0 : 1 }}
              whileInView={{ y: "0%", opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: i * 0.05, ease: EASE }}
            >
              {p}
            </motion.span>
            {i < palabras.length - 1 && " "}
          </span>
        );
      })}
    </Tag>
  );
}

export function EncabezadoSeccion({ etiqueta, titulo, bajada, resaltar, className, centrado }: {
  etiqueta: string; titulo: string; bajada?: string; resaltar?: string[]; className?: string; centrado?: boolean;
}) {
  return (
    <div className={clsx("max-w-3xl", centrado && "mx-auto text-center", className)}>
      <Reveal>
        <p className={clsx("etiqueta mb-5 flex items-center gap-3", centrado && "justify-center")}>
          <span className="inline-block h-px w-8 bg-ambar" aria-hidden />
          {etiqueta}
        </p>
      </Reveal>
      <TituloPalabras texto={titulo} resaltar={resaltar} className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl" />
      {bajada && (
        <Reveal delay={0.15}>
          <p className="mt-6 text-lg text-hormigon/75">{bajada}</p>
        </Reveal>
      )}
    </div>
  );
}

/** Contador con easing que arranca al entrar en pantalla. */
export function Contador({ valor, prefijo = "", sufijo = "", className, desde = 0 }: {
  valor: number; prefijo?: string; sufijo?: string; className?: string; desde?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reducido = useReducedMotion();
  const [n, setN] = useState(reducido ? valor : desde);
  useEffect(() => {
    if (!visible || reducido) return;
    const ctrl = animate(desde, valor, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => ctrl.stop();
  }, [visible, valor, desde, reducido]);
  return (
    <span ref={ref} className={className} aria-label={`${prefijo}${valor}${sufijo}`}>
      <span aria-hidden>{prefijo}{n.toLocaleString("es-PE")}{sufijo}</span>
    </span>
  );
}

/** Marquesina infinita cuya velocidad e inclinación reaccionan al scroll. */
export function Marquesina({ items, className }: { items: readonly string[]; className?: string }) {
  const { scrollY } = useScroll();
  const velocidad = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 300 });
  const sesgo = useTransform(velocidad, [-2000, 0, 2000], [-4, 0, 4], { clamp: true });
  const fila = [...items, ...items];
  return (
    <div className={clsx("overflow-hidden", className)} aria-label={items.join(", ")}>
      <motion.div style={{ skewX: sesgo }} aria-hidden>
        <div className="flex w-max animate-marquesina items-center">
          {fila.map((t, i) => (
            <span key={i} className="flex items-center gap-8 px-8 font-display text-3xl font-bold uppercase tracking-tight text-white/90 sm:text-5xl">
              {t}
              <span className="text-ambar">✦</span>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/** Tarjeta con inclinación 3D y foco de luz que sigue al puntero (solo escritorio). */
export function TarjetaTilt({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mover = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg) translateZ(0)`;
    el.style.setProperty("--fx", `${px * 100}%`);
    el.style.setProperty("--fy", `${py * 100}%`);
  };
  const salir = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <div
      ref={ref}
      onPointerMove={mover}
      onPointerLeave={salir}
      className={clsx("group relative transition-transform duration-300 ease-out will-change-transform [transform-style:preserve-3d]", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--fx, 50%) var(--fy, 50%), rgb(255 180 0 / 0.14), transparent 45%)" }}
      />
      {children}
    </div>
  );
}
