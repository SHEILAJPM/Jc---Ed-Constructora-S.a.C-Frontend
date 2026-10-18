import { useRef, useState } from "react";
import type { Imagen } from "../../lib/api";

/** Comparador deslizante "Antes / Después" (puntero, táctil y teclado). */
export default function AntesDespues({ antes, despues }: { antes: Imagen; despues: Imagen }) {
  const [pos, setPos] = useState(50);
  const caja = useRef<HTMLDivElement>(null);
  const arrastrando = useRef(false);

  const desdeEvento = (clientX: number) => {
    const r = caja.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={caja}
      className="cotas relative aspect-[16/10] w-full select-none overflow-hidden bg-marino touch-none"
      onPointerDown={(e) => { arrastrando.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); desdeEvento(e.clientX); }}
      onPointerMove={(e) => arrastrando.current && desdeEvento(e.clientX)}
      onPointerUp={() => (arrastrando.current = false)}
    >
      <img src={despues.url} alt={`Después: ${despues.alt}`} className="absolute inset-0 size-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={antes.url} alt={`Antes: ${antes.alt}`} className="absolute inset-0 size-full object-cover" draggable={false} />
      </div>
      <span className="etiqueta absolute left-4 top-4 bg-noche/80 px-2 py-1 text-hormigon">Antes</span>
      <span className="etiqueta absolute right-4 top-4 bg-noche/80 px-2 py-1 text-hormigon">Después</span>
      <div className="absolute inset-y-0 w-px bg-ambar" style={{ left: `${pos}%` }}>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Comparar antes y después"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
            if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
          }}
          className="absolute top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-ambar font-mono text-noche shadow-lg"
        >
          ⟷
        </div>
      </div>
    </div>
  );
}
