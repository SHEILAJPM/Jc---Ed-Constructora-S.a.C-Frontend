import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<{ current: Lenis | null }>({ current: null });

export const useLenis = () => useContext(LenisContext);

/** Scroll suave con Lenis sincronizado con GSAP ScrollTrigger. Se desactiva con prefers-reduced-motion. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenis = useRef<Lenis | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instancia = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9 });
    lenis.current = instancia;
    instancia.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => instancia.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      instancia.destroy();
      lenis.current = null;
    };
  }, []);

  // Cada página nueva empieza arriba; ScrollTrigger recalcula cuando el nuevo contenido ya está.
  useEffect(() => {
    if (lenis.current) lenis.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 700);
    return () => clearTimeout(t);
  }, [pathname]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
