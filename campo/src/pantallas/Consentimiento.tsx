import { useEffect, useRef, useState } from "react";
import type { Pantalla } from "../App";
import { api } from "../lib/api";
import { Aviso } from "./Login";

interface Texto {
  version: number;
  texto: string;
  aceptado: boolean;
}

/** Ley 29733: el trabajador lee y firma (escribiendo su nombre) antes de su primer marcaje. */
export default function Consentimiento({ ir }: { ir: (p: Pantalla) => void }) {
  const [c, setC] = useState<Texto | null>(null);
  const [nombre, setNombre] = useState("");
  const [leido, setLeido] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<Texto>("/campo/consentimiento").then(setC).catch((e) => setError(e.message));
  }, []);

  // Si el texto cabe sin desplazarse, ya está a la vista completo.
  useEffect(() => {
    const el = caja.current;
    if (el && el.scrollHeight <= el.clientHeight + 20) setLeido(true);
  }, [c]);

  if (!c) return error ? <Aviso>{error}</Aviso> : <p className="m-auto text-slate-600">Cargando…</p>;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Autorización de datos</h1>
      <div ref={caja} className="tarjeta max-h-[45vh] overflow-y-auto whitespace-pre-line text-base"
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setLeido(true);
        }}>
        {c.texto}
      </div>
      {!leido && <p className="text-base text-slate-600">Baja hasta el final del texto para continuar.</p>}
      <label className="block">
        <span className="mb-1 block font-semibold">Escribe tu nombre completo para firmar</span>
        <input className="campo text-lg tracking-normal" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
      </label>
      {error && <Aviso>{error}</Aviso>}
      <button
        type="button"
        className="boton-primario mt-auto"
        disabled={!leido || nombre.trim().length < 5 || enviando}
        onClick={async () => {
          setEnviando(true);
          setError(null);
          try {
            await api("/campo/consentimiento", { method: "POST", body: JSON.stringify({ version: c.version, firmaNombre: nombre.trim() }) });
            ir({ id: "inicio" });
          } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudo guardar");
          } finally {
            setEnviando(false);
          }
        }}
      >
        Acepto y firmo
      </button>
    </div>
  );
}
