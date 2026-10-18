import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CloudOff, Plus, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import MapaObra from "../componentes/MapaObra";
import { Alerta, AreaTexto, Boton, Campo, Cargando, Encabezado, Insignia, Modal, ModalMotivo, Seleccion, fechaHora } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import { RESULTADO, esGrave, hora, hoyLima, textoCelular, textoSenal, textoZona } from "../lib/asistencia";
import { tiene, tieneEnObra } from "../lib/menu";
import { useSesion } from "../lib/sesion";
import type { Comision, MarcajeDetalle, MarcajeFila, ObraResumen, Pagina, Presente, TrabajadorResumen } from "../lib/tipos";

type Pestana = "revision" | "marcajes" | "presentes" | "comisiones";

export default function Asistencia() {
  const { yo } = useSesion();
  const [params, setParams] = useSearchParams();
  const pestana = (params.get("ver") as Pestana) ?? "revision";
  const [obraId, setObraId] = useState("");
  const obras = useQuery({ queryKey: ["obras", false], queryFn: () => api.get<ObraResumen[]>("/obras").then((r) => r.data) });
  const pendientes = useQuery({
    queryKey: ["marcajes", "PENDIENTE", obraId],
    queryFn: () => api.get<Pagina<MarcajeFila>>("/marcajes", { params: { resultado: "PENDIENTE", obraId: obraId || undefined, size: 1 } }).then((r) => r.data.totalItems),
  });

  // Con una sola obra, se elige sola (Presentes y Comisiones la necesitan).
  useEffect(() => {
    if (!obraId && obras.data?.length === 1) setObraId(obras.data[0].id);
  }, [obras.data, obraId]);

  const pestanas: { id: Pestana; texto: string; ver: boolean }[] = [
    { id: "revision", texto: `Por revisar${pendientes.data ? ` (${pendientes.data})` : ""}`, ver: true },
    { id: "marcajes", texto: "Marcajes", ver: true },
    { id: "presentes", texto: "Quién marcó hoy", ver: true },
    { id: "comisiones", texto: "Comisiones", ver: tiene(yo, "campo.comision.gestionar") || tiene(yo, "campo.marcaje.ver") },
  ];

  return (
    <>
      <Encabezado
        titulo="Asistencia"
        subtitulo="El servidor valida cada marcaje (ubicación, celular, documentos). Aquí revisas los dudosos y registras comisiones."
      />
      <div className="mb-4 grid gap-3 sm:max-w-md">
        <Seleccion label="Obra" vacio="Todas mis obras" value={obraId} onChange={(e) => setObraId(e.target.value)}
          opciones={(obras.data ?? []).map((o) => ({ valor: o.id, label: `${o.codigo} · ${o.nombre}` }))} />
      </div>
      <div role="tablist" className="mb-4 flex gap-2 overflow-x-auto border-b border-slate-200">
        {pestanas.filter((p) => p.ver).map((p) => (
          <button key={p.id} role="tab" aria-selected={pestana === p.id} onClick={() => setParams({ ver: p.id })}
            className={`min-h-12 whitespace-nowrap border-b-4 px-4 font-semibold ${pestana === p.id ? "border-naranja text-grafito" : "border-transparent text-slate-500 hover:text-grafito"}`}>
            {p.texto}
          </button>
        ))}
      </div>
      {pestana === "revision" && <ListaMarcajes obraId={obraId} soloPendientes />}
      {pestana === "marcajes" && <ListaMarcajes obraId={obraId} />}
      {pestana === "presentes" && <Presentes obraId={obraId} />}
      {pestana === "comisiones" && <Comisiones obraId={obraId} obras={obras.data ?? []} />}
    </>
  );
}

// ─── Marcajes ────────────────────────────────────────────────────────────────

