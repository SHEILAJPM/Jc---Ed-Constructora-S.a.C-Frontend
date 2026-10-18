import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, MapPinned, Save, Trash2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import FormularioObra, { aCuerpo, valoresIniciales } from "../componentes/FormularioObra";
import MapaObra from "../componentes/MapaObra";
import { Alerta, Boton, Campo, Cargando, Encabezado, ESTADO_OBRA, Insignia, Modal, ModalMotivo, Seleccion } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import { tieneEnObra } from "../lib/menu";
import { useSesion } from "../lib/sesion";
import type { Geocerca, ObraDetalle as Obra } from "../lib/tipos";

const TIPOS = [
  { valor: "CANTERA", label: "Cantera" }, { valor: "BOTADERO", label: "Botadero" }, { valor: "CAMPAMENTO", label: "Campamento" },
  { valor: "ALMACEN", label: "Almacén" }, { valor: "OTRO", label: "Otro" },
];

export default function ObraDetalle() {
  const { id = "" } = useParams();
  const { yo } = useSesion();
  const qc = useQueryClient();
  const { data: obra, isLoading, error } = useQuery({
    queryKey: ["obra", id],
    queryFn: () => api.get<Obra>(`/obras/${id}`).then((r) => r.data),
  });

  const [centro, setCentro] = useState<[number, number] | null>(null);
  const [radio, setRadio] = useState(150);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [guardandoGeo, setGuardandoGeo] = useState(false);
  const [nuevoPoligono, setNuevoPoligono] = useState<[number, number][] | null>(null);
  const [nombreGeo, setNombreGeo] = useState("");
  const [tipoGeo, setTipoGeo] = useState("CANTERA");
  const [anularGeo, setAnularGeo] = useState<Geocerca | null>(null);
  const [anularObra, setAnularObra] = useState(false);

  useEffect(() => {
    if (obra) {
      setCentro([obra.lat, obra.lng]);
      setRadio(obra.radioM);
    }
  }, [obra]);

  const alCentro = useCallback((lat: number, lng: number) => setCentro([lat, lng]), []);
  const alPoligono = useCallback((p: [number, number][]) => {
    setNuevoPoligono(p);
    setNombreGeo("");
  }, []);

  if (isLoading) return <Cargando />;
  if (error || !obra) return <Alerta>{error ? mensajeDeError(error) : "Obra no encontrada"}</Alerta>;

  const anulada = obra.estado === "ANULADA";
  const puedeEditar = !anulada && tieneEnObra(yo, "core.obra.editar", obra.id);
  const puedeGeo = !anulada && tieneEnObra(yo, "core.geocerca.editar", obra.id);
  const puedeAnular = !anulada && tieneEnObra(yo, "core.obra.anular", obra.id);
  const geoCambiada = centro && (Math.abs(centro[0] - obra.lat) > 1e-7 || Math.abs(centro[1] - obra.lng) > 1e-7 || radio !== obra.radioM);

  const refrescar = async (nueva: Obra) => {
    qc.setQueryData(["obra", id], nueva);
    await qc.invalidateQueries({ queryKey: ["obras"] });
  };

  return (
    <>
      <Encabezado
        titulo={obra.nombre}
        subtitulo={<span className="flex flex-wrap items-center gap-2"><span className="font-mono">{obra.codigo}</span><Insignia color={ESTADO_OBRA[obra.estado].color}>{ESTADO_OBRA[obra.estado].label}</Insignia></span>}
        acciones={puedeAnular && <Boton variante="secundario" onClick={() => setAnularObra(true)}><Ban className="size-5" aria-hidden /> Anular obra</Boton>}
      />
      {anulada && <div className="mb-4"><Alerta tipo="aviso">Obra anulada. Motivo: {obra.anuladoMotivo}</Alerta></div>}
      {mensaje && <div className="mb-4"><Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta></div>}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <section className="tarjeta p-5">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold"><MapPinned className="size-5 text-naranja" aria-hidden /> Geocerca de marcaje</h2>
          <p className="mb-4 text-sm text-slate-600">
            {puedeGeo ? "Arrastra el pin o toca el mapa para mover el punto. Usa el botón de polígono (arriba a la izquierda) para dibujar canteras, botaderos, etc." : "Solo lectura."}
          </p>
          {/* El mapa se crea cuando ya se conoce el punto: así abre centrado y con zoom de obra. */}
          {centro && <MapaObra
            centro={centro}
            radioM={radio}
            geocercas={obra.geocercas}
            editable={puedeGeo}
            onCentro={alCentro}
            onPoligono={puedeGeo ? alPoligono : undefined}
          />}
          {puedeGeo && (
            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex-1">
                  <span className="etiqueta">Radio: <strong className="text-grafito">{radio} m</strong></span>
                  <input type="range" min={10} max={2000} step={5} value={Math.min(radio, 2000)} onChange={(e) => setRadio(Number(e.target.value))}
                    className="mt-2 h-12 w-full accent-[#f7841e]" aria-label="Radio de la geocerca en metros" />
                </label>
                <Campo label="Metros" type="number" min={10} max={20000} value={radio} className="sm:w-32"
                  onChange={(e) => setRadio(Math.max(10, Math.min(20000, Number(e.target.value) || 10)))} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Boton
                  disabled={!geoCambiada}
                  cargando={guardandoGeo}
                  onClick={async () => {
                    setGuardandoGeo(true);
                    setMensaje(null);
                    try {
                      const { data } = await api.put<Obra>(`/obras/${id}/geocerca`, { centro: { lat: centro![0], lng: centro![1] }, radioM: radio });
                      await refrescar(data);
                      setMensaje({ tipo: "exito", texto: `Geocerca guardada: radio ${data.radioM} m.` });
                    } catch (e) {
                      setMensaje({ tipo: "error", texto: mensajeDeError(e) });
                    } finally {
                      setGuardandoGeo(false);
                    }
                  }}
                >
                  <Save className="size-5" aria-hidden /> Guardar geocerca
                </Boton>
                {geoCambiada && (
                  <Boton variante="fantasma" onClick={() => { setCentro([obra.lat, obra.lng]); setRadio(obra.radioM); }}>
                    <Undo2 className="size-5" aria-hidden /> Deshacer
                  </Boton>
                )}
              </div>
            </div>
          )}

          <h3 className="mb-2 mt-6 font-bold">Geocercas adicionales</h3>
          {obra.geocercas.length === 0 && <p className="text-slate-600">Ninguna. {puedeGeo && "Dibuja un polígono en el mapa para agregar una cantera o botadero."}</p>}
          <ul className="divide-y divide-slate-100">
            {obra.geocercas.map((g) => (
              <li key={g.id} className="flex min-h-14 items-center justify-between gap-3 py-2">
                <span>
                  <span className="font-semibold">{g.nombre}</span>
                  <span className="block text-sm text-slate-500">{g.tipo.toLowerCase()} · {Math.round(g.areaM2).toLocaleString("es-PE")} m² · {g.puntos.length} vértices</span>
                </span>
                {puedeGeo && (
                  <button type="button" onClick={() => setAnularGeo(g)} aria-label={`Anular ${g.nombre}`}
                    className="inline-flex size-12 items-center justify-center rounded-lg text-rojo hover:bg-red-50">
                    <Trash2 className="size-5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="tarjeta p-5">
          <h2 className="mb-4 text-lg font-bold">Datos de la obra</h2>
          <FormularioObra
            key={obra.updatedAt}
            inicial={valoresIniciales(obra)}
            soloLectura={!puedeEditar}
            textoBoton="Guardar cambios"
            onGuardar={async (d) => {
              setMensaje(null);
              try {
                const { data } = await api.put<Obra>(`/obras/${id}`, aCuerpo(d));
                await refrescar(data);
                setMensaje({ tipo: "exito", texto: "Datos guardados." });
              } catch (e) {
                setMensaje({ tipo: "error", texto: mensajeDeError(e) });
              }
            }}
          />
        </section>
      </div>

      <Modal abierto={!!nuevoPoligono} titulo="Nueva geocerca" onCerrar={() => setNuevoPoligono(null)}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const { data } = await api.post<Obra>(`/obras/${id}/geocercas`, {
                nombre: nombreGeo, tipo: tipoGeo, puntos: nuevoPoligono!.map(([lat, lng]) => ({ lat, lng })),
              });
              await refrescar(data);
              setNuevoPoligono(null);
              setMensaje({ tipo: "exito", texto: "Geocerca agregada." });
            } catch (err) {
              setMensaje({ tipo: "error", texto: mensajeDeError(err) });
              setNuevoPoligono(null);
            }
          }}
        >
          <p className="text-slate-600">Polígono de {nuevoPoligono?.length} vértices.</p>
          <Campo label="Nombre" required value={nombreGeo} onChange={(e) => setNombreGeo(e.target.value)} placeholder="Ej.: Cantera Km 12" />
          <Seleccion label="Tipo" value={tipoGeo} onChange={(e) => setTipoGeo(e.target.value)} opciones={TIPOS} />
          <div className="flex justify-end gap-3">
            <Boton type="button" variante="secundario" onClick={() => setNuevoPoligono(null)}>Cancelar</Boton>
            <Boton type="submit" disabled={nombreGeo.trim().length < 2}>Guardar geocerca</Boton>
          </div>
        </form>
      </Modal>

      <ModalMotivo
        abierto={!!anularGeo}
        titulo="Anular geocerca"
        descripcion={<>Se anulará <strong>{anularGeo?.nombre}</strong>. No se borra: queda en el historial.</>}
        accion="Anular"
        onCerrar={() => setAnularGeo(null)}
        onConfirmar={async (motivo) => {
          try {
            const { data } = await api.post<Obra>(`/obras/${id}/geocercas/${anularGeo!.id}/anular`, { motivo });
            await refrescar(data);
          } catch (e) {
            throw new Error(mensajeDeError(e));
          }
        }}
      />
      <ModalMotivo
        abierto={anularObra}
        titulo="Anular obra"
        descripcion={<>La obra <strong>{obra.codigo}</strong> quedará anulada y nadie podrá operar en ella. Esta acción queda auditada.</>}
        accion="Anular obra"
        onCerrar={() => setAnularObra(false)}
        onConfirmar={async (motivo) => {
          try {
            const { data } = await api.post<Obra>(`/obras/${id}/anular`, { motivo });
            await refrescar(data);
          } catch (e) {
            throw new Error(mensajeDeError(e));
          }
        }}
      />
    </>
  );
}
