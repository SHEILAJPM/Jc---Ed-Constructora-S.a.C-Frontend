import { useQuery } from "@tanstack/react-query";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Alerta, Cargando, Encabezado, ESTADO_OBRA, Insignia } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import { tiene } from "../lib/menu";
import { useSesion } from "../lib/sesion";
import type { ObraResumen } from "../lib/tipos";

export default function Obras() {
  const { yo } = useSesion();
  const [anuladas, setAnuladas] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["obras", anuladas],
    queryFn: () => api.get<ObraResumen[]>("/obras", { params: { incluirAnuladas: anuladas } }).then((r) => r.data),
  });

  return (
    <>
      <Encabezado
        titulo="Obras"
        subtitulo="Solo ves las obras donde tienes un rol asignado."
        acciones={tiene(yo, "core.obra.crear") && (
          <Link to="/obras/nueva" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-naranja px-5 font-semibold text-white hover:bg-naranja-oscuro">
            <Plus className="size-5" aria-hidden /> Nueva obra
          </Link>
        )}
      />
      <label className="mb-4 flex min-h-12 items-center gap-3">
        <input type="checkbox" className="size-5 accent-[#f7841e]" checked={anuladas} onChange={(e) => setAnuladas(e.target.checked)} />
        Mostrar obras anuladas
      </label>
      {isLoading && <Cargando />}
      {error && <Alerta>{mensajeDeError(error)}</Alerta>}
      {data?.length === 0 && <div className="tarjeta p-8 text-center text-slate-600">No hay obras para mostrar.</div>}
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((o) => (
          <li key={o.id}>
            <Link to={`/obras/${o.id}`} className="tarjeta flex h-full flex-col gap-3 p-5 transition-colors hover:border-naranja">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-sm font-semibold text-slate-500">{o.codigo}</span>
                <Insignia color={ESTADO_OBRA[o.estado].color}>{ESTADO_OBRA[o.estado].label}</Insignia>
              </div>
              <p className="text-lg font-bold leading-snug">{o.nombre}</p>
              {o.cliente && <p className="text-slate-600">{o.cliente}</p>}
              <p className="mt-auto flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="size-4 text-naranja" aria-hidden />
                {o.distrito ?? "Sin distrito"} · radio {o.radioM} m{o.geocercas ? ` · ${o.geocercas} geocerca(s)` : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
