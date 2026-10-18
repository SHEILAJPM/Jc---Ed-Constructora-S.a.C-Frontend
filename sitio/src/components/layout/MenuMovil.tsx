import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { NavLink } from "react-router";
import { EMPRESA, enlaceWhatsApp, NAV } from "../../lib/empresa";
import { BotonLink } from "../ui/Boton";
import { IconoWhatsApp } from "../ui/IconosMarca";

/** Menú móvil a pantalla completa con apertura circular (clip-path) desde el botón. */
export default function MenuMovil({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement as HTMLElement | null;
    cerrarRef.current?.focus();
    const alTecla = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", alTecla);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTecla);
      document.documentElement.style.overflow = "";
      previo?.focus();
    };
  }, [abierto, onCerrar]);

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          id="menu-movil"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          className="reticula fixed inset-0 z-[60] flex flex-col bg-noche lg:hidden"
          initial={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
          animate={{ clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
          exit={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)", transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } }}
        >
          <div className="contenedor flex justify-end py-4">
            <button
              ref={cerrarRef}
              type="button"
              onClick={onCerrar}
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-[3px] border border-linea"
              aria-label="Cerrar menú"
            >
              <X className="size-6" />
            </button>
          </div>
          <nav aria-label="Principal" className="contenedor flex flex-1 flex-col justify-center">
            <ul className="space-y-2">
              {NAV.map((n, i) => (
                <motion.li
                  key={n.to}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.06, duration: 0.5 } }}
                >
                  <NavLink
                    to={n.to}
                    end={n.to === "/"}
                    onClick={onCerrar}
                    className={({ isActive }) =>
                      `flex items-baseline gap-4 py-2 font-display text-4xl font-bold sm:text-5xl ${isActive ? "text-ambar" : "text-white"}`
                    }
                  >
                    <span className="font-mono text-sm text-acero">0{i + 1}</span>
                    {n.label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </nav>
          <div className="contenedor space-y-4 pb-10">
            <BotonLink to="/cotizar" onClick={onCerrar} className="w-full">
              Cotizar Proyecto
            </BotonLink>
            <a
              href={enlaceWhatsApp("Hola, quiero información sobre una obra.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 text-hormigon"
            >
              <IconoWhatsApp className="size-5 text-[#25D366]" /> {EMPRESA.telefonos[0].numero}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
