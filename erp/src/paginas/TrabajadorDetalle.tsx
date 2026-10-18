import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, KeyRound, Plus, Smartphone } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { Alerta, Boton, Campo, Cargando, Encabezado, Insignia, Modal, ModalMotivo, Seleccion, fechaHora } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import { ESTADO_DISPOSITIVO, fecha, hoyLima, textoCelular } from "../lib/asistencia";
import { tiene } from "../lib/menu";
import { useSesion } from "../lib/sesion";
import type { ObraResumen, TrabajadorDetalle as Detalle } from "../lib/tipos";
import { CATEGORIAS } from "./Trabajadores";

const TIPOS_DOC = [
  { valor: "SCTR", label: "SCTR" }, { valor: "EMO", label: "Examen médico (EMO)" }, { valor: "INDUCCION", label: "Inducción" },
  { valor: "DNI", label: "DNI" }, { valor: "CONTRATO", label: "Contrato" }, { valor: "LICENCIA", label: "Licencia de conducir" }, { valor: "OTRO", label: "Otro" },
];
const SEMAFORO = { VERDE: { c: "verde", t: "Vigente" }, AMBAR: { c: "ambar", t: "Por vencer" }, ROJO: { c: "rojo", t: "Vencido" } } as const;

type Accion =
  | { tipo: "anularDoc"; id: string; nombre: string }
  | { tipo: "anularAsig"; id: string; obra: string }
  | { tipo: "desvincular" }
  | null;

