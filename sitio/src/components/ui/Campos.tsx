import clsx from "clsx";
import { motion } from "motion/react";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const caja =
  "peer block w-full rounded-[3px] border bg-marino/60 px-4 pb-2.5 pt-6 text-base text-white outline-none transition-colors placeholder-transparent focus:border-ambar focus:bg-marino";
const etiqueta =
  "pointer-events-none absolute left-4 top-4 origin-left text-acero transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-ambar peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs";

function Error({ id, mensaje }: { id: string; mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <motion.p
      id={id}
      role="alert"
      className="mt-1.5 text-sm text-[#ff8a7a]"
      initial={{ x: 0 }}
      animate={{ x: [0, -6, 6, -4, 4, 0] }}
      transition={{ duration: 0.4 }}
    >
      {mensaje}
    </motion.p>
  );
}

type Base = { label: string; error?: string; ayuda?: ReactNode };

/** Campo con etiqueta flotante y error con vibración suave. */
export const Campo = forwardRef<HTMLInputElement, Base & InputHTMLAttributes<HTMLInputElement>>(function Campo(
  { label, error, ayuda, className, ...props }, ref,
) {
  const id = useId();
  return (
    <div className={className}>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          placeholder={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-e` : undefined}
          className={clsx(caja, error ? "border-[#ff8a7a]" : "border-linea")}
          {...props}
        />
        <label htmlFor={id} className={etiqueta}>{label}{props.required && <span className="text-ambar"> *</span>}</label>
      </div>
      {ayuda && <p className="mt-1.5 text-xs text-acero">{ayuda}</p>}
      <Error id={`${id}-e`} mensaje={error} />
    </div>
  );
});

export const AreaTexto = forwardRef<HTMLTextAreaElement, Base & TextareaHTMLAttributes<HTMLTextAreaElement>>(function AreaTexto(
  { label, error, ayuda, className, ...props }, ref,
) {
  const id = useId();
  return (
    <div className={className}>
      <div className="relative">
        <textarea
          ref={ref}
          id={id}
          rows={5}
          placeholder={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-e` : undefined}
          className={clsx(caja, "resize-y", error ? "border-[#ff8a7a]" : "border-linea")}
          {...props}
        />
        <label htmlFor={id} className={etiqueta}>{label}{props.required && <span className="text-ambar"> *</span>}</label>
      </div>
      {ayuda && <p className="mt-1.5 text-xs text-acero">{ayuda}</p>}
      <Error id={`${id}-e`} mensaje={error} />
    </div>
  );
});

export const Seleccion = forwardRef<HTMLSelectElement, Base & SelectHTMLAttributes<HTMLSelectElement> & { opciones: readonly { valor: string; label: string }[] }>(
  function Seleccion({ label, error, opciones, className, ...props }, ref) {
    const id = useId();
    return (
      <div className={className}>
        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-e` : undefined}
            className={clsx(caja, "appearance-none", error ? "border-[#ff8a7a]" : "border-linea")}
            {...props}
          >
            <option value="">Selecciona…</option>
            {opciones.map((o) => <option key={o.valor} value={o.valor}>{o.label}</option>)}
          </select>
          <label htmlFor={id} className="pointer-events-none absolute left-4 top-2 text-xs text-acero">{label}{props.required && <span className="text-ambar"> *</span>}</label>
          <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-acero">▾</span>
        </div>
        <Error id={`${id}-e`} mensaje={error} />
      </div>
    );
  },
);

export const Casilla = forwardRef<HTMLInputElement, { label: ReactNode; error?: string } & InputHTMLAttributes<HTMLInputElement>>(
  function Casilla({ label, error, className, ...props }, ref) {
    const id = useId();
    return (
      <div className={className}>
        <label htmlFor={id} className="flex min-h-12 cursor-pointer items-start gap-3 text-sm text-hormigon/85">
          <input ref={ref} id={id} type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#ffb400]" aria-invalid={!!error} {...props} />
          <span>{label}</span>
        </label>
        <Error id={`${id}-e`} mensaje={error} />
      </div>
    );
  },
);
