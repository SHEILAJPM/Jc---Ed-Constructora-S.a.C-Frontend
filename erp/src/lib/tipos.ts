export interface AsignacionYo {
  id: string;
  rolCodigo: string;
  rolNombre: string;
  alcance: "GLOBAL" | "OBRA";
  obraId: string | null;
  obraNombre: string | null;
}

export interface Yo {
  id: string;
  email: string;
  nombre: string;
  debeCambiarPassword: boolean;
  mfaHabilitado: boolean;
  roles: AsignacionYo[];
  permisosGlobales: string[];
  permisosPorObra: Record<string, string[]>;
}

export interface RespuestaSesion {
  estado: "OK" | "MFA_REQUERIDO" | "MFA_CONFIGURAR";
  desafio: string | null;
  accessToken: string | null;
  codigosRespaldo: string[] | null;
}

export interface ObraResumen {
  id: string;
  codigo: string;
  nombre: string;
  cliente: string | null;
  distrito: string | null;
  estado: EstadoObra;
  lat: number;
  lng: number;
  radioM: number;
  geocercas: number;
}

export type EstadoObra = "PLANIFICADA" | "EJECUCION" | "PARALIZADA" | "CULMINADA" | "ANULADA";

export interface Geocerca {
  id: string;
  nombre: string;
  tipo: "CANTERA" | "BOTADERO" | "CAMPAMENTO" | "ALMACEN" | "OTRO";
  puntos: [number, number][];
  areaM2: number;
}

export interface ObraDetalle extends Omit<ObraResumen, "geocercas"> {
  descripcion: string | null;
  departamento: string | null;
  provincia: string | null;
  direccion: string | null;
  fechaInicio: string | null;
  fechaFinPrevista: string | null;
  campamentoActivo: boolean;
  comedorActivo: boolean;
  presupuestoContractual: number | null;
  moneda: "PEN" | "USD";
  anuladoMotivo: string | null;
  updatedAt: string;
  geocercas: Geocerca[];
}

export interface UsuarioResumen {
  id: string;
  email: string;
  nombre: string;
  dni: string | null;
  estado: "ACTIVO" | "INACTIVO";
  mfaHabilitado: boolean;
  ultimoLoginAt: string | null;
  bloqueado: boolean;
  roles: string[];
}

export interface UsuarioDetalle {
  id: string;
  email: string;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  estado: "ACTIVO" | "INACTIVO";
  inactivadoMotivo: string | null;
  mfaHabilitado: boolean;
  debeCambiarPassword: boolean;
  ultimoLoginAt: string | null;
  bloqueadoHasta: string | null;
  createdAt: string;
  asignaciones: { id: string; rolCodigo: string; rolNombre: string; alcance: "GLOBAL" | "OBRA"; obraId: string | null; obraNombre: string | null; createdAt: string }[];
  sesiones: { familia: string; ip: string | null; userAgent: string | null; createdAt: string; ultimoUsoAt: string; expiraAt: string; mfa: boolean }[];
}

export interface Rol {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  alcance: "GLOBAL" | "OBRA";
  requiereMfa: boolean;
  esSistema: boolean;
  activo: boolean;
  permisos: string[];
  usuarios: number;
}

export interface Permiso {
  codigo: string;
  modulo: string;
  descripcion: string;
}

export interface Parametro {
  clave: string;
  valor: string | number | boolean;
  tipo: "ENTERO" | "DECIMAL" | "TEXTO" | "HORA" | "BOOLEANO";
  unidad: string | null;
  descripcion: string;
  categoria: string;
  minimo: number | null;
  maximo: number | null;
  updatedAt: string;
}

export interface EventoAuditoria {
  id: number;
  ocurridoAt: string;
  tabla: string;
  operacion: "INSERT" | "UPDATE" | "DELETE" | "EVENTO";
  registroId: string | null;
  accion: string | null;
  camposCambiados: string[];
  antes: Record<string, unknown> | null;
  despues: Record<string, unknown> | null;
  detalle: Record<string, unknown> | null;
  usuarioId: string | null;
  usuarioNombre: string | null;
  ip: string | null;
  obraAntes: string | null;
  obraDespues: string | null;
  usuarioAfectado: string | null;
}

