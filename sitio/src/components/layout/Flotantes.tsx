import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { enlaceWhatsApp } from "../../lib/empresa";
import { IconoWhatsApp } from "../ui/IconosMarca";

export function WhatsAppFlotante() {
  return (
    <a
      href={enlaceWhatsApp("Hola JC & ED, quiero cotizar una obra.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp: ¿Cotizamos tu obra?"
      data-evento="clic-whatsapp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 md:bottom-8 md:right-8"
    >
      <span className="vidrio pointer-events-none hidden translate-x-2 rounded-[3px] px-4 py-2 text-sm font-medium opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 md:block">
        ¿Cotizamos tu obra?
      </span>
      <span className="flex size-14 animate-pulso items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg">
        <IconoWhatsApp className="size-7" />
      </span>
    </a>
  );
}

export function BarraProgreso() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left bg-gradient-to-r from-ambar to-naranja"
      style={{ scaleX }}
    />
  );
}

/** Cursor de mira técnica (solo escritorio con puntero fino y sin reduced-motion). */
export function CursorPersonalizado() {
  const reducido = useReducedMotion();
  const [activo, setActivo] = useState(false);
  const punto = useRef<HTMLDivElement>(null);
  const anillo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducido || !window.matchMedia("(pointer: fine)").matches) return;
    setActivo(true);
    document.documentElement.classList.add("cursor-personalizado");
    let x = innerWidth / 2, y = innerHeight / 2, ax = x, ay = y, raf = 0, grande = false;
    const mover = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      grande = !!(e.target as Element | null)?.closest("a, button, [data-cursor='grande'], input, textarea, select, label");
    };
    const animar = () => {
      ax += (x - ax) * 0.18;
      ay += (y - ay) * 0.18;
      if (punto.current) punto.current.style.transform = `translate(${x}px, ${y}px)`;
      if (anillo.current) anillo.current.style.transform = `translate(${ax}px, ${ay}px) scale(${grande ? 1.8 : 1})`;
      raf = requestAnimationFrame(animar);
    };
    window.addEventListener("pointermove", mover, { passive: true });
    raf = requestAnimationFrame(animar);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
      document.documentElement.classList.remove("cursor-personalizado");
    };
  }, [reducido]);

  if (!activo) return null;
  return (
    <>
      <div ref={punto} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] -ml-1 -mt-1 size-2 rounded-full bg-ambar" />
      <div
        ref={anillo}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] -ml-5 -mt-5 size-10 rounded-full border border-ambar/70 transition-[scale] duration-200 mix-blend-difference"
      >
        <span className="absolute left-1/2 top-[-6px] h-2 w-px bg-ambar/70" />
        <span className="absolute bottom-[-6px] left-1/2 h-2 w-px bg-ambar/70" />
        <span className="absolute left-[-6px] top-1/2 h-px w-2 bg-ambar/70" />
        <span className="absolute right-[-6px] top-1/2 h-px w-2 bg-ambar/70" />
      </div>
    </>
  );
}

const CLAVE_COOKIES = "jced-cookies-v1";

/** Solo usamos almacenamiento estrictamente necesario: el banner informa, no pide permiso para rastrear. */
export function BannerCookies() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      setVisible(!localStorage.getItem(CLAVE_COOKIES));
    } catch {
      setVisible(false);
    }
  }, []);
  if (!visible) return null;
  const aceptar = () => {
    try {
      localStorage.setItem(CLAVE_COOKIES, new Date().toISOString());
    } catch {
      /* navegador sin almacenamiento: el banner simplemente se cierra */
    }
    setVisible(false);
  };
  return (
    <div role="region" aria-label="Aviso de cookies" className="vidrio fixed bottom-24 left-4 right-4 z-40 max-w-md rounded-[3px] p-5 md:bottom-8 md:left-8 md:right-auto">
      <p className="text-sm text-hormigon/85">
        Usamos solo lo necesario para que el sitio funcione. No usamos cookies de publicidad ni de rastreo.{" "}
        <Link to="/politica-de-cookies" className="text-ambar underline">Más información</Link>
      </p>
      <button type="button" onClick={aceptar} className="mt-4 min-h-11 rounded-[3px] bg-hormigon px-5 font-semibold text-noche">
        Entendido
      </button>
    </div>
  );
}
