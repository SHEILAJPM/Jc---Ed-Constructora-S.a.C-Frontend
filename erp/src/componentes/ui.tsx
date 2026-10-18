import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Info, Loader2, X } from "lucide-react";
import { forwardRef, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "peligro" | "fantasma";

const variantes: Record<Variante, string> = {
  primario: "bg-naranja text-white hover:bg-naranja-oscuro shadow-sm",
  secundario: "border border-slate-300 bg-white text-grafito hover:bg-slate-50",
  peligro: "bg-rojo text-white hover:bg-red-700",
  fantasma: "text-grafito hover:bg-slate-100",
};

/** Botón de mínimo 48 px de alto (uso con guantes), con ícono + texto. */
export const Boton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; cargando?: boolean }>(
  function Boton({ variante = "primario", cargando, className, children, disabled, ...props }, ref) {
    return (
      <button
        ref={ref}
        disabled={disabled || cargando}
        className={clsx(
          "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          variantes[variante],
          className,
        )}
        {...props}
      >
        {cargando && <Loader2 className="size-5 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);

type Base = { label: string; error?: string; ayuda?: ReactNode };

export const Campo = forwardRef<HTMLInputElement, Base & InputHTMLAttributes<HTMLInputElement>>(function Campo(
  { label, error, ayuda, className, id, ...props }, ref,
) {
  const auto = useId();
  const cid = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={cid} className="etiqueta mb-1.5 block">
        {label}{props.required && <span className="text-naranja"> *</span>}
      </label>
      <input ref={ref} id={cid} aria-invalid={!!error} aria-describedby={error ? `${cid}-e` : undefined}
        className={clsx("campo", error && "border-rojo")} {...props} />
      {ayuda && !error && <p className="mt-1 text-sm text-slate-500">{ayuda}</p>}
      {error && <p id={`${cid}-e`} role="alert" className="mt-1 text-sm font-medium text-rojo">{error}</p>}
    </div>
  );
});

export const Seleccion = forwardRef<HTMLSelectElement, Base & SelectHTMLAttributes<HTMLSelectElement> & { opciones: { valor: string; label: string }[]; vacio?: string }>(
  function Seleccion({ label, error, opciones, vacio, className, id, ...props }, ref) {
    const auto = useId();
    const cid = id ?? auto;
    return (
      <div className={className}>
        <label htmlFor={cid} className="etiqueta mb-1.5 block">{label}{props.required && <span className="text-naranja"> *</span>}</label>
        <select ref={ref} id={cid} aria-invalid={!!error} className={clsx("campo", error && "border-rojo")} {...props}>
          {vacio !== undefined && <option value="">{vacio}</option>}
          {opciones.map((o) => <option key={o.valor} value={o.valor}>{o.label}</option>)}
        </select>
        {error && <p role="alert" className="mt-1 text-sm font-medium text-rojo">{error}</p>}
      </div>
    );
  },
);

export const AreaTexto = forwardRef<HTMLTextAreaElement, Base & TextareaHTMLAttributes<HTMLTextAreaElement>>(function AreaTexto(
  { label, error, className, id, ...props }, ref,
) {
  const auto = useId();
  const cid = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={cid} className="etiqueta mb-1.5 block">{label}{props.required && <span className="text-naranja"> *</span>}</label>
      <textarea ref={ref} id={cid} rows={3} aria-invalid={!!error} className={clsx("campo py-2", error && "border-rojo")} {...props} />
      {error && <p role="alert" className="mt-1 text-sm font-medium text-rojo">{error}</p>}
    </div>
  );
});

export function Alerta({ tipo = "error", children }: { tipo?: "error" | "exito" | "info" | "aviso"; children: ReactNode }) {
  const estilos = {
    error: "border-red-200 bg-red-50 text-red-800",
    exito: "border-green-200 bg-green-50 text-green-800",
    info: "border-sky-200 bg-sky-50 text-sky-900",
    aviso: "border-amber-200 bg-amber-50 text-amber-900",
  }[tipo];
  const Icono = tipo === "exito" ? CheckCircle2 : tipo === "info" ? Info : AlertTriangle;
  return (
    <div role={tipo === "error" ? "alert" : "status"} className={clsx("flex gap-3 rounded-lg border p-3", estilos)}>
      <Icono className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Insignia({ color = "gris", children }: { color?: "verde" | "ambar" | "rojo" | "gris" | "naranja" | "azul"; children: ReactNode }) {
  const c = {
    verde: "bg-green-100 text-green-800",
    ambar: "bg-amber-100 text-amber-800",
    rojo: "bg-red-100 text-red-800",
    gris: "bg-slate-100 text-slate-700",
    naranja: "bg-orange-100 text-orange-800",
    azul: "bg-sky-100 text-sky-800",
  }[color];
  return <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold", c)}>{children}</span>;
}

export const ESTADO_OBRA: Record<string, { label: string; color: "verde" | "ambar" | "rojo" | "gris" | "azul" }> = {
  PLANIFICADA: { label: "Planificada", color: "azul" },
  EJECUCION: { label: "En ejecución", color: "verde" },
  PARALIZADA: { label: "Paralizada", color: "ambar" },
  CULMINADA: { label: "Culminada", color: "gris" },
  ANULADA: { label: "Anulada", color: "rojo" },
};

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 p-6 text-slate-600">
      <Loader2 className="size-5 animate-spin text-naranja" aria-hidden /> {texto}
    </div>
  );
}

export function Encabezado({ titulo, subtitulo, acciones }: { titulo: string; subtitulo?: ReactNode; acciones?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-grafito sm:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-slate-600">{subtitulo}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-3">{acciones}</div>}
    </div>
  );
}

/** Diálogo modal accesible (Esc cierra, foco al primer campo). */
export function Modal({ abierto, titulo, onCerrar, children }: { abierto: boolean; titulo: string; onCerrar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("input, textarea, select, button")?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("keydown", tecla);
      previo?.focus();
    };
  }, [abierto, onCerrar]);
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onClick={onCerrar}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="-m-2 inline-flex size-12 items-center justify-center rounded-lg hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Pide un motivo antes de una acción irreversible (anular, desactivar, revocar). */
export function ModalMotivo({ abierto, titulo, descripcion, accion, onConfirmar, onCerrar }: {
  abierto: boolean; titulo: string; descripcion: ReactNode; accion: string;
  onConfirmar: (motivo: string) => Promise<void>; onCerrar: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  useEffect(() => {
    if (abierto) {
      setMotivo("");
      setError(null);
    }
  }, [abierto]);
  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCerrar}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (motivo.trim().length < 5) return setError("Indica el motivo (mínimo 5 caracteres)");
          setEnviando(true);
          try {
            await onConfirmar(motivo.trim());
            onCerrar();
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          } finally {
            setEnviando(false);
          }
        }}
      >
        <div className="text-slate-700">{descripcion}</div>
        <AreaTexto label="Motivo" required value={motivo} onChange={(e) => setMotivo(e.target.value)} error={error ?? undefined} />
        <p className="text-sm text-slate-500">Queda registrado en la auditoría con tu usuario, fecha e IP.</p>
        <div className="flex justify-end gap-3">
          <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" variante="peligro" cargando={enviando}>{accion}</Boton>
        </div>
      </form>
    </Modal>
  );
}

export const fechaHora = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" }) : "—";