export interface Pagina<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}

// ─── Fase 2: trabajadores y asistencia ─────────────────────────────────────

export interface TrabajadorResumen {
  id: string;
  tipoDocumento: "DNI" | "CE";
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  categoria: string;
  cargo: string | null;
  estado: "ACTIVO" | "CESADO" | "ANULADO";
  obraActual: string | null;
  documentosVencidos: number;
  documentosPorVencer: number;
  tieneAcceso: boolean;
  consintio: boolean;
}

export interface DocumentoTrabajador {
  id: string;
  tipo: string;
  nombreTipo: string;
  numero: string | null;
  emitidoEl: string | null;
  venceEl: string | null;
  semaforo: "VERDE" | "AMBAR" | "ROJO";
  tieneArchivo: boolean;
}

export interface TrabajadorDetalle {
  id: string;
  tipoDocumento: "DNI" | "CE";
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string | null;
  telefono: string | null;
  email: string | null;
  categoria: string;
  cargo: string | null;
  fechaIngreso: string;
  estado: "ACTIVO" | "CESADO" | "ANULADO";
  ceseFecha: string | null;
  ceseMotivo: string | null;
  documentos: DocumentoTrabajador[];
  asignaciones: { id: string; obraId: string; obra: string; desde: string; hasta: string | null; cargo: string | null; vigente: boolean }[];
  bloqueos: string[];
  usuarioId: string | null;
  accesoBloqueado: boolean;
  debeCambiarPin: boolean;
  dispositivo: string | null;
  dispositivoEstado: string | null;
  consentimientoAt: string | null;
  consentimientoVersion: number | null;
  puedeGestionar: boolean;
}

export interface FilaImportacion {
  fila: number;
  datos: Record<string, string>;
  errores: string[];
}

export interface Importacion {
  id: string;
  archivoNombre: string;
  estado: "PREVIA" | "CONFIRMADA" | "REVERTIDA" | "DESCARTADA";
  obraId: string;
  obra: string;
  total: number;
  validas: number;
  conError: number;
  createdAt: string;
  creadoPor: string;
  filas: FilaImportacion[];
}

export type ResultadoMarcaje = "VALIDO" | "RECHAZADO" | "EN_REVISION";

export interface MarcajeFila {
  id: string;
  trabajador: string;
  documento: string;
  obra: string | null;
  tipo: "ENTRADA" | "SALIDA";
  hora: string;
  offline: boolean;
  resultado: ResultadoMarcaje;
  resultadoOriginal: ResultadoMarcaje;
  motivo: string | null;
  senales: string[];
  distanciaM: number | null;
  precisionM: number;
  zona: string | null;
  revisadoPor: string | null;
}

export interface MarcajeDetalle {
  marcaje: MarcajeFila;
  lat: number;
  lng: number;
  obraLat: number | null;
  obraLng: number | null;
  radioM: number | null;
  tieneSelfie: boolean;
  revisionComentario: string | null;
  revisadoAt: string | null;
  dispositivo: string | null;
  banderas: string;
}

export interface Presente {
  trabajadorId: string;
  trabajador: string;
  documento: string;
  ultimoTipo: "ENTRADA" | "SALIDA";
  hora: string;
  resultado: ResultadoMarcaje;
}

export interface Comision {
  id: string;
  obraId: string;
  obra: string;
  trabajadorId: string;
  trabajador: string;
  motivo: string;
  destinoNombre: string | null;
  destinoLat: number | null;
  destinoLng: number | null;
  destinoRadioM: number | null;
  inicio: string;
  fin: string;
  vehiculo: string | null;
  montoEntregado: number | null;
  montoRendido: number | null;
  requiereComprobante: boolean;
  tieneComprobante: boolean;
  estado: "PROGRAMADA" | "CERRADA" | "ANULADA";
  vigencia: "PROXIMA" | "VIGENTE" | "VENCIDA" | null;
  creadaPor: string;
}

export interface SolicitudDispositivo {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  documento: string | null;
  plataforma: string;
  modelo: string | null;
  estado: string;
  solicitadoAt: string;
  modeloActual: string | null;
}
