import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alerta, Boton, Cargando, Encabezado, Insignia } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import { tiene } from "../lib/menu";
import { useSesion } from "../lib/sesion";
import type { Permiso, Rol } from "../lib/tipos";

export default function Roles() {
  const { yo } = useSesion();
  const qc = useQueryClient();
  const editable = tiene(yo, "core.rol.gestionar");
  const roles = useQuery({ queryKey: ["roles"], queryFn: () => api.get<Rol[]>("/roles").then((r) => r.data) });
  const permisos = useQuery({ queryKey: ["permisos"], queryFn: () => api.get<Permiso[]>("/permisos").then((r) => r.data) });
  const [sel, setSel] = useState<string | null>(null);
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const rol = roles.data?.find((r) => r.codigo === (sel ?? roles.data?.[0]?.codigo));
  useEffect(() => {
    if (rol) setMarcados(new Set(rol.permisos));
  }, [rol]);

  const porModulo = useMemo(() => {
    const m = new Map<string, Permiso[]>();
    for (const p of permisos.data ?? []) m.set(p.modulo, [...(m.get(p.modulo) ?? []), p]);
    return [...m.entries()];
  }, [permisos.data]);

  if (roles.isLoading || permisos.isLoading) return <Cargando />;
  const cambiado = rol && (rol.permisos.length !== marcados.size || rol.permisos.some((p) => !marcados.has(p)));

  return (
    <>
      <Encabezado titulo="Roles y permisos" subtitulo="Los permisos se verifican en el servidor en cada acción; aquí defines qué incluye cada rol." />
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <nav aria-label="Roles" className="tarjeta h-fit p-2">
          <ul>
            {roles.data?.map((r) => (
              <li key={r.codigo}>
                <button type="button" onClick={() => { setSel(r.codigo); setMensaje(null); }}
                  className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-lg px-3 text-left ${rol?.codigo === r.codigo ? "bg-orange-50 font-semibold text-naranja-oscuro" : "hover:bg-slate-50"}`}>
                  <span>{r.nombre}</span>
                  <span className="text-sm text-slate-500">{r.usuarios}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {rol && (
          <section className="tarjeta p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{rol.nombre}</h2>
                <p className="text-slate-600">{rol.descripcion}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Insignia color="azul">{rol.alcance === "GLOBAL" ? "Global (todas las obras)" : "Por obra"}</Insignia>
                  {rol.requiereMfa && <Insignia color="verde"><ShieldCheck className="mr-1 size-3.5" />Exige MFA</Insignia>}
                  <Insignia>{rol.usuarios} usuario(s)</Insignia>
                </div>
              </div>
              {editable && (
                <Boton disabled={!cambiado} cargando={guardando} onClick={async () => {
                  setGuardando(true);
                  setMensaje(null);
                  try {
                    await api.put(`/roles/${rol.codigo}/permisos`, { permisos: [...marcados] });
                    await qc.invalidateQueries({ queryKey: ["roles"] });
                    setMensaje({ tipo: "exito", texto: "Permisos guardados. Aplican de inmediato a los usuarios con este rol." });
                  } catch (e) {
                    setMensaje({ tipo: "error", texto: mensajeDeError(e) });
                  } finally {
                    setGuardando(false);
                  }
                }}><Save className="size-5" aria-hidden /> Guardar</Boton>
              )}
            </div>
            {mensaje && <div className="mb-4"><Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta></div>}
            <div className="grid gap-5 md:grid-cols-2">
              {porModulo.map(([modulo, lista]) => (
                <fieldset key={modulo} className="rounded-lg border border-slate-200 p-4">
                  <legend className="px-1 font-bold">{modulo}</legend>
                  {lista.map((p) => (
                    <label key={p.codigo} className="flex min-h-12 items-start gap-3 py-1">
                      <input type="checkbox" className="mt-1 size-5 accent-[#f7841e]" disabled={!editable}
                        checked={marcados.has(p.codigo)}
                        onChange={(e) => {
                          const n = new Set(marcados);
                          if (e.target.checked) n.add(p.codigo);
                          else n.delete(p.codigo);
                          setMarcados(n);
                        }} />
                      <span>{p.descripcion}</span>
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
