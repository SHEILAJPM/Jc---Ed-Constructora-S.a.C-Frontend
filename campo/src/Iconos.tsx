// Íconos en línea (sin librería: menos peso para 3G).
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

export const IconoCamara = ({ className = "size-7" }: P) => (
  <svg {...base} className={className} aria-hidden><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="4" /></svg>
);
export const IconoCheck = ({ className = "size-7" }: P) => (
  <svg {...base} className={className} aria-hidden><path d="M5 12l5 5 9-10" /></svg>
);
export const IconoX = ({ className = "size-7" }: P) => (
  <svg {...base} className={className} aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconoAlerta = ({ className = "size-7" }: P) => (
  <svg {...base} className={className} aria-hidden><path d="M12 3 2 20h20zM12 10v4M12 17v.5" /></svg>
);
export const IconoReloj = ({ className = "size-7" }: P) => (
  <svg {...base} className={className} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconoUbicacion = ({ className = "size-7" }: P) => (
  <svg {...base} className={className} aria-hidden><path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const IconoNube = ({ className = "size-7" }: P) => (
  <svg {...base} className={className} aria-hidden><path d="M7 18a5 5 0 0 1 0-10 6 6 0 0 1 11 2 4 4 0 0 1 0 8zM3 3l18 18" /></svg>
);
export const IconoLista = ({ className = "size-7" }: P) => (
  <svg {...base} className={className} aria-hidden><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>
);

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-white">
      <svg viewBox="0 0 64 48" className="h-8 w-auto" aria-hidden fill="none">
        <rect x="40" y="6" width="10" height="20" fill="#F7841E" />
        <path d="M4 34 32 10l28 24" stroke="#F7841E" strokeWidth="4.5" strokeLinecap="square" />
      </svg>
      <span className="leading-none">
        <span className="block text-lg font-extrabold">JC &amp; ED</span>
        <span className="block text-[0.6rem] font-bold tracking-[0.25em] text-slate-300">MARCAJE</span>
      </span>
    </span>
  );
}
