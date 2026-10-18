// Geoman se registra sobre window.L: hay que exponer Leaflet ANTES de importarlo.
import L from "leaflet";

declare global {
  interface Window {
    L: typeof L;
  }
}

window.L = L;
export default L;
