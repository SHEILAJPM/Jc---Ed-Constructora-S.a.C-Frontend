import { useQuery } from "@tanstack/react-query";
import { Building2, ClipboardCheck, History, ShieldAlert, Smartphone, UserCheck, Users } from "lucide-react";
import { Link } from "react-router";
import { Cargando, Encabezado, ESTADO_OBRA, Insignia, fechaHora } from "../componentes/ui";
import { api } from "../lib/api";
import { rolPrincipal, tiene } from "../lib/menu";
import { ACCIONES, TABLAS } from "./Auditoria";
import { useSesion } from "../lib/sesion";
import { hoyLima } from "../lib/asistencia";
import type { EventoAuditoria, MarcajeFila, ObraResumen, Pagina, SolicitudDispositivo, UsuarioResumen } from "../lib/tipos";

/** Qué verá cada rol en su inicio (sección 4 del contexto) y en qué fase llega cada bloque. */
const INICIO: Record<string, { titulo: string; bloques: [string, number][] }> = {
  DUENO: { titulo: "Control de la empresa", bloques: [["Semáforo de obras", 9], ["Gasto de hoy", 9], ["Alertas rojas", 9], ["Aprobaciones pendientes", 5]] },
  ADMIN: { titulo: "Administración del sistema", bloques: [["Solicitudes de cambio de dispositivo", 2]] },
  CONTADOR: { titulo: "Contabilidad", bloques: [["Facturas por validar", 5], ["Pagos de la semana", 5], ["Desviaciones por obra", 9]] },
  ADM_OBRA: { titulo: "Administración de obra", bloques: [["Quién marcó hoy", 2], ["Marcajes en revisión", 2], ["Tareo por cerrar", 3]] },
  ING_RESIDENTE: { titulo: "Ingeniería de obra", bloques: [["Avance vs programado", 8], ["Requisiciones", 5], ["Incidentes abiertos", 8]] },
  ING_CIVIL: { titulo: "Ingeniería de obra", bloques: [["Avance vs programado", 8], ["Requisiciones", 5], ["Protocolos de calidad", 8]] },
  ING_AMBIENTAL: { titulo: "Gestión ambiental", bloques: [["Avance vs programado", 8], ["Incidentes abiertos", 8]] },
  ING_SSOMA: { titulo: "Seguridad y salud", bloques: [["Incidentes abiertos", 8], ["Entregas de EPP", 8], ["Charlas de 5 minutos", 8]] },
  ALMACENERO: { titulo: "Almacén", bloques: [["Stock bajo mínimo", 4], ["Transferencias por recibir", 4], ["Despachos del día", 4]] },
  SUP_FLOTA: { titulo: "Flota y maquinaria", bloques: [["Equipos parados", 6], ["Consumos anómalos", 6], ["Vencimientos", 6]] },
  RESP_CAMPAMENTO: { titulo: "Campamento", bloques: [["Ocupación", 7], ["Check-ins del día", 7], ["Raciones servidas", 7]] },
  SUBCONTRATISTA: { titulo: "Subcontrata", bloques: [["Tu personal en obra", 8], ["Tus avances y valorizaciones", 8]] },
  TRABAJADOR: { titulo: "Mi portal", bloques: [["Mis boletas", 3], ["Mi habitación", 7]] },
};

function Bloque({ titulo, fase }: { titulo: string; fase: number }) {
  return (
    <div className="tarjeta flex min-h-32 flex-col justify-between border-dashed p-5">
      <p className="text-lg font-semibold">{titulo}</p>
      <p className="text-sm text-slate-500">Disponible en la Fase {fase}</p>
    </div>
  );
}

