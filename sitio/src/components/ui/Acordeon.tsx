import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState } from "react";

export default function Acordeon({ items }: { items: { pregunta: string; respuesta: string }[] }) {
  const [abierto, setAbierto] = useState<number | null>(0);
  const base = useId();
  return (
    <div className="divide-y divide-linea border-y border-linea">
      {items.map((it, i) => {
        const activo = abierto === i;
        return (
          <div key={i}>
            <h3>
              <button
                type="button"
                id={`${base}-b${i}`}
                aria-expanded={activo}
                aria-controls={`${base}-p${i}`}
                onClick={() => setAbierto(activo ? null : i)}
                className="flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left font-display text-lg font-semibold text-white"
              >
                {it.pregunta}
                <Plus className={`size-5 shrink-0 text-ambar transition-transform duration-300 ${activo ? "rotate-45" : ""}`} aria-hidden />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {activo && (
                <motion.div
                  id={`${base}-p${i}`}
                  role="region"
                  aria-labelledby={`${base}-b${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pr-10 text-hormigon/75">{it.respuesta}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
