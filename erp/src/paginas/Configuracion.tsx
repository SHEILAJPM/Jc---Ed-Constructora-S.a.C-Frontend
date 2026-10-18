import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useState } from "react";
import { Alerta, Boton, Cargando, Encabezado } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import { tiene } from "../lib/menu";
import { useSesion } from "../lib/sesion";
import type { Parametro } from "../lib/tipos";

function Fila({ p, editable }: { p: Parametro; editable: boolean }) {
  const qc = useQueryClient();
  const [valor, setValor] = useState(String(p.valor));
  const [estado, setEstado] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const cambiado = valor !== String(p.valor);
  const numerico = p.tipo === "ENTERO" || p.tipo === "DECIMAL";

  return (
    <li className="grid gap-3 py-4 md:grid-cols-[1fr_16rem_auto] md:items-center">
      <div>
        <p className="font-semibold">{p.descripcion}</p>
        {estado && <p role={estado.tipo === "error" ? "alert" : "status"} className={`mt-1 text-sm font-medium ${estado.tipo === "error" ? "text-rojo" : "text-verde"}`}>{estado.texto}</p>}
      </div>
      <div className="flex items-center gap-2">
        {p.unidad === "S/" && <span className="font-semibold text-slate-600">S/</span>}
        <input
          aria-label={p.descripcion}
          className="campo"
          disabled={!editable}
          type={numerico ? "number" : p.tipo === "HORA" ? "time" : "text"}
          inputMode={numerico ? "decimal" : undefined}
          min={p.minimo ?? undefined}
          max={p.maximo ?? undefined}
          step={p.tipo === "DECIMAL" ? "0.01" : undefined}
          value={valor}
          onChange={(e) => { setValor(e.target.value); setEstado(null); }}
        />
        {p.unidad && p.unidad !== "S/" && <span className="whitespace-nowrap text-slate-600">{p.unidad}</span>}
      </div>
      {editable && (
        <Boton variante="secundario" disabled={!cambiado} cargando={guardando} onClick={async () => {
          setGuardando(true);
          try {
            await api.put(`/configuracion/${p.clave}`, { valor });
            await qc.invalidateQueries({ queryKey: ["configuracion"] });
            setEstado({ tipo: "ok", texto: "Guardado (queda en la auditoría)." });
          } catch (e) {
            setEstado({ tipo: "error", texto: mensajeDeError(e) });
          } finally {
            setGuardando(false);
          }
        }}><Check className="size-5" aria-hidden /> Guardar</Boton>
      )}
    </li>
  );
}

export default function Configuracion() {
  const { yo } = useSesion();
  const editable = tiene(yo, "core.configuracion.editar");
  const { data, isLoading, error } = useQuery({ queryKey: ["configuracion"], queryFn: () => api.get<Parametro[]>("/configuracion").then((r) => r.data) });
  if (isLoading) return <Cargando />;
  if (error) return <Alerta>{mensajeDeError(error)}</Alerta>;
  const categorias = [...new Set(data!.map((p) => p.categoria))];
  return (
    <>
      <Encabezado titulo="Configuración general" subtitulo="Topes, porcentajes y parámetros del sistema. Ninguno está fijo en el código." />
      {!editable && <div className="mb-4"><Alerta tipo="info">Solo lectura: tu rol puede ver la configuración pero no cambiarla.</Alerta></div>}
      <div className="space-y-6">
        {categorias.map((c) => (
          <section key={c} className="tarjeta px-5 py-2">
            <h2 className="pt-3 text-lg font-bold">{c}</h2>
            <ul className="divide-y divide-slate-100">
              {data!.filter((p) => p.categoria === c).map((p) => <Fila key={`${p.clave}-${p.updatedAt}`} p={p} editable={editable} />)}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
