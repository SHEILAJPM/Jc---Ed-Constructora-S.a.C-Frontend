import clsx from "clsx";

/**
 * Logo provisional dibujado en SVG a partir de la descripción: chimenea de ladrillo naranja +
 * línea de techo naranja + "JC & ED CONSTRUCTORA" en blanco. Reemplazar por el archivo oficial.
 */
export function IconoLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden="true" fill="none">
      {/* Chimenea de ladrillo */}
      <rect x="40" y="6" width="10" height="20" fill="#FF6A00" />
      <path d="M40 11h10M40 16h10M40 21h10M45 6v5M43 11v5M47 16v5M44 21v5" stroke="#07122A" strokeWidth="1.2" />
      {/* Techo */}
      <path d="M4 34 32 10l28 24" stroke="#FFB400" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter" />
      <path d="M14 40h36" stroke="#FFB400" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

export default function Logo({ className, compacto = false }: { className?: string; compacto?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <IconoLogo className={compacto ? "h-8 w-auto" : "h-10 w-auto"} />
      <span className="flex flex-col leading-none">
        <span className={clsx("font-display font-bold tracking-tight text-white", compacto ? "text-lg" : "text-xl")}>JC &amp; ED</span>
        <span className="font-mono text-[0.6rem] tracking-[0.32em] text-acero">CONSTRUCTORA</span>
      </span>
    </span>
  );
}
