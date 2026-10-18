import { useEffect, useRef, useState } from "react";
import type { Pantalla } from "../App";
import { IconoAlerta, IconoCamara, IconoCheck, IconoNube, IconoReloj, IconoX } from "../Iconos";
import { comprimir, leerUbicacion, marcar, type Resultado } from "../lib/marcaje";
import { Aviso } from "./Login";

type Paso = "camara" | "procesando" | "listo";

/**
 * Selfie + GPS + firma. La cámara solo se abre aquí, y solo se llega aquí con el consentimiento
 * firmado (Inicio redirige a Consentimiento si falta). El GPS se lee una sola vez, al confirmar.
 */
export default function Marcar({ ir, tipo }: { ir: (p: Pantalla) => void; tipo: "ENTRADA" | "SALIDA" }) {
  const video = useRef<HTMLVideoElement>(null);
  const [paso, setPaso] = useState<Paso>("camara");
  const [mensaje, setMensaje] = useState("Preparando la cámara…");
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [enCola, setEnCola] = useState(false);
  const [lista, setLista] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let vivo = true;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 } }, audio: false })
      .then((s) => {
        if (!vivo) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        if (video.current) {
          video.current.srcObject = s;
          void video.current.play();
        }
      })
      .catch(() => setError("Activa el permiso de cámara para marcar (se necesita la selfie)."));
    return () => {
      vivo = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const confirmar = async () => {
    if (!video.current) return;
    setError(null);
    try {
      const selfie = await comprimir(video.current);
      (video.current.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop());
      setPaso("procesando");
      setMensaje("Obteniendo tu ubicación…");
      const u = await leerUbicacion();
      setMensaje("Enviando marcaje…");
      const r = await marcar(tipo, selfie, u);
      setResultado(r.resultado ?? null);
      setEnCola(!!r.enCola);
      setPaso("listo");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo marcar");
      setPaso("listo");
    }
  };

  if (paso === "listo") {
    const r = resultado;
    const visual = enCola
      ? { color: "bg-sky-600", Icono: IconoNube, titulo: "Guardado sin señal", texto: "Se enviará solo cuando vuelva la conexión. Se respeta la hora en que marcaste." }
      : !r ? { color: "bg-rojo", Icono: IconoX, titulo: "No se pudo marcar", texto: error ?? "" }
      : r.resultado === "VALIDO" ? { color: "bg-verde", Icono: IconoCheck, titulo: `${tipo === "ENTRADA" ? "Entrada" : "Salida"} registrada`, texto: r.motivo ?? r.obra ?? "" }
      : r.resultado === "EN_REVISION" ? { color: "bg-ambar", Icono: IconoReloj, titulo: "Marcaje en revisión", texto: "El Adm. de Obra lo revisará. " + (r.motivo ?? "") }
      : { color: "bg-rojo", Icono: IconoAlerta, titulo: "Marcaje rechazado", texto: r.motivo ?? "" };
    return (
      <div className="flex flex-1 flex-col items-center gap-5 text-center">
        <div className={`mt-6 flex size-28 items-center justify-center rounded-full text-white ${visual.color}`}>
          <visual.Icono className="size-16" />
        </div>
        <h1 className="text-2xl font-extrabold">{visual.titulo}</h1>
        <p className="text-lg text-slate-700">{visual.texto}</p>
        {r && <p className="text-slate-500">{new Date(r.horaMarcaje).toLocaleString("es-PE")}</p>}
        <button className="boton-primario mt-auto" onClick={() => ir({ id: "inicio" })}>Listo</button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Marcar {tipo === "ENTRADA" ? "entrada" : "salida"}</h1>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-900">
        <video ref={video} playsInline muted className="size-full -scale-x-100 object-cover" onPlaying={() => setLista(true)} aria-label="Vista de la cámara frontal" />
        {!lista && !error && <p className="absolute inset-0 flex items-center justify-center text-white">{mensaje}</p>}
        {paso === "procesando" && <p className="absolute inset-x-0 bottom-0 bg-black/70 p-4 text-center text-lg font-semibold text-white">{mensaje}</p>}
      </div>
      {error && <Aviso>{error}</Aviso>}
      <p className="text-center text-base text-slate-600">Mira a la cámara. Tu ubicación se toma solo en este momento.</p>
      <button className="boton-primario mt-auto min-h-20 text-2xl" disabled={!lista || paso !== "camara"} onClick={() => void confirmar()}>
        <IconoCamara className="size-8" /> Tomar foto y marcar
      </button>
      <button className="boton-secundario" onClick={() => ir({ id: "inicio" })}>Cancelar</button>
    </div>
  );
}
