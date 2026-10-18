import type { Yo } from "./tipos";

/** ¿Tiene el permiso en alguna obra o de forma global? (Solo para mostrar/ocultar: el servidor decide.) */
export function tiene(yo: Yo | null, permiso: string): boolean {
  if (!yo || yo.debeCambiarPassword) return false;
  return yo.permisosGlobales.includes(permiso) || (yo.permisosPorObra[permiso]?.length ?? 0) > 0;
}

export function tieneEnObra(yo: Yo | null, permiso: string, obraId: string): boolean {
  if (!yo || yo.debeCambiarPassword) return false;
  return yo.permisosGlobales.includes(permiso) || (yo.permisosPorObra[permiso] ?? []).includes(obraId);
}

export interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
  permiso?: string;
  /** Fase en la que se construye el módulo (los que aún no existen muestran una pantalla informativa). */
  fase?: number;
  grupo: "principal" | "modulos" | "admin";
}

export const MENU: ItemMenu[] = [
  { ruta: "/", etiqueta: "Inicio", icono: "home", grupo: "principal" },
  { ruta: "/modulo/dashboard", etiqueta: "Dashboard gerencial", icono: "gauge", permiso: "dashboard.gerencial.ver", fase: 9, grupo: "principal" },
  { ruta: "/modulo/aprobaciones", etiqueta: "Aprobaciones", icono: "check", permiso: "aprobaciones.bandeja.ver", fase: 5, grupo: "principal" },
  { ruta: "/obras", etiqueta: "Obras", icono: "obra", permiso: "core.obra.ver", grupo: "principal" },
  { ruta: "/asistencia", etiqueta: "Asistencia", icono: "reloj", permiso: "campo.marcaje.ver", grupo: "modulos" },
  { ruta: "/trabajadores", etiqueta: "Trabajadores", icono: "personas", permiso: "rrhh.trabajador.ver", grupo: "modulos" },
  { ruta: "/modulo/planillas", etiqueta: "Tareo y planillas", icono: "dinero", permiso: "rrhh.modulo.ver", fase: 3, grupo: "modulos" },
  { ruta: "/modulo/almacen", etiqueta: "Almacén", icono: "caja", permiso: "inv.modulo.ver", fase: 4, grupo: "modulos" },
  { ruta: "/modulo/compras", etiqueta: "Compras", icono: "carrito", permiso: "compras.modulo.ver", fase: 5, grupo: "modulos" },
  { ruta: "/modulo/finanzas", etiqueta: "Finanzas", icono: "dinero", permiso: "fin.modulo.ver", fase: 5, grupo: "modulos" },
  { ruta: "/modulo/flota", etiqueta: "Flota y maquinaria", icono: "camion", permiso: "flota.modulo.ver", fase: 6, grupo: "modulos" },
  { ruta: "/modulo/campamento", etiqueta: "Campamento", icono: "cama", permiso: "campamento.modulo.ver", fase: 7, grupo: "modulos" },
  { ruta: "/modulo/ingenieria", etiqueta: "Ingeniería", icono: "plano", permiso: "ing.modulo.ver", fase: 8, grupo: "modulos" },
  { ruta: "/modulo/ssoma", etiqueta: "SSOMA y calidad", icono: "casco", permiso: "ssoma.modulo.ver", fase: 8, grupo: "modulos" },
  { ruta: "/modulo/subcontratistas", etiqueta: "Subcontratistas", icono: "apreton", permiso: "subcontrata.modulo.ver", fase: 8, grupo: "modulos" },
  { ruta: "/modulo/mi-portal", etiqueta: "Mi portal (boletas, EPP)", icono: "persona", permiso: "trabajador.portal.ver", fase: 3, grupo: "modulos" },
  { ruta: "/usuarios", etiqueta: "Usuarios", icono: "usuarios", permiso: "core.usuario.ver", grupo: "admin" },
  { ruta: "/roles", etiqueta: "Roles y permisos", icono: "llave", permiso: "core.rol.ver", grupo: "admin" },
  { ruta: "/configuracion", etiqueta: "Configuración", icono: "ajustes", permiso: "core.configuracion.ver", grupo: "admin" },
  { ruta: "/dispositivos", etiqueta: "Cambios de celular", icono: "celular", permiso: "core.dispositivo.aprobar", grupo: "admin" },
  { ruta: "/consentimiento", etiqueta: "Consentimiento de datos", icono: "documento", permiso: "campo.consentimiento.gestionar", grupo: "admin" },
  { ruta: "/auditoria", etiqueta: "Auditoría", icono: "historial", permiso: "audit.evento.ver", grupo: "admin" },
];

export function menuPara(yo: Yo | null): ItemMenu[] {
  return MENU.filter((m) => !m.permiso || tiene(yo, m.permiso));
}

/** Rol principal (el de menor orden) para elegir la pantalla de inicio. */
export function rolPrincipal(yo: Yo | null): string | null {
  return yo?.roles[0]?.rolCodigo ?? null;
}
