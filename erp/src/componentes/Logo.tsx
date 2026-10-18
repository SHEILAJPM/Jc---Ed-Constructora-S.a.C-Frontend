/**
 * Logo provisional según la descripción oficial: chimenea de ladrillo naranja + línea de techo
 * naranja + "JC & ED CONSTRUCTORA" en blanco. Va SIEMPRE sobre fondo grafito. Reemplazar por el archivo oficial.
 */
export function IconoLogo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden fill="none">
      <rect x="40" y="6" width="10" height="20" fill="#F7841E" />
      <path d="M40 11h10M40 16h10M40 21h10M45 6v5M43 11v5M47 16v5M44 21v5" stroke="#1E293B" strokeWidth="1.2" />
      <path d="M4 34 32 10l28 24" stroke="#F7841E" strokeWidth="4.5" strokeLinecap="square" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <IconoLogo />
      <span className="leading-none text-white">
        <span className="block text-lg font-extrabold tracking-tight">JC &amp; ED</span>
        <span className="block text-[0.62rem] font-bold tracking-[0.28em] text-slate-300">CONSTRUCTORA</span>
      </span>
    </span>
  );
}
