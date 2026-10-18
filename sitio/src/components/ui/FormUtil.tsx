import { motion } from "motion/react";
import { FileText, ImageIcon, Paperclip, X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { Link } from "react-router";

/** Selector de archivos accesible con lista y botón para quitar. */
export function SelectorArchivos({ archivos, onCambiar, aceptar, ayuda, error, multiple = true, etiqueta }: {
  archivos: File[]; onCambiar: (f: File[]) => void; aceptar: string; ayuda: string; error?: string | null; multiple?: boolean; etiqueta: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label
        htmlFor={id}
        className="reticula cotas flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-acero/40 bg-marino/40 p-6 text-center hover:border-ambar"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const nuevos = Array.from(e.dataTransfer.files);
          onCambiar(multiple ? [...archivos, ...nuevos] : nuevos.slice(0, 1));
        }}
      >
        <Paperclip className="size-8 text-ambar" aria-hidden />
        <span className="font-display font-semibold text-white">{etiqueta}</span>
        <span className="text-sm text-acero">{ayuda}</span>
      </label>
      <input
        ref={input}
        id={id}
        type="file"
        accept={aceptar}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const nuevos = Array.from(e.target.files ?? []);
          onCambiar(multiple ? [...archivos, ...nuevos] : nuevos.slice(0, 1));
          if (input.current) input.current.value = "";
        }}
      />
      {archivos.length > 0 && (
        <ul className="mt-4 space-y-2">
          {archivos.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 border border-linea bg-marino/60 px-4 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                {f.type === "application/pdf" ? <FileText className="size-4 shrink-0 text-ambar" /> : <ImageIcon className="size-4 shrink-0 text-ambar" />}
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 font-mono text-xs text-acero">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
              </span>
              <button
                type="button"
                onClick={() => onCambiar(archivos.filter((_, j) => j !== i))}
                className="inline-flex size-10 items-center justify-center text-acero hover:text-white"
                aria-label={`Quitar ${f.name}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-[#ff8a7a]">{error}</p>}
    </div>
  );
}

export function TextoPrivacidad() {
  return (
    <>
      Acepto la <Link to="/politica-de-privacidad" target="_blank" className="text-ambar underline">política de privacidad</Link> y
      autorizo el uso de mis datos para atender esta solicitud (Ley N.° 29733).
    </>
  );
}

/** Pantalla de éxito con check animado. */
export function Exito({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="vidrio cotas mx-auto max-w-2xl p-8 text-center md:p-12"
    >
      <svg viewBox="0 0 52 52" className="mx-auto size-20" aria-hidden>
        <motion.circle cx="26" cy="26" r="24" fill="none" stroke="#FFB400" strokeWidth="2"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />
        <motion.path d="M15 27l7 7 15-16" fill="none" stroke="#FFB400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.6 }} />
      </svg>
      <h2 className="mt-6 font-display text-3xl font-bold text-white">{titulo}</h2>
      <div className="mt-4 space-y-4 text-hormigon/80">{children}</div>
    </motion.div>
  );
}

export function AlertaError({ mensaje }: { mensaje: string | null }) {
  if (!mensaje) return null;
  return (
    <p role="alert" className="border border-[#ff8a7a]/50 bg-[#ff8a7a]/10 px-4 py-3 text-sm text-[#ffb3a8]">
      {mensaje}
    </p>
  );
}
