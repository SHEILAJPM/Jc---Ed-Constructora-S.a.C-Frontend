import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Smartphone } from "lucide-react";
import { useState } from "react";
import { Alerta, AreaTexto, Boton, Cargando, Encabezado, Modal, fechaHora } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import type { SolicitudDispositivo } from "../lib/tipos";

export default function Dispositivos() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dispositivos", "pendientes"],
    queryFn: () => api.get<SolicitudDispositivo[]>("/dispositivos/pendientes").then((r) => r.data),
    refetchInterval: 60_000,
  });
  const [decision, setDecision] = useState<{ s: SolicitudDispositivo; aprobar: boolean } | null>(null);

  return (
    <>
      <Encabezado
        titulo="Cambios de celular"
        subtitulo="Cada trabajador marca solo desde un celular. Si cambia de equipo, el nuevo queda en espera hasta que lo apruebes aquí."
      />
      {isLoading && <Cargando />}
      {error && <Alerta>{mensajeDeError(error)}</Alerta>}
      {data?.length === 0 && <div className="tarjeta p-8 text-center text-slate-600">No hay solicitudes pendientes.</div>}
      <div className="grid gap-3 md:grid-cols-2">
        {data?.map((s) => (
          <article key={s.id} className="tarjeta space-y-3 p-5">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-naranja"><Smartphone className="size-6" aria-hidden /></span>
              <div>
                <p className="text-lg font-bold">{s.usuarioNombre}</p>
                <p className="text-slate-600">{s.documento ?? "—"} · solicitado el {fechaHora(s.solicitadoAt)}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-slate-500">Celular nuevo</dt><dd className="font-semibold">{s.modelo ?? "Modelo desconocido"} · {s.plataforma === "ANDROID" ? "App Android" : s.plataforma === "IOS" ? "App iPhone" : "Navegador"}</dd></div>
              <div><dt className="text-slate-500">Celular actual</dt><dd className="font-semibold">{s.modeloActual ?? "Ninguno"}</dd></div>
            </dl>
            <p className="text-sm text-slate-500">Confirma con el trabajador (en persona o por teléfono) que de verdad cambió de celular antes de aprobar.</p>
            <div className="grid grid-cols-2 gap-3">
              <Boton variante="secundario" onClick={() => setDecision({ s, aprobar: false })}>Rechazar</Boton>
              <Boton onClick={() => setDecision({ s, aprobar: true })}>Aprobar</Boton>
            </div>
          </article>
        ))}
      </div>
      {decision && (
        <Decision
          {...decision}
          onCerrar={() => setDecision(null)}
          onListo={() => {
            setDecision(null);
            qc.invalidateQueries({ queryKey: ["dispositivos"] });
            qc.invalidateQueries({ queryKey: ["inicio"] });
          }}
        />
      )}
    </>
  );
}

function Decision({ s, aprobar, onCerrar, onListo }: { s: SolicitudDispositivo; aprobar: boolean; onCerrar: () => void; onListo: () => void }) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <Modal abierto titulo={aprobar ? "Aprobar celular nuevo" : "Rechazar celular"} onCerrar={onCerrar}>
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        if (motivo.trim().length < 5) return setError("Indica el motivo (mínimo 5 caracteres)");
        setError(null);
        setEnviando(true);
        try {
          await api.post(`/dispositivos/${s.id}/${aprobar ? "aprobar" : "rechazar"}`, { motivo: motivo.trim() });
          onListo();
        } catch (err) {
          setError(mensajeDeError(err));
        } finally {
          setEnviando(false);
        }
      }}>
        <p className="text-slate-700">
          {aprobar
            ? `${s.usuarioNombre} podrá marcar desde ${s.modelo ?? "el celular nuevo"}. ${s.modeloActual ? `El celular anterior (${s.modeloActual}) dejará de funcionar y se cerrarán sus sesiones.` : ""}`
            : `${s.usuarioNombre} no podrá marcar desde ese celular. Podrá volver a solicitarlo.`}
        </p>
        <AreaTexto label="Motivo" required value={motivo} onChange={(e) => setMotivo(e.target.value)} error={error ?? undefined}
          placeholder={aprobar ? "Ej.: Se le malogró el celular, confirmado por teléfono" : "Ej.: El trabajador no reconoce el cambio"} />
        <p className="text-sm text-slate-500">Queda registrado en la auditoría con tu usuario, fecha e IP.</p>
        <div className="flex justify-end gap-3">
          <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" variante={aprobar ? "primario" : "peligro"} cargando={enviando}>{aprobar ? "Aprobar" : "Rechazar"}</Boton>
        </div>
      </form>
    </Modal>
  );
}
