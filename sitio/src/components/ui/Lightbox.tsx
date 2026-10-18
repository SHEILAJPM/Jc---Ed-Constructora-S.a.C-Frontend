import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface ItemLightbox {
  url: string;
  alt: string;
  pie?: string;
}

/** Visor a pantalla completa: teclado (← → Esc), swipe en móvil y foco atrapado. */
export default function Lightbox({ items, indice, onCambiar, onCerrar }: {
  items: ItemLightbox[]; indice: number | null; onCambiar: (i: number) => void; onCerrar: () => void;
}) {
  const cerrar = useRef<HTMLButtonElement>(null);
  const inicioX = useRef<number | null>(null);
  const abierto = indice !== null && items.length > 0;

  const mover = useCallback(
    (paso: number) => indice !== null && onCambiar((indice + paso + items.length) % items.length),
    [indice, items.length, onCambiar],
  );

  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement as HTMLElement | null;
    cerrar.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    };
    document.addEventListener("keydown", tecla);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.documentElement.style.overflow = "";
      previo?.focus();
    };
  }, [abierto, mover, onCerrar]);

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ${indice! + 1} de ${items.length}`}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-noche/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCerrar}
          onTouchStart={(e) => (inicioX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (inicioX.current === null) return;
            const dx = e.changedTouches[0].clientX - inicioX.current;
            if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
            inicioX.current = null;
          }}
        >
          <motion.figure
            key={indice}
            className="relative max-h-[86vh] max-w-[92vw]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={items[indice!].url} alt={items[indice!].alt} className="max-h-[80vh] w-auto object-contain" />
            <figcaption className="mt-3 flex justify-between gap-4 font-mono text-xs text-acero">
              <span>{items[indice!].pie ?? items[indice!].alt}</span>
              <span>{String(indice! + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            </figcaption>
          </motion.figure>
          <button ref={cerrar} type="button" onClick={onCerrar} aria-label="Cerrar" className="absolute right-4 top-4 inline-flex size-12 items-center justify-center rounded-[3px] border border-linea bg-marino">
            <X className="size-6" />
          </button>
          {items.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); mover(-1); }} aria-label="Imagen anterior" className="absolute left-3 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-[3px] border border-linea bg-marino">
                <ChevronLeft className="size-6" />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); mover(1); }} aria-label="Imagen siguiente" className="absolute right-3 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-[3px] border border-linea bg-marino">
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
