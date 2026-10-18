import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet, Plus, Smartphone } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Alerta, Boton, Campo, Cargando, Encabezado, Insignia, Modal, Seleccion } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import { tiene } from "../lib/menu";
import { useSesion } from "../lib/sesion";
import type { ObraResumen, TrabajadorDetalle, TrabajadorResumen } from "../lib/tipos";

export const CATEGORIAS = [
  { valor: "OPERARIO", label: "Operario" }, { valor: "OFICIAL", label: "Oficial" }, { valor: "PEON", label: "Peón" },
  { valor: "CAPATAZ", label: "Capataz" }, { valor: "STAFF", label: "Staff" }, { valor: "OTRO", label: "Otro" },
];

const hoy = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });

export default function Trabajadores() {
  const { yo } = useSesion();
  const qc = useQueryClient();
  const navegar = useNavigate();
  const [q, setQ] = useState("");
  const [obraId, setObraId] = useState("");
  const [estado, setEstado] = useState("ACTIVO");
  const [nuevo, setNuevo] = useState(false);
  const [form, setForm] = useState({ tipoDocumento: "DNI", numeroDocumento: "", nombres: "", apellidos: "", categoria: "OPERARIO", cargo: "", fechaIngreso: hoy(), obraId: "" });
  const [error, setError] = useState<string | null>(null);

  const obras = useQuery({ queryKey: ["obras", false], queryFn: () => api.get<ObraResumen[]>("/obras").then((r) => r.data) });
  const { data, isLoading } = useQuery({
    queryKey: ["trabajadores", q, obraId, estado],
    queryFn: () => api.get<TrabajadorResumen[]>("/trabajadores", { params: { q: q || undefined, obraId: obraId || undefined, estado } }).then((r) => r.data),
  });
  const gestionar = tiene(yo, "rrhh.trabajador.gestionar");

  return (
    <>
      <Encabezado
        titulo="Trabajadores"
        subtitulo="Legajo, documentos con vencimiento, asignación a obra y acceso a la app de marcaje."
        acciones={gestionar && (
          <>
            {tiene(yo, "rrhh.importacion.gestionar") && (
              <Link to="/trabajadores/importar" className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 font-semibold hover:bg-slate-50">
                <FileSpreadsheet className="size-5" aria-hidden /> Importar Excel
              </Link>
            )}
            <Boton onClick={() => { setNuevo(true); setError(null); }}><Plus className="size-5" aria-hidden /> Nuevo trabajador</Boton>
          </>
        )}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Campo label="Buscar" placeholder="Nombre o documento" value={q} onChange={(e) => setQ(e.target.value)} />
        <Seleccion label="Obra" vacio="Todas" value={obraId} onChange={(e) => setObraId(e.target.value)}
          opciones={(obras.data ?? []).map((o) => ({ valor: o.id, label: `${o.codigo} · ${o.nombre}` }))} />
        <Seleccion label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)}
          opciones={[{ valor: "ACTIVO", label: "Activos" }, { valor: "CESADO", label: "Cesados" }]} />
      </div>
      {isLoading && <Cargando />}
      {data?.length === 0 && <div className="tarjeta p-8 text-center text-slate-600">No hay trabajadores con este filtro.</div>}
      <div className="tarjeta overflow-x-auto">
        <table className="tabla w-full min-w-[720px]">
          <thead><tr><th>Trabajador</th><th>Obra actual</th><th>Documentos</th><th>App</th></tr></thead>
          <tbody>
            {data?.map((t) => (
              <tr key={t.id} className="cursor-pointer hover:bg-orange-50/50" onClick={() => navegar(`/trabajadores/${t.id}`)}>
                <td>
                  <Link to={`/trabajadores/${t.id}`} className="font-semibold hover:text-naranja">{t.apellidos}, {t.nombres}</Link>
                  <span className="block text-sm text-slate-500">{t.tipoDocumento} {t.numeroDocumento} · {CATEGORIAS.find((c) => c.valor === t.categoria)?.label}{t.cargo ? ` · ${t.cargo}` : ""}</span>
                </td>
                <td className="text-sm">{t.obraActual ?? <span className="text-amber-700">Sin asignación vigente</span>}</td>
                <td className="space-x-1 space-y-1">
                  {t.documentosVencidos > 0 ? <Insignia color="rojo">{t.documentosVencidos} faltante/vencido</Insignia> : <Insignia color="verde">Al día</Insignia>}
                  {t.documentosPorVencer > 0 && <Insignia color="ambar">{t.documentosPorVencer} por vencer</Insignia>}
                </td>
                <td className="space-x-1 space-y-1">
                  {t.tieneAcceso ? <Insignia color="azul"><Smartphone className="mr-1 size-3.5" />Con acceso</Insignia> : <Insignia>Sin acceso</Insignia>}
                  {t.tieneAcceso && !t.consintio && <Insignia color="ambar">Falta consentimiento</Insignia>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal abierto={nuevo} titulo="Nuevo trabajador" onCerrar={() => setNuevo(false)}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              const { data } = await api.post<TrabajadorDetalle>("/trabajadores", {
                ...form, obraId: form.obraId || null, cargo: form.cargo || null, numeroDocumento: form.numeroDocumento.trim().toUpperCase(),
              });
              await qc.invalidateQueries({ queryKey: ["trabajadores"] });
              navegar(`/trabajadores/${data.id}`);
            } catch (err) {
              setError(mensajeDeError(err));
            }
          }}
        >
          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <Seleccion label="Documento" value={form.tipoDocumento} onChange={(e) => setForm({ ...form, tipoDocumento: e.target.value })}
              opciones={[{ valor: "DNI", label: "DNI" }, { valor: "CE", label: "C. E." }]} />
            <Campo label="Número" required inputMode={form.tipoDocumento === "DNI" ? "numeric" : "text"} maxLength={12}
              value={form.numeroDocumento} onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Nombres" required value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
            <Campo label="Apellidos" required value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
            <Seleccion label="Categoría" required value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} opciones={CATEGORIAS} />
            <Campo label="Cargo" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} placeholder="Ej.: Albañil" />
            <Campo label="Fecha de ingreso" type="date" required value={form.fechaIngreso} onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })} />
            <Seleccion label="Asignar a obra" vacio={tiene(yo, "core.usuario.gestionar") ? "Sin asignar todavía" : "Elige la obra"} value={form.obraId}
              onChange={(e) => setForm({ ...form, obraId: e.target.value })}
              opciones={(obras.data ?? []).map((o) => ({ valor: o.id, label: `${o.codigo} · ${o.nombre}` }))} />
          </div>
          {error && <Alerta>{error}</Alerta>}
          <div className="flex justify-end gap-3">
            <Boton type="button" variante="secundario" onClick={() => setNuevo(false)}>Cancelar</Boton>
            <Boton type="submit">Crear y abrir legajo</Boton>
          </div>
        </form>
      </Modal>
    </>
  );
}
