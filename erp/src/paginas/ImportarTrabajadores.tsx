import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Alerta, Boton, Cargando, Encabezado, Insignia, ModalMotivo, Seleccion, fechaHora } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import type { Importacion, ObraResumen } from "../lib/tipos";

const ESTADO = {
  PREVIA: { label: "Vista previa", color: "azul" },
  CONFIRMADA: { label: "Confirmada", color: "verde" },
  REVERTIDA: { label: "Revertida", color: "rojo" },
  DESCARTADA: { label: "Descartada", color: "gris" },
} as const;

const COLUMNAS: [string, string][] = [
  ["documento", "Documento"], ["apellidos", "Apellidos"], ["nombres", "Nombres"], ["categoria", "Categoría"], ["cargo", "Cargo"],
  ["fechaIngreso", "Ingreso"], ["sctrVence", "SCTR vence"], ["emoVence", "EMO vence"], ["induccion", "Inducción"],
];

export default function ImportarTrabajadores() {
  const qc = useQueryClient();
  const [obraId, setObraId] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [actual, setActual] = useState<Importacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [revertir, setRevertir] = useState<string | null>(null);

  const obras = useQuery({ queryKey: ["obras", false], queryFn: () => api.get<ObraResumen[]>("/obras").then((r) => r.data) });
  const historial = useQuery({ queryKey: ["importaciones"], queryFn: () => api.get<Importacion[]>("/importaciones").then((r) => r.data) });

  const correr = async (fn: () => Promise<void>) => {
    setError(null);
    setOcupado(true);
    try {
      await fn();
      qc.invalidateQueries({ queryKey: ["importaciones"] });
      qc.invalidateQueries({ queryKey: ["trabajadores"] });
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setOcupado(false);
    }
  };

  const descargarPlantilla = () => correr(async () => {
    const { data } = await api.get<Blob>("/importaciones/trabajadores/plantilla", { responseType: "blob" });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-trabajadores.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  });

  return (
    <>
      <Link to="/trabajadores" className="mb-3 inline-flex min-h-12 items-center gap-2 font-semibold text-slate-600 hover:text-naranja">
        <ArrowLeft className="size-5" aria-hidden /> Trabajadores
      </Link>
      <Encabezado
        titulo="Importar trabajadores desde Excel"
        subtitulo="Descarga la plantilla, llénala y súbela. Verás una vista previa fila por fila: nada se guarda hasta que confirmes."
        acciones={<Boton variante="secundario" onClick={descargarPlantilla}><Download className="size-5" aria-hidden /> Descargar plantilla</Boton>}
      />
      {error && <div className="mb-4"><Alerta>{error}</Alerta></div>}

      {!actual && (
        <form className="tarjeta mb-6 grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={(e) => {
          e.preventDefault();
          if (!archivo) return setError("Elige el archivo Excel");
          correr(async () => {
            const fd = new FormData();
            fd.append("archivo", archivo);
            setActual((await api.post<Importacion>("/importaciones/trabajadores", fd, { params: { obraId } })).data);
          });
        }}>
          <Seleccion label="Obra a la que se asignan" required vacio="Elige la obra" value={obraId} onChange={(e) => setObraId(e.target.value)}
            opciones={(obras.data ?? []).filter((o) => o.estado !== "ANULADA" && o.estado !== "CULMINADA").map((o) => ({ valor: o.id, label: `${o.codigo} · ${o.nombre}` }))} />
          <label className="block">
            <span className="mb-1 block font-semibold">Archivo Excel (.xlsx)</span>
            <input type="file" required accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="block min-h-12 w-full text-base"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
          </label>
          <Boton type="submit" cargando={ocupado}><Upload className="size-5" aria-hidden /> Ver vista previa</Boton>
        </form>
      )}

      {actual && (
        <section className="tarjeta mb-6 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">{actual.archivoNombre}</h2>
              <p className="text-slate-600">
                Obra {actual.obra} · {actual.total} filas · <span className="font-semibold text-green-700">{actual.validas} correctas</span>
                {actual.conError > 0 && <> · <span className="font-semibold text-red-700">{actual.conError} con errores</span></>}
              </p>
            </div>
            <Insignia color={ESTADO[actual.estado].color}>{ESTADO[actual.estado].label}</Insignia>
          </div>
          {actual.estado === "PREVIA" && actual.conError > 0 && (
            <div className="mb-4"><Alerta tipo="aviso">Las filas con error no se importarán. Puedes corregirlas en el Excel y volver a subirlo, o confirmar solo las correctas.</Alerta></div>
          )}
          <div className="max-h-[55vh] overflow-auto">
            <table className="tabla w-full min-w-[900px]">
              <thead className="sticky top-0 bg-white"><tr><th>Fila</th>{COLUMNAS.map(([, t]) => <th key={t}>{t}</th>)}<th>Resultado</th></tr></thead>
              <tbody>
                {actual.filas.map((f) => (
                  <tr key={f.fila} className={f.errores.length ? "bg-red-50" : ""}>
                    <td>{f.fila}</td>
                    {COLUMNAS.map(([k]) => <td key={k} className="text-sm">{f.datos[k] || "—"}</td>)}
                    <td className="text-sm">{f.errores.length ? <ul className="list-disc pl-4 text-red-700">{f.errores.map((e) => <li key={e}>{e}</li>)}</ul> : <span className="text-green-700">Correcta</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            {actual.estado === "PREVIA" ? (
              <>
                <Boton variante="secundario" cargando={ocupado} onClick={() => correr(async () => {
                  await api.post(`/importaciones/${actual.id}/descartar`);
                  setActual(null);
                })}>Descartar</Boton>
                <Boton disabled={actual.validas === 0} cargando={ocupado} onClick={() => correr(async () => {
                  setActual((await api.post<Importacion>(`/importaciones/${actual.id}/confirmar`)).data);
                })}>Confirmar {actual.validas} trabajadores</Boton>
              </>
            ) : (
              <Boton onClick={() => { setActual(null); setArchivo(null); }}>Nueva importación</Boton>
            )}
          </div>
        </section>
      )}

      <h2 className="mb-3 text-lg font-bold">Importaciones anteriores</h2>
      {historial.isLoading && <Cargando />}
      {historial.data?.length === 0 && <p className="text-slate-600">Aún no hay importaciones.</p>}
      <div className="tarjeta overflow-x-auto">
        <table className="tabla w-full min-w-[640px]">
          <thead><tr><th>Archivo</th><th>Obra</th><th>Resultado</th><th>Fecha</th><th className="text-right">Acciones</th></tr></thead>
          <tbody>
            {historial.data?.map((i) => (
              <tr key={i.id}>
                <td><span className="font-semibold">{i.archivoNombre}</span><span className="block text-sm text-slate-500">por {i.creadoPor}</span></td>
                <td>{i.obra}</td>
                <td><Insignia color={ESTADO[i.estado].color}>{ESTADO[i.estado].label}</Insignia> <span className="text-sm">{i.validas}/{i.total}</span></td>
                <td className="text-sm">{fechaHora(i.createdAt)}</td>
                <td className="text-right whitespace-nowrap">
                  {i.estado === "PREVIA" && (
                    <Boton variante="secundario" onClick={() => correr(async () => setActual((await api.get<Importacion>(`/importaciones/${i.id}`)).data))}>Abrir</Boton>
                  )}
                  {i.estado === "CONFIRMADA" && <Boton variante="fantasma" onClick={() => setRevertir(i.id)}>Revertir</Boton>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalMotivo
        abierto={revertir !== null}
        titulo="Revertir importación"
        descripcion="Se anulan los trabajadores, asignaciones y documentos creados por esta importación (no se borran). No procede si alguno ya marcó asistencia."
        accion="Revertir"
        onCerrar={() => setRevertir(null)}
        onConfirmar={async (motivo) => {
          try {
            await api.post(`/importaciones/${revertir}/revertir`, { motivo });
            qc.invalidateQueries({ queryKey: ["importaciones"] });
            qc.invalidateQueries({ queryKey: ["trabajadores"] });
          } catch (e) {
            throw new Error(mensajeDeError(e));
          }
        }}
      />
    </>
  );
}