export default function TrabajadorDetalle() {
  const { id } = useParams();
  const { yo } = useSesion();
  const qc = useQueryClient();
  const clave = ["trabajador", id];
  const { data: t, isLoading, error } = useQuery({ queryKey: clave, queryFn: () => api.get<Detalle>(`/trabajadores/${id}`).then((r) => r.data) });
  const obras = useQuery({ queryKey: ["obras", false], queryFn: () => api.get<ObraResumen[]>("/obras").then((r) => r.data) });

  const [modal, setModal] = useState<"editar" | "documento" | "asignacion" | "cesar" | "terminar" | null>(null);
  const [accion, setAccion] = useState<Accion>(null);
  const [terminarId, setTerminarId] = useState<string | null>(null);
  const [pin, setPin] = useState<{ documento: string; pinTemporal: string } | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  if (isLoading) return <Cargando />;
  if (error || !t) return <Alerta>{mensajeDeError(error)}</Alerta>;

  const g = t.puedeGestionar && t.estado === "ACTIVO";
  const actualizar = (d: Detalle) => {
    qc.setQueryData(clave, d);
    qc.invalidateQueries({ queryKey: ["trabajadores"] });
  };
  const ejecutar = async (fn: () => Promise<unknown>) => {
    setErrorAccion(null);
    try {
      await fn();
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    }
  };

  return (
    <>
      <Link to="/trabajadores" className="mb-3 inline-flex min-h-12 items-center gap-2 font-semibold text-slate-600 hover:text-naranja">
        <ArrowLeft className="size-5" aria-hidden /> Trabajadores
      </Link>
      <Encabezado
        titulo={`${t.apellidos}, ${t.nombres}`}
        subtitulo={<>{t.tipoDocumento} {t.numeroDocumento} · {CATEGORIAS.find((c) => c.valor === t.categoria)?.label}{t.cargo ? ` · ${t.cargo}` : ""} · ingresó el {fecha(t.fechaIngreso)}</>}
        acciones={g && (
          <>
            <Boton variante="secundario" onClick={() => setModal("editar")}>Editar datos</Boton>
            <Boton variante="peligro" onClick={() => setModal("cesar")}>Registrar cese</Boton>
          </>
        )}
      />
      {t.estado !== "ACTIVO" && (
        <div className="mb-4"><Alerta tipo="aviso">{t.estado === "CESADO" ? `Cesado el ${fecha(t.ceseFecha)}` : "Registro anulado"}{t.ceseMotivo ? ` · ${t.ceseMotivo}` : ""}</Alerta></div>
      )}
      {t.estado === "ACTIVO" && (t.bloqueos.length > 0 ? (
        <div className="mb-4"><Alerta>
          <strong>No puede marcar asistencia:</strong>
          <ul className="mt-1 list-disc pl-5">{t.bloqueos.map((b) => <li key={b}>{b.replace(/^Tu /, "")}</li>)}</ul>
        </Alerta></div>
      ) : <div className="mb-4"><Alerta tipo="exito">Documentos y asignación al día: puede marcar asistencia.</Alerta></div>)}
      {errorAccion && <div className="mb-4"><Alerta>{errorAccion}</Alerta></div>}
      {aviso && <div className="mb-4"><Alerta tipo="exito">{aviso}</Alerta></div>}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="tarjeta p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Documentos</h2>
            {g && <Boton variante="secundario" onClick={() => setModal("documento")}><Plus className="size-5" aria-hidden /> Agregar</Boton>}
          </div>
          {t.documentos.length === 0 ? <p className="text-slate-600">Aún no hay documentos registrados.</p> : (
            <div className="overflow-x-auto">
              <table className="tabla w-full min-w-[520px]">
                <thead><tr><th>Documento</th><th>Vence</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
                <tbody>
                  {t.documentos.map((d) => (
                    <tr key={d.id}>
                      <td><span className="font-semibold">{d.nombreTipo}</span>{d.numero && <span className="block text-sm text-slate-500">N.° {d.numero}</span>}</td>
                      <td>{d.venceEl ? fecha(d.venceEl) : d.emitidoEl ? `Emitido ${fecha(d.emitidoEl)}` : "—"}</td>
                      <td><Insignia color={SEMAFORO[d.semaforo].c}>{SEMAFORO[d.semaforo].t}</Insignia></td>
                      <td className="text-right whitespace-nowrap">
                        {d.tieneArchivo && (
                          <Boton variante="secundario" aria-label={`Ver archivo de ${d.nombreTipo}`}
                            onClick={() => ejecutar(async () => {
                              const { data } = await api.get<{ url: string }>(`/trabajadores/${t.id}/documentos/${d.id}/archivo`);
                              window.open(data.url, "_blank", "noopener");
                            })}>
                            <Eye className="size-5" aria-hidden /> Ver
                          </Boton>
                        )}
                        {g && <Boton variante="fantasma" onClick={() => setAccion({ tipo: "anularDoc", id: d.id, nombre: d.nombreTipo })}>Anular</Boton>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="tarjeta space-y-3 p-5">
          <h2 className="text-lg font-bold">App de marcaje</h2>
          {!t.usuarioId ? (
            <p className="text-slate-600">Todavía no tiene acceso. Al darle acceso se genera un PIN temporal que debe cambiar en su primer ingreso.</p>
          ) : (
            <dl className="space-y-2 text-sm">
              <div><dt className="text-slate-500">Ingresa con</dt><dd className="font-semibold">{t.tipoDocumento} {t.numeroDocumento} + PIN</dd></div>
              <div><dt className="text-slate-500">Celular</dt><dd className="font-semibold">
                {t.dispositivo ? <>{textoCelular(t.dispositivo)} · {ESTADO_DISPOSITIVO[t.dispositivoEstado ?? ""] ?? t.dispositivoEstado}</> : "Aún no vinculó un celular"}
              </dd></div>
              <div><dt className="text-slate-500">Consentimiento de datos</dt><dd className="font-semibold">
                {t.consentimientoAt ? `Firmado el ${fechaHora(t.consentimientoAt)} (versión ${t.consentimientoVersion})` : <span className="text-amber-700">Pendiente: lo firmará antes de su primer marcaje</span>}
              </dd></div>
              {t.debeCambiarPin && <Insignia color="ambar">Debe cambiar su PIN temporal</Insignia>}
              {t.accesoBloqueado && <Insignia color="rojo">Bloqueado por intentos fallidos</Insignia>}
            </dl>
          )}
          {g && (
            <Boton className="w-full" onClick={() => ejecutar(async () => {
              const { data } = await api.post<{ documento: string; pinTemporal: string }>(`/trabajadores/${t.id}/acceso`);
              setPin(data);
              qc.invalidateQueries({ queryKey: clave });
            })}>
              <KeyRound className="size-5" aria-hidden /> {t.usuarioId ? "Generar PIN nuevo" : "Dar acceso a la app"}
            </Boton>
          )}
          {t.usuarioId && t.dispositivo && t.dispositivoEstado === "ACTIVO" && tiene(yo, "core.dispositivo.aprobar") && (
            <Boton variante="secundario" className="w-full" onClick={() => setAccion({ tipo: "desvincular" })}>
              <Smartphone className="size-5" aria-hidden /> Desvincular celular
            </Boton>
          )}
        </section>

        <section className="tarjeta p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Asignaciones a obra</h2>
            {g && <Boton variante="secundario" onClick={() => setModal("asignacion")}><Plus className="size-5" aria-hidden /> Asignar a obra</Boton>}
          </div>
          {t.asignaciones.length === 0 ? <p className="text-slate-600">Sin asignaciones. Solo marca quien tiene una asignación vigente.</p> : (
            <div className="overflow-x-auto">
              <table className="tabla w-full min-w-[560px]">
                <thead><tr><th>Obra</th><th>Desde</th><th>Hasta</th><th>Cargo</th><th className="text-right">Acciones</th></tr></thead>
                <tbody>
                  {t.asignaciones.map((a) => (
                    <tr key={a.id}>
                      <td className="font-semibold">{a.obra} {a.vigente && <Insignia color="verde">Vigente</Insignia>}</td>
                      <td>{fecha(a.desde)}</td>
                      <td>{a.hasta ? fecha(a.hasta) : "Indefinido"}</td>
                      <td>{a.cargo ?? "—"}</td>
                      <td className="text-right whitespace-nowrap">
                        {g && !a.hasta && <Boton variante="secundario" onClick={() => { setTerminarId(a.id); setModal("terminar"); }}>Terminar</Boton>}
                        {g && <Boton variante="fantasma" onClick={() => setAccion({ tipo: "anularAsig", id: a.id, obra: a.obra })}>Anular</Boton>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {modal === "editar" && <FormDatos t={t} onCerrar={() => setModal(null)} onListo={(d) => { actualizar(d); setModal(null); }} />}
      {modal === "documento" && <FormDocumento id={t.id} onCerrar={() => setModal(null)} onListo={(d) => { actualizar(d); setModal(null); }} />}
      {modal === "asignacion" && (
        <FormAsignacion id={t.id} obras={obras.data ?? []} onCerrar={() => setModal(null)} onListo={(d) => { actualizar(d); setModal(null); }} />
      )}
      {modal === "terminar" && terminarId && (
        <FormFecha titulo="Terminar asignación" etiqueta="Último día en la obra" boton="Terminar asignación" onCerrar={() => setModal(null)}
          onEnviar={async (f) => actualizar((await api.post<Detalle>(`/trabajadores/${t.id}/asignaciones/${terminarId}/terminar`, { hasta: f })).data)} />
      )}
      {modal === "cesar" && (
        <FormFecha titulo="Registrar cese" etiqueta="Fecha de cese" boton="Registrar cese" conMotivo onCerrar={() => setModal(null)}
          onEnviar={async (f, motivo) => actualizar((await api.post<Detalle>(`/trabajadores/${t.id}/cesar`, { fecha: f, motivo })).data)} />
      )}

      <ModalMotivo
        abierto={accion !== null}
        titulo={accion?.tipo === "anularDoc" ? `Anular ${accion.nombre}` : accion?.tipo === "anularAsig" ? "Anular asignación" : "Desvincular celular"}
        descripcion={accion?.tipo === "anularDoc" ? "El documento deja de contar como vigente. No se borra: queda en el historial."
          : accion?.tipo === "anularAsig" ? `Se anula la asignación a ${accion.obra} (para corregir errores de registro).`
          : "Se cierran sus sesiones. Al volver a ingresar, su nuevo celular quedará pendiente de tu aprobación."}
        accion={accion?.tipo === "desvincular" ? "Desvincular" : "Anular"}
        onCerrar={() => setAccion(null)}
        onConfirmar={async (motivo) => {
          try {
            const url = accion?.tipo === "anularDoc" ? `/trabajadores/${t.id}/documentos/${accion.id}/anular`
              : accion?.tipo === "anularAsig" ? `/trabajadores/${t.id}/asignaciones/${accion.id}/anular`
              : `/trabajadores/${t.id}/dispositivo/desvincular`;
            actualizar((await api.post<Detalle>(url, { motivo })).data);
            if (accion?.tipo === "desvincular") setAviso("Celular desvinculado.");
          } catch (e) {
            throw new Error(mensajeDeError(e));
          }
        }}
      />

      <Modal abierto={pin !== null} titulo="PIN temporal generado" onCerrar={() => setPin(null)}>
        <div className="space-y-4">
          <p>Entrégale estos datos al trabajador. <strong>El PIN se muestra una sola vez</strong>; en su primer ingreso la app le pedirá crear uno propio.</p>
          <div className="rounded-xl bg-slate-100 p-4 text-center">
            <p className="text-sm text-slate-500">Documento</p>
            <p className="text-2xl font-bold">{pin?.documento}</p>
            <p className="mt-3 text-sm text-slate-500">PIN temporal</p>
            <p className="font-mono text-4xl font-bold tracking-[0.3em]">{pin?.pinTemporal}</p>
          </div>
          <Boton className="w-full" onClick={() => setPin(null)}>Ya lo anoté</Boton>
        </div>
      </Modal>
    </>
  );
}

function FormDatos({ t, onCerrar, onListo }: { t: Detalle; onCerrar: () => void; onListo: (d: Detalle) => void }) {
  const [f, setF] = useState({
    tipoDocumento: t.tipoDocumento, numeroDocumento: t.numeroDocumento, nombres: t.nombres, apellidos: t.apellidos,
    fechaNacimiento: t.fechaNacimiento ?? "", telefono: t.telefono ?? "", email: t.email ?? "", categoria: t.categoria, cargo: t.cargo ?? "", fechaIngreso: t.fechaIngreso,
  });
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const c = (k: keyof typeof f) => ({ value: f[k], onChange: (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value }) });
  return (
    <Modal abierto titulo="Editar datos" onCerrar={onCerrar}>
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setEnviando(true);
        try {
          const vacio = (s: string) => (s.trim() ? s.trim() : null);
          onListo((await api.put<Detalle>(`/trabajadores/${t.id}`, {
            ...f, fechaNacimiento: vacio(f.fechaNacimiento), telefono: vacio(f.telefono), email: vacio(f.email), cargo: vacio(f.cargo),
          })).data);
        } catch (err) {
          setError(mensajeDeError(err));
        } finally {
          setEnviando(false);
        }
      }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Seleccion label="Documento" {...c("tipoDocumento")} opciones={[{ valor: "DNI", label: "DNI" }, { valor: "CE", label: "C. E." }]} />
          <Campo label="Número" required {...c("numeroDocumento")} />
          <Campo label="Nombres" required {...c("nombres")} />
          <Campo label="Apellidos" required {...c("apellidos")} />
          <Seleccion label="Categoría" {...c("categoria")} opciones={CATEGORIAS} />
          <Campo label="Cargo" {...c("cargo")} />
          <Campo label="Fecha de ingreso" type="date" required {...c("fechaIngreso")} />
          <Campo label="Fecha de nacimiento" type="date" {...c("fechaNacimiento")} />
          <Campo label="Teléfono" inputMode="tel" {...c("telefono")} />
          <Campo label="Correo" type="email" {...c("email")} />
        </div>
        {error && <Alerta>{error}</Alerta>}
        <div className="flex justify-end gap-3">
          <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" cargando={enviando}>Guardar</Boton>
        </div>
      </form>
    </Modal>
  );
}

function FormDocumento({ id, onCerrar, onListo }: { id: string; onCerrar: () => void; onListo: (d: Detalle) => void }) {
  const [f, setF] = useState({ tipo: "SCTR", numero: "", emitidoEl: "", venceEl: "" });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <Modal abierto titulo="Agregar documento" onCerrar={onCerrar}>
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        if (archivo && archivo.size > 10 * 1024 * 1024) return setError("El archivo pesa más de 10 MB");
        setEnviando(true);
        try {
          const fd = new FormData();
          fd.append("data", new Blob([JSON.stringify({
            tipo: f.tipo, numero: f.numero.trim() || null, emitidoEl: f.emitidoEl || null, venceEl: f.venceEl || null,
          })], { type: "application/json" }));
          if (archivo) fd.append("archivo", archivo);
          onListo((await api.post<Detalle>(`/trabajadores/${id}/documentos`, fd)).data);
        } catch (err) {
          setError(mensajeDeError(err));
        } finally {
          setEnviando(false);
        }
      }}>
        <Seleccion label="Tipo" value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} opciones={TIPOS_DOC} />
        <Campo label="Número o póliza" value={f.numero} onChange={(e) => setF({ ...f, numero: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Fecha de emisión" type="date" value={f.emitidoEl} onChange={(e) => setF({ ...f, emitidoEl: e.target.value })} />
          <Campo label="Fecha de vencimiento" type="date" value={f.venceEl} onChange={(e) => setF({ ...f, venceEl: e.target.value })}
            ayuda={f.tipo === "INDUCCION" ? "La inducción usa la fecha de emisión; vence solo si lo indicas." : undefined} />
        </div>
        <label className="block">
          <span className="mb-1 block font-semibold">Archivo (PDF o foto, opcional)</span>
          <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="block w-full text-base"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
        </label>
        {error && <Alerta>{error}</Alerta>}
        <div className="flex justify-end gap-3">
          <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" cargando={enviando}>Guardar documento</Boton>
        </div>
      </form>
    </Modal>
  );
}

function FormAsignacion({ id, obras, onCerrar, onListo }: { id: string; obras: ObraResumen[]; onCerrar: () => void; onListo: (d: Detalle) => void }) {
  const [f, setF] = useState({ obraId: "", desde: hoyLima(), hasta: "", cargo: "" });
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <Modal abierto titulo="Asignar a obra" onCerrar={onCerrar}>
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setEnviando(true);
        try {
          onListo((await api.post<Detalle>(`/trabajadores/${id}/asignaciones`, {
            obraId: f.obraId, desde: f.desde, hasta: f.hasta || null, cargo: f.cargo.trim() || null,
          })).data);
        } catch (err) {
          setError(mensajeDeError(err));
        } finally {
          setEnviando(false);
        }
      }}>
        <Seleccion label="Obra" required vacio="Elige la obra" value={f.obraId} onChange={(e) => setF({ ...f, obraId: e.target.value })}
          opciones={obras.filter((o) => o.estado !== "ANULADA" && o.estado !== "CULMINADA").map((o) => ({ valor: o.id, label: `${o.codigo} · ${o.nombre}` }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Desde" type="date" required value={f.desde} onChange={(e) => setF({ ...f, desde: e.target.value })} />
          <Campo label="Hasta (opcional)" type="date" value={f.hasta} onChange={(e) => setF({ ...f, hasta: e.target.value })} />
        </div>
        <Campo label="Cargo en esta obra (opcional)" value={f.cargo} onChange={(e) => setF({ ...f, cargo: e.target.value })} />
        <p className="text-sm text-slate-500">Un trabajador no puede estar asignado a dos obras en las mismas fechas.</p>
        {error && <Alerta>{error}</Alerta>}
        <div className="flex justify-end gap-3">
          <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" cargando={enviando}>Asignar</Boton>
        </div>
      </form>
    </Modal>
  );
}

function FormFecha({ titulo, etiqueta, boton, conMotivo, onCerrar, onEnviar }: {
  titulo: string; etiqueta: string; boton: string; conMotivo?: boolean; onCerrar: () => void; onEnviar: (fecha: string, motivo: string) => Promise<void>;
}) {
  const [f, setF] = useState(hoyLima());
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <Modal abierto titulo={titulo} onCerrar={onCerrar}>
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        if (conMotivo && motivo.trim().length < 5) return setError("Indica el motivo (mínimo 5 caracteres)");
        setError(null);
        setEnviando(true);
        try {
          await onEnviar(f, motivo.trim());
          onCerrar();
        } catch (err) {
          setError(mensajeDeError(err));
        } finally {
          setEnviando(false);
        }
      }}>
        <Campo label={etiqueta} type="date" required value={f} onChange={(e) => setF(e.target.value)} />
        {conMotivo && <Campo label="Motivo" required value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej.: término de obra, renuncia" />}
        {conMotivo && <p className="text-sm text-slate-500">Se cierran sus asignaciones y su acceso a la app. El legajo se conserva.</p>}
        {error && <Alerta>{error}</Alerta>}
        <div className="flex justify-end gap-3">
          <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" variante={conMotivo ? "peligro" : "primario"} cargando={enviando}>{boton}</Boton>
        </div>
      </form>
    </Modal>
  );
}