export default function Inicio() {
  const { yo } = useSesion();
  const rol = rolPrincipal(yo);
  const cfg = rol ? INICIO[rol] : null;
  const verObras = tiene(yo, "core.obra.ver");
  const esAdmin = tiene(yo, "core.usuario.gestionar");

  const obras = useQuery({ queryKey: ["obras"], queryFn: () => api.get<ObraResumen[]>("/obras").then((r) => r.data), enabled: verObras });
  const usuarios = useQuery({ queryKey: ["usuarios", "", ""], queryFn: () => api.get<UsuarioResumen[]>("/usuarios").then((r) => r.data), enabled: esAdmin });
  const eventos = useQuery({
    queryKey: ["auditoria", "inicio"],
    queryFn: () => api.get<Pagina<EventoAuditoria>>("/auditoria", { params: { size: 6 } }).then((r) => r.data),
    enabled: tiene(yo, "audit.evento.ver"),
  });
  const verAsistencia = tiene(yo, "campo.marcaje.ver");
  const porRevisar = useQuery({
    queryKey: ["marcajes", "PENDIENTE", "inicio"],
    queryFn: () => api.get<Pagina<MarcajeFila>>("/marcajes", { params: { resultado: "PENDIENTE", size: 1 } }).then((r) => r.data.totalItems),
    enabled: verAsistencia,
  });
  const deHoy = useQuery({
    queryKey: ["marcajes", "hoy", "inicio"],
    queryFn: () => api.get<Pagina<MarcajeFila>>("/marcajes", { params: { fecha: hoyLima(), size: 200 } }).then((r) => r.data),
    enabled: verAsistencia,
  });
  const celulares = useQuery({
    queryKey: ["dispositivos", "pendientes"],
    queryFn: () => api.get<SolicitudDispositivo[]>("/dispositivos/pendientes").then((r) => r.data.length),
    enabled: tiene(yo, "core.dispositivo.aprobar"),
  });
  // Personas distintas con al menos un marcaje no rechazado hoy.
  const marcaronHoy = deHoy.data ? new Set(deHoy.data.items.filter((m) => m.resultado !== "RECHAZADO").map((m) => m.documento)).size : null;

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      <Encabezado titulo={`${saludo}, ${yo?.nombre.split(" ")[0]}`} subtitulo={cfg?.titulo ?? "Aún no tienes un rol asignado. Pide acceso al Administrador."} />

      {esAdmin && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Link to="/usuarios" className="tarjeta flex items-center gap-4 p-5 hover:border-naranja">
            <Users className="size-10 text-naranja" aria-hidden />
            <div><p className="text-3xl font-bold">{usuarios.data?.filter((u) => u.estado === "ACTIVO").length ?? "…"}</p><p className="text-slate-600">Usuarios activos</p></div>
          </Link>
          <Link to="/usuarios" className="tarjeta flex items-center gap-4 p-5 hover:border-naranja">
            <ShieldAlert className="size-10 text-rojo" aria-hidden />
            <div><p className="text-3xl font-bold">{usuarios.data?.filter((u) => u.bloqueado).length ?? "…"}</p><p className="text-slate-600">Cuentas bloqueadas</p></div>
          </Link>
          <Link to="/usuarios" className="tarjeta flex items-center gap-4 p-5 hover:border-naranja">
            <ShieldAlert className="size-10 text-ambar" aria-hidden />
            <div>
              <p className="text-3xl font-bold">{usuarios.data?.filter((u) => u.estado === "ACTIVO" && u.roles.length === 0).length ?? "…"}</p>
              <p className="text-slate-600">Usuarios sin rol</p>
            </div>
          </Link>
        </div>
      )}

      {(verAsistencia || celulares.data !== undefined) && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {verAsistencia && (
            <Link to="/asistencia?ver=presentes" className="tarjeta flex items-center gap-4 p-5 hover:border-naranja">
              <UserCheck className="size-10 text-verde" aria-hidden />
              <div><p className="text-3xl font-bold">{marcaronHoy ?? "…"}</p><p className="text-slate-600">Marcaron hoy</p></div>
            </Link>
          )}
          {verAsistencia && (
            <Link to="/asistencia?ver=revision" className="tarjeta flex items-center gap-4 p-5 hover:border-naranja">
              <ClipboardCheck className={`size-10 ${porRevisar.data ? "text-ambar" : "text-slate-400"}`} aria-hidden />
              <div><p className="text-3xl font-bold">{porRevisar.data ?? "…"}</p><p className="text-slate-600">Marcajes por revisar</p></div>
            </Link>
          )}
          {celulares.data !== undefined && (
            <Link to="/dispositivos" className="tarjeta flex items-center gap-4 p-5 hover:border-naranja">
              <Smartphone className={`size-10 ${celulares.data ? "text-ambar" : "text-slate-400"}`} aria-hidden />
              <div><p className="text-3xl font-bold">{celulares.data}</p><p className="text-slate-600">Cambios de celular por aprobar</p></div>
            </Link>
          )}
        </div>
      )}

      {rol === "TRABAJADOR" && (
        <div className="mb-6 tarjeta p-5">
          <p className="text-lg font-semibold">Tu asistencia se marca desde la app de campo en tu celular</p>
          <p className="text-slate-600">Ingresa con tu DNI y tu PIN. Si cambiaste de celular, pide al administrador que lo apruebe.</p>
        </div>
      )}

      {cfg && cfg.bloques.some(([, f]) => f > 2) && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cfg.bloques.filter(([, f]) => f > 2).map(([t, f]) => <Bloque key={t} titulo={t} fase={f} />)}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {verObras && (
          <section className="tarjeta p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Building2 className="size-5 text-naranja" aria-hidden /> Mis obras</h2>
            {obras.isLoading && <Cargando texto="Cargando obras…" />}
            {obras.data?.length === 0 && <p className="text-slate-600">No tienes obras asignadas.</p>}
            <ul className="divide-y divide-slate-100">
              {obras.data?.map((o) => (
                <li key={o.id}>
                  <Link to={`/obras/${o.id}`} className="flex min-h-14 items-center justify-between gap-3 py-2 hover:text-naranja">
                    <span><span className="font-mono text-sm text-slate-500">{o.codigo}</span><span className="block font-semibold">{o.nombre}</span></span>
                    <Insignia color={ESTADO_OBRA[o.estado].color}>{ESTADO_OBRA[o.estado].label}</Insignia>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {eventos.data && (
          <section className="tarjeta p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><History className="size-5 text-naranja" aria-hidden /> Últimos eventos de auditoría</h2>
            <ul className="divide-y divide-slate-100">
              {eventos.data.items.map((e) => (
                <li key={e.id} className="py-2">
                  <p className="font-medium">{e.accion ? ACCIONES[e.accion] ?? e.accion : `Cambio en ${(TABLAS.find((t) => t.valor === e.tabla)?.label ?? e.tabla).toLowerCase()}`}</p>
                  <p className="text-sm text-slate-500">{fechaHora(e.ocurridoAt)} · {e.usuarioNombre ?? e.usuarioAfectado ?? "Sistema"}</p>
                </li>
              ))}
            </ul>
            <Link to="/auditoria" className="mt-3 inline-flex min-h-12 items-center font-semibold text-naranja">Ver toda la auditoría →</Link>
          </section>
        )}
      </div>
    </>
  );
}