function ListaMarcajes({ obraId, soloPendientes }: { obraId: string; soloPendientes?: boolean }) {
  const [fecha, setFecha] = useState(soloPendientes ? "" : hoyLima());
  const [resultado, setResultado] = useState("");
  const [pagina, setPagina] = useState(0);
  const [abierto, setAbierto] = useState<string | null>(null);
  const filtroRes = soloPendientes ? "PENDIENTE" : resultado;
  const { data, isLoading, error } = useQuery({
    queryKey: ["marcajes", filtroRes, obraId, fecha, pagina],
    queryFn: () => api.get<Pagina<MarcajeFila>>("/marcajes", {
      params: { resultado: filtroRes || undefined, obraId: obraId || undefined, fecha: fecha || undefined, page: pagina, size: 50 },
    }).then((r) => r.data),
  });

  return (
    <>
      {!soloPendientes && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Campo label="Día" type="date" value={fecha} onChange={(e) => { setFecha(e.target.value); setPagina(0); }} />
          <Seleccion label="Resultado" vacio="Todos" value={resultado} onChange={(e) => { setResultado(e.target.value); setPagina(0); }}
            opciones={[{ valor: "VALIDO", label: "Válidos" }, { valor: "EN_REVISION", label: "En revisión" }, { valor: "RECHAZADO", label: "Rechazados" }]} />
        </div>
      )}
      {soloPendientes && <p className="mb-3 text-slate-600">Marcajes que el sistema no pudo aceptar ni rechazar solo. Abre cada uno, mira la ubicación y la selfie, y decide.</p>}
      {isLoading && <Cargando />}
      {error && <Alerta>{mensajeDeError(error)}</Alerta>}
      {data?.items.length === 0 && (
        <div className="tarjeta p-8 text-center text-slate-600">{soloPendientes ? "No hay marcajes pendientes de revisión." : "No hay marcajes con este filtro."}</div>
      )}
      {!!data?.items.length && (
        <div className="tarjeta overflow-x-auto">
          <table className="tabla w-full min-w-[760px]">
            <thead><tr><th>Hora</th><th>Trabajador</th><th>Tipo</th><th>Resultado</th><th>Observaciones</th></tr></thead>
            <tbody>
              {data.items.map((m) => (
                <tr key={m.id} className="cursor-pointer hover:bg-orange-50/50" onClick={() => setAbierto(m.id)}>
                  <td className="whitespace-nowrap">
                    <button type="button" className="font-semibold hover:text-naranja" onClick={() => setAbierto(m.id)}>{fechaHora(m.hora)}</button>
                    {m.offline && <span className="flex items-center gap-1 text-sm text-slate-500"><CloudOff className="size-4" aria-hidden /> sin conexión</span>}
                  </td>
                  <td><span className="font-semibold">{m.trabajador}</span><span className="block text-sm text-slate-500">{m.documento}{m.obra ? ` · ${m.obra}` : ""}</span></td>
                  <td>{m.tipo === "ENTRADA" ? "Entrada" : "Salida"}</td>
                  <td>
                    <Insignia color={RESULTADO[m.resultado].color}>{RESULTADO[m.resultado].label}</Insignia>
                    {m.revisadoPor && <span className="block text-xs text-slate-500">revisado por {m.revisadoPor}</span>}
                  </td>
                  <td className="text-sm">
                    {m.senales.filter((s) => !s.startsWith("GEOCERCA:")).slice(0, 2).map((s) => (
                      <span key={s} className={`block ${esGrave(s) ? "text-red-700" : "text-amber-700"}`}>{textoSenal(s)}</span>
                    ))}
                    {m.senales.length > 2 && <span className="text-slate-500">y {m.senales.length - 2} más</span>}
                    {m.senales.length === 0 && <span className="text-slate-500">Ninguna</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Boton variante="secundario" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>Anterior</Boton>
          <span>Página {pagina + 1} de {data.totalPages}</span>
          <Boton variante="secundario" disabled={!data.hasNext} onClick={() => setPagina(pagina + 1)}>Siguiente</Boton>
        </div>
      )}
      {abierto && <DetalleMarcaje id={abierto} onCerrar={() => setAbierto(null)} />}
    </>
  );
}

function DetalleMarcaje({ id, onCerrar }: { id: string; onCerrar: () => void }) {
  const { yo } = useSesion();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["marcaje", id], queryFn: () => api.get<MarcajeDetalle>(`/marcajes/${id}`).then((r) => r.data) });
  const [selfie, setSelfie] = useState<string | null>(null);
  const [errorSelfie, setErrorSelfie] = useState<string | null>(null);
  const [comentario, setComentario] = useState("");
  const [errorRev, setErrorRev] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const puedeRevisar = tiene(yo, "campo.marcaje.revisar");

  // La selfie se descifra en el servidor y llega como blob con el token (nunca una URL pública).
  useEffect(() => () => { if (selfie) URL.revokeObjectURL(selfie); }, [selfie]);
  const verSelfie = async () => {
    setErrorSelfie(null);
    try {
      const { data: b } = await api.get<Blob>(`/marcajes/${id}/selfie`, { responseType: "blob" });
      setSelfie(URL.createObjectURL(b));
    } catch (e) {
      setErrorSelfie(mensajeDeError(e));
    }
  };

  const decidir = async (decision: "APROBADO" | "RECHAZADO") => {
    if (comentario.trim().length < 5) return setErrorRev("Explica la decisión (mínimo 5 caracteres)");
    setErrorRev(null);
    setEnviando(true);
    try {
      const { data: d } = await api.post<MarcajeDetalle>(`/marcajes/${id}/revision`, { decision, comentario: comentario.trim() });
      qc.setQueryData(["marcaje", id], d);
      qc.invalidateQueries({ queryKey: ["marcajes"] });
      qc.invalidateQueries({ queryKey: ["presentes"] });
    } catch (e) {
      setErrorRev(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  const m = data?.marcaje;
  return (
    <Modal abierto titulo="Detalle del marcaje" onCerrar={onCerrar}>
      {isLoading && <Cargando />}
      {error && <Alerta>{mensajeDeError(error)}</Alerta>}
      {data && m && (
        <div className="space-y-4">
          <div>
            <p className="text-lg font-bold">{m.trabajador}</p>
            <p className="text-slate-600">{m.documento} · {m.tipo === "ENTRADA" ? "Entrada" : "Salida"} · {fechaHora(m.hora)}{m.offline ? " (marcado sin conexión)" : ""}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Insignia color={RESULTADO[m.resultado].color}>{RESULTADO[m.resultado].label}</Insignia>
              {m.resultado !== m.resultadoOriginal && <Insignia>Originalmente: {RESULTADO[m.resultadoOriginal].label}</Insignia>}
            </div>
          </div>
          {m.motivo && <Alerta tipo={m.resultado === "RECHAZADO" ? "error" : "aviso"}>{m.motivo}</Alerta>}

          <MapaObra alto={240} centro={data.obraLat != null && data.obraLng != null ? [data.obraLat, data.obraLng] : [data.lat, data.lng]}
            radioM={data.radioM ?? 0} punto={{ lat: data.lat, lng: data.lng, etiqueta: "Aquí marcó", color: m.resultado === "VALIDO" ? "#16A34A" : "#DC2626" }} />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-slate-500">Distancia a la obra</dt><dd className="font-semibold">{m.distanciaM != null ? `${Math.round(m.distanciaM)} m` : "—"}{data.radioM ? ` (radio ${data.radioM} m)` : ""}</dd></div>
            <div><dt className="text-slate-500">Precisión del GPS</dt><dd className="font-semibold">± {Math.round(m.precisionM)} m</dd></div>
            <div><dt className="text-slate-500">Zona</dt><dd className="font-semibold">{textoZona(m.zona) ?? m.obra ?? "—"}</dd></div>
            <div><dt className="text-slate-500">Celular</dt><dd className="font-semibold">{textoCelular(data.dispositivo) ?? "—"}</dd></div>
          </dl>

          <div>
            <h3 className="mb-1 font-bold">Observaciones del sistema</h3>
            {m.senales.length === 0 ? <p className="text-slate-600">Ninguna.</p> : (
              <ul className="space-y-1">
                {m.senales.map((s) => (
                  <li key={s} className={`flex items-start gap-2 ${esGrave(s) ? "text-red-700" : s.startsWith("GEOCERCA:") || s.startsWith("COMISION") ? "text-slate-700" : "text-amber-700"}`}>
                    <span aria-hidden>•</span>{textoSenal(s)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {data.tieneSelfie && puedeRevisar && (
            <div>
              <h3 className="mb-1 font-bold">Selfie</h3>
              {selfie ? <img src={selfie} alt={`Selfie de ${m.trabajador}`} className="max-h-72 rounded-xl border border-slate-200" /> : (
                <>
                  <Boton variante="secundario" onClick={verSelfie}>Ver selfie</Boton>
                  <p className="mt-1 text-sm text-slate-500">Dato biométrico protegido: cada vista queda registrada en la auditoría.</p>
                </>
              )}
              {errorSelfie && <Alerta>{errorSelfie}</Alerta>}
            </div>
          )}

          {m.revisadoPor ? (
            <Alerta tipo="info">Revisado por {m.revisadoPor} el {fechaHora(data.revisadoAt)}: {data.revisionComentario}</Alerta>
          ) : m.resultado === "EN_REVISION" && puedeRevisar && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <AreaTexto label="Comentario de la revisión" required value={comentario} onChange={(e) => setComentario(e.target.value)}
                placeholder="Ej.: GPS impreciso, pero la selfie muestra la obra" error={errorRev ?? undefined} />
              <p className="text-sm text-slate-500">La decisión es definitiva y queda en la auditoría. El marcaje original no se modifica.</p>
              <div className="grid grid-cols-2 gap-3">
                <Boton variante="peligro" cargando={enviando} onClick={() => decidir("RECHAZADO")}>Rechazar</Boton>
                <Boton cargando={enviando} onClick={() => decidir("APROBADO")}>Aprobar</Boton>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

// ─── Presentes ──────────────────────────────────────────────────────────────

function Presentes({ obraId }: { obraId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["presentes", obraId],
    enabled: !!obraId,
    refetchInterval: 60_000,
    queryFn: () => api.get<Presente[]>("/marcajes/presentes", { params: { obraId } }).then((r) => r.data),
  });
  if (!obraId) return <div className="tarjeta p-8 text-center text-slate-600">Elige una obra para ver quién marcó hoy.</div>;
  if (isLoading) return <Cargando />;
  if (error) return <Alerta>{mensajeDeError(error)}</Alerta>;
  const enObra = data?.filter((p) => p.ultimoTipo === "ENTRADA" && p.resultado !== "RECHAZADO") ?? [];
  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="tarjeta p-4"><p className="text-sm text-slate-500">En obra ahora</p><p className="text-3xl font-bold">{enObra.length}</p></div>
        <div className="tarjeta p-4"><p className="text-sm text-slate-500">Marcaron hoy</p><p className="text-3xl font-bold">{data?.length ?? 0}</p></div>
      </div>
      {data?.length === 0 ? <div className="tarjeta p-8 text-center text-slate-600">Nadie ha marcado hoy en esta obra.</div> : (
        <div className="tarjeta overflow-x-auto">
          <table className="tabla w-full min-w-[520px]">
            <thead><tr><th>Trabajador</th><th>Último marcaje</th><th>Estado</th></tr></thead>
            <tbody>
              {data?.map((p) => (
                <tr key={p.trabajadorId}>
                  <td><span className="font-semibold">{p.trabajador}</span><span className="block text-sm text-slate-500">{p.documento}</span></td>
                  <td>{p.ultimoTipo === "ENTRADA" ? "Entrada" : "Salida"} a las {hora(p.hora)}</td>
                  <td><Insignia color={RESULTADO[p.resultado].color}>{RESULTADO[p.resultado].label}</Insignia></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ─── Comisiones ─────────────────────────────────────────────────────────────

const VIGENCIA = { PROXIMA: { t: "Próxima", c: "azul" }, VIGENTE: { t: "En curso", c: "verde" }, VENCIDA: { t: "Por cerrar", c: "ambar" } } as const;
const soles = (n: number | null) => (n == null ? "—" : n.toLocaleString("es-PE", { style: "currency", currency: "PEN" }));

function Comisiones({ obraId, obras }: { obraId: string; obras: ObraResumen[] }) {
  const { yo } = useSesion();
  const qc = useQueryClient();
  const [estado, setEstado] = useState("PROGRAMADA");
  const [nueva, setNueva] = useState(false);
  const [cerrar, setCerrar] = useState<Comision | null>(null);
  const [anular, setAnular] = useState<Comision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["comisiones", obraId, estado],
    queryFn: () => api.get<Comision[]>("/comisiones", { params: { obraId: obraId || undefined, estado: estado || undefined } }).then((r) => r.data),
  });
  const gestiona = (obra: string) => tieneEnObra(yo, "campo.comision.gestionar", obra);
  const obrasGestion = obras.filter((o) => gestiona(o.id));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="w-full sm:w-64">
          <Seleccion label="Estado" vacio="Todas" value={estado} onChange={(e) => setEstado(e.target.value)}
            opciones={[{ valor: "PROGRAMADA", label: "Programadas" }, { valor: "CERRADA", label: "Cerradas" }, { valor: "ANULADA", label: "Anuladas" }]} />
        </div>
        {obrasGestion.length > 0 && <Boton onClick={() => setNueva(true)}><Plus className="size-5" aria-hidden /> Nueva comisión</Boton>}
      </div>
      <p className="mb-3 text-slate-600">Se registra <strong>antes</strong> de la salida. Durante la ventana horaria, el trabajador puede marcar en el destino.</p>
      {error && <div className="mb-3"><Alerta>{error}</Alerta></div>}
      {isLoading && <Cargando />}
      {data?.length === 0 && <div className="tarjeta p-8 text-center text-slate-600">No hay comisiones con este filtro.</div>}
      <div className="grid gap-3 md:grid-cols-2">
        {data?.map((c) => (
          <article key={c.id} className="tarjeta space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">{c.trabajador}</p>
                <p className="text-sm text-slate-500">{c.obra}</p>
              </div>
              {c.estado === "PROGRAMADA" && c.vigencia ? <Insignia color={VIGENCIA[c.vigencia].c}>{VIGENCIA[c.vigencia].t}</Insignia>
                : <Insignia color={c.estado === "CERRADA" ? "gris" : "rojo"}>{c.estado === "CERRADA" ? "Cerrada" : "Anulada"}</Insignia>}
            </div>
            <p>{c.motivo}</p>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div><dt className="text-slate-500">Desde</dt><dd className="font-semibold">{fechaHora(c.inicio)}</dd></div>
              <div><dt className="text-slate-500">Hasta</dt><dd className="font-semibold">{fechaHora(c.fin)}</dd></div>
              <div><dt className="text-slate-500">Destino</dt><dd className="font-semibold">{c.destinoNombre ?? "—"}{c.destinoRadioM ? ` (radio ${c.destinoRadioM} m)` : ""}</dd></div>
              <div><dt className="text-slate-500">Vehículo</dt><dd className="font-semibold">{c.vehiculo ?? "—"}</dd></div>
              <div><dt className="text-slate-500">Entregado</dt><dd className="font-semibold">{soles(c.montoEntregado)}</dd></div>
              <div><dt className="text-slate-500">Rendido</dt><dd className="font-semibold">{soles(c.montoRendido)}</dd></div>
            </dl>
            {c.requiereComprobante && !c.tieneComprobante && c.estado === "PROGRAMADA" && <p className="text-sm text-amber-700">Exige foto del comprobante para cerrarse.</p>}
            <div className="flex flex-wrap gap-2 pt-1">
              {c.tieneComprobante && (
                <Boton variante="secundario" onClick={async () => {
                  setError(null);
                  try {
                    window.open((await api.get<{ url: string }>(`/comisiones/${c.id}/comprobante`)).data.url, "_blank", "noopener");
                  } catch (e) {
                    setError(mensajeDeError(e));
                  }
                }}><Receipt className="size-5" aria-hidden /> Comprobante</Boton>
              )}
              {c.estado === "PROGRAMADA" && gestiona(c.obraId) && (
                <>
                  <Boton variante="secundario" onClick={() => setCerrar(c)}>Cerrar</Boton>
                  <Boton variante="fantasma" onClick={() => setAnular(c)}>Anular</Boton>
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      {nueva && <NuevaComision obras={obrasGestion} obraInicial={obraId} onCerrar={() => setNueva(false)}
        onListo={() => { setNueva(false); qc.invalidateQueries({ queryKey: ["comisiones"] }); }} />}
      {cerrar && <CerrarComision c={cerrar} onCerrar={() => setCerrar(null)}
        onListo={() => { setCerrar(null); qc.invalidateQueries({ queryKey: ["comisiones"] }); }} />}
      <ModalMotivo
        abierto={anular !== null}
        titulo="Anular comisión"
        descripcion={`Se anula la comisión de ${anular?.trabajador}. Queda en el historial y la auditoría.`}
        accion="Anular"
        onCerrar={() => setAnular(null)}
        onConfirmar={async (motivo) => {
          try {
            await api.post(`/comisiones/${anular?.id}/anular`, { motivo });
            qc.invalidateQueries({ queryKey: ["comisiones"] });
          } catch (e) {
            throw new Error(mensajeDeError(e));
          }
        }}
      />
    </>
  );
}

/** datetime-local (hora de Lima en el navegador) → ISO. */
const aIso = (local: string) => new Date(local).toISOString();
const localAhora = (minutos = 0) => {
  const d = new Date(Date.now() + minutos * 60_000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

function NuevaComision({ obras, obraInicial, onCerrar, onListo }: { obras: ObraResumen[]; obraInicial: string; onCerrar: () => void; onListo: () => void }) {
  const [f, setF] = useState({
    obraId: obras.some((o) => o.id === obraInicial) ? obraInicial : obras.length === 1 ? obras[0].id : "",
    motivo: "", destinoNombre: "", radio: "300", inicio: localAhora(10), fin: localAhora(10 + 8 * 60), vehiculo: "", monto: "", requiereComprobante: false,
  });
  const [destino, setDestino] = useState<[number, number] | null>(null);
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const trabajadores = useQuery({
    queryKey: ["trabajadores", "", f.obraId, "ACTIVO"],
    enabled: !!f.obraId,
    queryFn: () => api.get<TrabajadorResumen[]>("/trabajadores", { params: { obraId: f.obraId, estado: "ACTIVO" } }).then((r) => r.data),
  });
  const obra = obras.find((o) => o.id === f.obraId);

  return (
    <Modal abierto titulo="Nueva comisión" onCerrar={onCerrar}>
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        if (!elegidos.length) return setError("Elige al menos un trabajador");
        setError(null);
        setEnviando(true);
        try {
          await api.post("/comisiones", {
            obraId: f.obraId, trabajadorIds: elegidos, motivo: f.motivo.trim(), destinoNombre: f.destinoNombre.trim() || null,
            destino: destino ? { lat: destino[0], lng: destino[1] } : null, destinoRadioM: destino ? Number(f.radio) : null,
            inicio: aIso(f.inicio), fin: aIso(f.fin), vehiculo: f.vehiculo.trim() || null,
            montoEntregado: f.monto ? Number(f.monto) : null, requiereComprobante: f.requiereComprobante,
          });
          onListo();
        } catch (err) {
          setError(mensajeDeError(err));
        } finally {
          setEnviando(false);
        }
      }}>
        <Seleccion label="Obra" required vacio="Elige la obra" value={f.obraId} onChange={(e) => { setF({ ...f, obraId: e.target.value }); setElegidos([]); }}
          opciones={obras.map((o) => ({ valor: o.id, label: `${o.codigo} · ${o.nombre}` }))} />
        {f.obraId && (
          <fieldset>
            <legend className="mb-1 font-semibold">Trabajadores</legend>
            {trabajadores.isLoading && <Cargando />}
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
              {trabajadores.data?.length === 0 && <p className="p-2 text-slate-500">No hay trabajadores asignados a esta obra.</p>}
              {trabajadores.data?.map((t) => (
                <label key={t.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-slate-50">
                  <input type="checkbox" className="size-5 accent-[#F7841E]" checked={elegidos.includes(t.id)}
                    onChange={(e) => setElegidos(e.target.checked ? [...elegidos, t.id] : elegidos.filter((x) => x !== t.id))} />
                  <span>{t.apellidos}, {t.nombres} <span className="text-sm text-slate-500">{t.numeroDocumento}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <Campo label="Motivo" required maxLength={300} value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })} placeholder="Ej.: Traer agregado de la cantera" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Sale" type="datetime-local" required value={f.inicio} onChange={(e) => setF({ ...f, inicio: e.target.value })} />
          <Campo label="Regresa" type="datetime-local" required value={f.fin} onChange={(e) => setF({ ...f, fin: e.target.value })} />
        </div>
        <Campo label="Destino (nombre)" value={f.destinoNombre} onChange={(e) => setF({ ...f, destinoNombre: e.target.value })} placeholder="Ej.: Cantera Río Seco" />
        <div>
          <p className="mb-1 font-semibold">Punto de destino (opcional)</p>
          <p className="mb-2 text-sm text-slate-500">Toca el mapa para marcar dónde podrá marcar asistencia. Sin punto, solo queda autorizada la salida.</p>
          <MapaObra alto={220} editable centro={destino} radioM={Number(f.radio) || 0}
            onCentro={(lat, lng) => setDestino([lat, lng])}
            punto={obra && !destino ? { lat: obra.lat, lng: obra.lng, etiqueta: "Obra", color: "#64748b" } : undefined} />
          {destino && (
            <div className="mt-2 grid grid-cols-[1fr_auto] items-end gap-3">
              <Campo label="Radio del destino (m)" type="number" min={10} max={20000} value={f.radio} onChange={(e) => setF({ ...f, radio: e.target.value })} />
              <Boton type="button" variante="secundario" onClick={() => setDestino(null)}>Quitar punto</Boton>
            </div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Vehículo" value={f.vehiculo} onChange={(e) => setF({ ...f, vehiculo: e.target.value })} placeholder="Placa o equipo" />
          <Campo label="Monto entregado (S/)" type="number" min={0} step="0.01" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} />
        </div>
        <label className="flex min-h-12 items-center gap-3">
          <input type="checkbox" className="size-5 accent-[#F7841E]" checked={f.requiereComprobante} onChange={(e) => setF({ ...f, requiereComprobante: e.target.checked })} />
          Exigir foto del comprobante para cerrarla
        </label>
        {error && <Alerta>{error}</Alerta>}
        <div className="flex justify-end gap-3">
          <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" cargando={enviando}>Registrar comisión</Boton>
        </div>
      </form>
    </Modal>
  );
}

function CerrarComision({ c, onCerrar, onListo }: { c: Comision; onCerrar: () => void; onListo: () => void }) {
  const [monto, setMonto] = useState(c.montoEntregado != null ? String(c.montoEntregado) : "");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <Modal abierto titulo="Cerrar comisión" onCerrar={onCerrar}>
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        if (c.requiereComprobante && !archivo) return setError("Esta comisión exige la foto del comprobante");
        setError(null);
        setEnviando(true);
        try {
          const fd = new FormData();
          fd.append("data", new Blob([JSON.stringify({ montoRendido: monto ? Number(monto) : null })], { type: "application/json" }));
          if (archivo) fd.append("comprobante", archivo);
          await api.post(`/comisiones/${c.id}/cerrar`, fd);
          onListo();
        } catch (err) {
          setError(mensajeDeError(err));
        } finally {
          setEnviando(false);
        }
      }}>
        <p>{c.trabajador} · {c.motivo}</p>
        {c.montoEntregado != null && <p className="text-slate-600">Se entregó {soles(c.montoEntregado)}.</p>}
        <Campo label="Monto rendido (S/)" type="number" min={0} step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} />
        <label className="block">
          <span className="mb-1 block font-semibold">Comprobante (foto o PDF){c.requiereComprobante ? " *" : ""}</span>
          <input type="file" accept="image/jpeg,image/png,application/pdf" capture="environment" className="block min-h-12 w-full text-base"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
        </label>
        {error && <Alerta>{error}</Alerta>}
        <div className="flex justify-end gap-3">
          <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" cargando={enviando}>Cerrar comisión</Boton>
        </div>
      </form>
    </Modal>
  );
}
