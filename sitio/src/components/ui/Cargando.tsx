export default function Cargando({ texto = "Cargando" }: { texto?: string }) {
  return (
    <div role="status" aria-live="polite" className="contenedor flex min-h-[60vh] items-center justify-center pt-24">
      <div className="flex items-center gap-3">
        <span className="relative block h-1 w-24 overflow-hidden bg-marino-2">
          <span className="absolute inset-y-0 left-0 w-1/3 animate-[marquesina_1.2s_linear_infinite] bg-ambar" />
        </span>
        <span className="etiqueta">{texto}…</span>
      </div>
    </div>
  );
}
