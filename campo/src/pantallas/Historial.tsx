import { useEffect, useState } from "react";
import type { Pantalla } from "../App";
import { cola, type Pendiente } from "../lib/almacen";
import { api } from "../lib/api";

interface Mio {
  id: string;
  tipo: "ENTRADA" | "SALIDA";
  hora: string;
  resultado: "VALIDO" | "RECHAZADO" | "EN_REVISION";
  motivo: string | null;
  obra: string | null;
  offline: boolean;
}

const ETIQUETA = {
  VALIDO: { t: "Válido", c: "bg-green-100 text-green-800" },
  EN_REVISION: { t: "En revisión", c: "bg-amber-100 text-amber-900" },
  RECHAZADO: { t: "Rechazado", c: "bg-red-100 text-red-800" },
};

export default function Historial({ ir }: { ir: (p: Pantalla) => void }) {
  const [lista, setLista] = useState<Mio[] | null>(null);
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void cola.todos().then(setPendientes);
    api<Mio[]>("/campo/marcajes").then(setLista).catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <h1 className="text-2xl font-extrabold">Mis marcajes</h1>
      {pendientes.map((p) => (
        <div key={p.idempotencia} className="tarjeta border-sky-300">
          <p className="font-bold">{p.tipo === "ENTRADA" ? "Entrada" : "Salida"} · {new Date(p.hora).toLocaleString("es-PE")}</p>
          <p className="text-base text-sky-800">Por enviar (sin señal){p.ultimoError ? ` · ${p.ultimoError}` : ""}</p>
        </div>
      ))}
      {error && <p className="text-slate-600">No se pudo cargar el historial: {error}</p>}
      {lista?.length === 0 && <p className="text-slate-600">Aún no tienes marcajes.</p>}
      {lista?.map((m) => (
        <div key={m.id} className="tarjeta">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold">{m.tipo === "ENTRADA" ? "Entrada" : "Salida"}</p>
            <span className={`rounded-full px-3 py-0.5 text-base font-semibold ${ETIQUETA[m.resultado].c}`}>{ETIQUETA[m.resultado].t}</span>
          </div>
          <p className="text-base text-slate-600">{new Date(m.hora).toLocaleString("es-PE")}{m.obra ? ` · ${m.obra}` : ""}{m.offline ? " · sin señal" : ""}</p>
          {m.motivo && <p className="mt-1 text-base">{m.motivo}</p>}
        </div>
      ))}
      <button className="boton-secundario mt-auto" onClick={() => ir({ id: "inicio" })}>Volver</button>
    </div>
  );
}
