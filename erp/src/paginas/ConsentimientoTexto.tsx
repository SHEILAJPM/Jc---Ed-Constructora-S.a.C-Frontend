import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alerta, AreaTexto, Boton, Cargando, Encabezado, Insignia, fechaHora } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";

interface Texto {
  version: number;
  texto: string;
  publicadoAt: string;
  publicadoPor: string | null;
  aceptaciones: number;
}

export default function ConsentimientoTexto() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["consentimiento"], queryFn: () => api.get<Texto[]>("/consentimiento/textos").then((r) => r.data) });
  const vigente = data?.[0];
  const [texto, setTexto] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "exito"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [verVersion, setVerVersion] = useState<number | null>(null);

  useEffect(() => {
    if (vigente) setTexto(vigente.texto);
  }, [vigente]);

  if (isLoading) return <Cargando />;
  if (error) return <Alerta>{mensajeDeError(error)}</Alerta>;
  const cambio = !!vigente && texto.trim() !== vigente.texto.trim();

  return (
    <>
      <Encabezado
        titulo="Consentimiento de datos personales"
        subtitulo="Texto que cada trabajador firma en la app antes de su primer marcaje (Ley N.° 29733: selfie y ubicación son datos sensibles)."
      />
      <div className="mb-4">
        <Alerta tipo="aviso">El texto inicial es una base. Debe revisarlo el asesor legal de la empresa antes de usar el sistema con trabajadores reales.</Alerta>
      </div>
      {mensaje && <div className="mb-4"><Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta></div>}

      <section className="tarjeta mb-6 space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold">Versión vigente</h2>
          {vigente && <Insignia color="verde">Versión {vigente.version}</Insignia>}
          {vigente && <span className="text-sm text-slate-500">{vigente.aceptaciones} trabajadores la aceptaron</span>}
        </div>
        <AreaTexto label="Texto" rows={16} value={texto} onChange={(e) => { setTexto(e.target.value); setConfirmar(false); }} />
        {cambio && !confirmar && (
          <div className="flex justify-end"><Boton onClick={() => setConfirmar(true)}>Publicar como versión nueva</Boton></div>
        )}
        {cambio && confirmar && (
          <div className="space-y-3 rounded-xl bg-amber-50 p-4">
            <p><strong>¿Publicar la versión {(vigente?.version ?? 0) + 1}?</strong> Todos los trabajadores deberán leerla y aceptarla de nuevo antes de su próximo marcaje. Las versiones anteriores y sus firmas se conservan.</p>
            <div className="flex justify-end gap-3">
              <Boton variante="secundario" onClick={() => setConfirmar(false)}>Cancelar</Boton>
              <Boton cargando={enviando} onClick={async () => {
                setEnviando(true);
                setMensaje(null);
                try {
                  qc.setQueryData(["consentimiento"], (await api.post<Texto[]>("/consentimiento/textos", { texto: texto.trim() })).data);
                  setConfirmar(false);
                  setMensaje({ tipo: "exito", texto: "Versión nueva publicada." });
                } catch (e) {
                  setMensaje({ tipo: "error", texto: mensajeDeError(e) });
                } finally {
                  setEnviando(false);
                }
              }}>Sí, publicar</Boton>
            </div>
          </div>
        )}
      </section>

      {data && data.length > 1 && (
        <>
          <h2 className="mb-3 text-lg font-bold">Versiones anteriores</h2>
          <div className="space-y-2">
            {data.slice(1).map((v) => (
              <div key={v.version} className="tarjeta p-4">
                <button type="button" className="flex min-h-12 w-full items-center justify-between gap-3 text-left" onClick={() => setVerVersion(verVersion === v.version ? null : v.version)}>
                  <span><strong>Versión {v.version}</strong> · {fechaHora(v.publicadoAt)}{v.publicadoPor ? ` · ${v.publicadoPor}` : ""}</span>
                  <span className="text-sm text-slate-500">{v.aceptaciones} aceptaciones</span>
                </button>
                {verVersion === v.version && <p className="mt-2 whitespace-pre-wrap text-slate-700">{v.texto}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
