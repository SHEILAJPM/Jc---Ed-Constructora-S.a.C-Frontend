import L from "./leafletGlobal";
import "@geoman-io/leaflet-geoman-free";
import { useEffect, useMemo } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Polygon, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import type { Geocerca } from "../lib/tipos";

// Pin propio en SVG (evita depender de las imágenes por defecto de Leaflet).
const PIN = L.divIcon({
  className: "",
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg"><path d="M17 43C17 43 32 27 32 16A15 15 0 0 0 2 16C2 27 17 43 17 43Z" fill="#F7841E" stroke="#1E293B" stroke-width="2"/><circle cx="17" cy="16" r="6" fill="#fff"/></svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 43],
});

const COLOR_TIPO: Record<string, string> = {
  CANTERA: "#a16207", BOTADERO: "#7c3aed", CAMPAMENTO: "#0284c7", ALMACEN: "#16a34a", OTRO: "#64748b",
};

/** Lima por defecto si la obra aún no tiene punto. */
export const CENTRO_LIMA: [number, number] = [-12.0464, -77.0428];

function AlClic({ onClic }: { onClic?: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onClic?.(e.latlng.lat, e.latlng.lng) });
  return null;
}

function Recentrar({ centro }: { centro: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(centro, map.getZoom(), { animate: true });
    // Solo al cambiar de obra (lat/lng iniciales), no en cada arrastre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centro[0].toFixed(3), centro[1].toFixed(3)]);
  return null;
}

/** Barra de dibujo de Geoman: solo polígonos. Al cerrar el polígono se entrega y se quita del mapa. */
function DibujoPoligono({ onPoligono }: { onPoligono: (puntos: [number, number][]) => void }) {
  const map = useMap();
  useEffect(() => {
    map.pm.setLang("es");
    map.pm.addControls({
      position: "topleft",
      drawPolygon: true, drawMarker: false, drawCircleMarker: false, drawPolyline: false, drawRectangle: false,
      drawCircle: false, drawText: false, editMode: false, dragMode: false, cutPolygon: false, removalMode: false, rotateMode: false,
    });
    const alCrear = (e: { layer: L.Layer }) => {
      const capa = e.layer as L.Polygon;
      const anillo = (capa.getLatLngs()[0] as L.LatLng[]).map((p) => [p.lat, p.lng] as [number, number]);
      capa.remove();
      onPoligono(anillo);
    };
    map.on("pm:create", alCrear);
    return () => {
      map.off("pm:create", alCrear);
      map.pm.removeControls();
    };
  }, [map, onPoligono]);
  return null;
}

export default function MapaObra({ centro, radioM, geocercas = [], editable, onCentro, onPoligono, alto = 420, punto }: {
  centro: [number, number] | null;
  radioM: number;
  geocercas?: Geocerca[];
  editable?: boolean;
  onCentro?: (lat: number, lng: number) => void;
  onPoligono?: (puntos: [number, number][]) => void;
  alto?: number;
  /** Punto extra (p. ej. dónde marcó el trabajador). */
  punto?: { lat: number; lng: number; etiqueta: string; color?: string };
}) {
  const vista = centro ?? CENTRO_LIMA;
  const eventosMarcador = useMemo(
    () => ({
      dragend: (e: L.DragEndEvent) => {
        const p = (e.target as L.Marker).getLatLng();
        onCentro?.(p.lat, p.lng);
      },
    }),
    [onCentro],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200" style={{ height: alto }}>
      <MapContainer center={vista} zoom={centro ? 16 : 12} className="size-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Recentrar centro={vista} />
        {editable && <AlClic onClic={onCentro} />}
        {editable && onPoligono && <DibujoPoligono onPoligono={onPoligono} />}
        {centro && (
          <>
            <Circle center={centro} radius={radioM} pathOptions={{ color: "#F7841E", weight: 2, fillOpacity: 0.15 }} />
            <Marker position={centro} icon={PIN} draggable={editable} eventHandlers={eventosMarcador}>
              <Tooltip direction="top" offset={[0, -40]}>Punto de marcaje · radio {radioM} m</Tooltip>
            </Marker>
          </>
        )}
        {punto && (
          <CircleMarker center={[punto.lat, punto.lng]} radius={9} pathOptions={{ color: "#1E293B", weight: 2, fillColor: punto.color ?? "#2563eb", fillOpacity: 0.9 }}>
            <Tooltip direction="top" permanent>{punto.etiqueta}</Tooltip>
          </CircleMarker>
        )}
        {geocercas.map((g) => (
          <Polygon key={g.id} positions={g.puntos} pathOptions={{ color: COLOR_TIPO[g.tipo] ?? "#64748b", weight: 2, fillOpacity: 0.2 }}>
            <Tooltip sticky>{g.nombre} · {g.tipo.toLowerCase()}</Tooltip>
          </Polygon>
        ))}
      </MapContainer>
    </div>
  );
}
