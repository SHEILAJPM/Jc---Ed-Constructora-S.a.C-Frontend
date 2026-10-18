import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import FormularioObra, { aCuerpo, valoresIniciales } from "../componentes/FormularioObra";
import MapaObra from "../componentes/MapaObra";
import { Alerta, Encabezado } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import type { ObraDetalle, Parametro } from "../lib/tipos";

export default function ObraNueva() {
  const navegar = useNavigate();
  const qc = useQueryClient();
  const [centro, setCentro] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // El radio por defecto viene de la configuración (nunca fijo en el código).
  const config = useQuery({
    queryKey: ["configuracion"],
    queryFn: () => api.get<Parametro[]>("/configuracion").then((r) => r.data),
  });
  const radioDefecto = Number(config.data?.find((p) => p.clave === "geocerca.radio_defecto_m")?.valor ?? 150);
  const [radio, setRadio] = useState<number | null>(null);
  const radioM = radio ?? radioDefecto;
  const alCentro = useCallback((lat: number, lng: number) => setCentro([lat, lng]), []);

  return (
    <>
      <Encabezado titulo="Nueva obra" subtitulo="Toca el mapa para fijar el punto de marcaje y ajusta el radio de la geocerca." />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="tarjeta p-5 xl:order-2">
          <MapaObra centro={centro} radioM={radioM} editable onCentro={alCentro} />
          <label className="mt-4 block">
            <span className="etiqueta">Radio de la geocerca: <strong className="text-grafito">{radioM} m</strong></span>
            <input type="range" min={10} max={2000} step={10} value={radioM} onChange={(e) => setRadio(Number(e.target.value))}
              className="mt-2 h-12 w-full accent-[#f7841e]" aria-label="Radio de la geocerca en metros" />
          </label>
          {centro && <p className="text-sm text-slate-500">Punto: {centro[0].toFixed(6)}, {centro[1].toFixed(6)}</p>}
        </div>
        <div className="tarjeta p-5 xl:order-1">
          {error && <div className="mb-4"><Alerta>{error}</Alerta></div>}
          <FormularioObra
            inicial={valoresIniciales()}
            textoBoton="Crear obra"
            onGuardar={async (d) => {
              setError(null);
              if (!centro) return setError("Marca la ubicación de la obra en el mapa.");
              try {
                const { data } = await api.post<ObraDetalle>("/obras", { ...aCuerpo(d), centro: { lat: centro[0], lng: centro[1] }, radioM });
                await qc.invalidateQueries({ queryKey: ["obras"] });
                navegar(`/obras/${data.id}`);
              } catch (e) {
                setError(mensajeDeError(e));
              }
            }}
          />
        </div>
      </div>
    </>
  );
}
