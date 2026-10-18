import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { Alerta, Boton, Campo, Cargando, Encabezado, Insignia, Seleccion, fechaHora } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import type { EventoAuditoria, Pagina } from "../lib/tipos";

export const TABLAS = [
  { valor: "core.usuarios", label: "Usuarios" }, { valor: "core.usuario_roles", label: "Roles de usuario" },
  { valor: "core.roles", label: "Roles" }, { valor: "core.rol_permisos", label: "Permisos de rol" },
  { valor: "core.configuracion", label: "Configuración" }, { valor: "core.obras", label: "Obras" },
  { valor: "core.geocercas", label: "Geocercas" }, { valor: "rrhh.trabajadores", label: "Trabajadores" },
  { valor: "rrhh.documentos", label: "Documentos de trabajadores" }, { valor: "rrhh.asignaciones", label: "Asignaciones a obra" },
  { valor: "rrhh.importaciones", label: "Importaciones de Excel" }, { valor: "campo.dispositivos", label: "Celulares de marcaje" },
  { valor: "campo.comisiones", label: "Comisiones" }, { valor: "campo.consentimientos", label: "Consentimientos firmados" },
  { valor: "campo.revisiones", label: "Revisiones de marcajes" }, { valor: "app.evento", label: "Eventos (login, MFA, sesiones)" },
];

const OCULTOS = new Set(["updated_at", "created_at", "id", "mfa_ultimo_paso"]);

/** Nombres legibles de los campos (lo que no está aquí se muestra tal cual). */
const NOMBRES: Record<string, string> = {
  rol_codigo: "Rol", obra_id: "Obra", usuario_id: "Usuario", activo: "Activo", anulado_motivo: "Motivo de anulación",
  anulado_at: "Fecha de anulación", nombre: "Nombre", email: "Correo", dni: "DNI", telefono: "Teléfono", estado: "Estado",
  password_hash: "Contraseña", debe_cambiar_password: "Clave temporal", mfa_habilitado: "Verificación en dos pasos",
  mfa_secreto: "Secreto MFA", mfa_secreto_pendiente: "Secreto MFA (pendiente)", mfa_codigos_respaldo: "Códigos de respaldo",
  intentos_fallidos: "Intentos fallidos", bloqueado_hasta: "Bloqueado hasta", ultimo_login_at: "Último ingreso",
  inactivado_motivo: "Motivo de desactivación", codigo: "Código", cliente: "Cliente", descripcion: "Descripción",
  departamento: "Departamento", provincia: "Provincia", distrito: "Distrito", direccion: "Dirección",
  fecha_inicio: "Fecha de inicio", fecha_fin_prevista: "Fin previsto", centro: "Punto de marcaje", radio_m: "Radio (m)",
  campamento_activo: "Campamento", comedor_activo: "Comedor", presupuesto_contractual: "Presupuesto", moneda: "Moneda",
  tipo: "Tipo", area: "Polígono", valor: "Valor", clave: "Parámetro", updated_by: "Modificado por", permiso_codigo: "Permiso",
  requiere_mfa: "Exige MFA", alcance: "Alcance", created_by: "Asignado por",
};
const nombreCampo = (c: string) => NOMBRES[c] ?? c;

export const ACCIONES: Record<string, string> = {
  "auth.login_ok": "Inició sesión", "auth.login_fallido": "Intento de ingreso fallido", "auth.login_bloqueado": "Intento con cuenta bloqueada",
  "auth.cuenta_bloqueada": "Cuenta bloqueada por intentos fallidos", "auth.mfa_activado": "Activó la verificación en dos pasos",
  "auth.mfa_activacion_fallida": "Código MFA incorrecto al activar", "auth.mfa_fallido": "Código MFA incorrecto",
  "auth.mfa_codigo_respaldo_usado": "Usó un código de respaldo", "auth.mfa_reiniciado": "Se reinició su verificación en dos pasos",
  "auth.reuso_refresh_detectado": "Posible robo de sesión detectado (sesión cerrada)", "auth.recuperacion_solicitada": "Pidió recuperar su contraseña",
  "auth.password_restablecida": "Restableció su contraseña", "auth.password_cambiada": "Cambió su contraseña",
  "auth.sesion_revocada": "Se cerró una de sus sesiones", "auth.sesiones_revocadas": "Se cerraron todas sus sesiones",
  "salud.prueba": "Prueba técnica del sistema", "campo.selfie_vista": "Vio la selfie de un marcaje",
};
const nombreAccion = (a: string) => ACCIONES[a] ?? a;

function valorLegible(c: string, v: unknown) {
  if (v === true) return "Sí";
  if (v === false) return "No";
  if (c === "centro" || c === "area") return v ? "(coordenadas)" : "—";
  return valor(v);
}

function valor(v: unknown) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** Tabla antes → después solo con los campos que cambiaron (o todos, si es alta/baja). */
function Diferencias({ e }: { e: EventoAuditoria }) {
  const claves = e.operacion === "UPDATE"
    ? e.camposCambiados.filter((c) => !OCULTOS.has(c))
    : Object.keys(e.despues ?? e.antes ?? {}).filter((c) => !OCULTOS.has(c));
  const etiqueta = (c: string, lado: "antes" | "despues") =>
    c === "obra_id" ? (lado === "antes" ? e.obraAntes : e.obraDespues) ?? valor((lado === "antes" ? e.antes : e.despues)?.[c]) : valorLegible(c, (lado === "antes" ? e.antes : e.despues)?.[c]);
  if (e.operacion === "EVENTO") return <pre className="overflow-x-auto rounded bg-slate-50 p-3 text-sm">{JSON.stringify(e.detalle ?? {}, null, 2)}</pre>;
  return (
    <div className="overflow-x-auto">
      <table className="tabla w-full text-sm">
        <thead><tr><th>Campo</th>{e.operacion !== "INSERT" && <th>Antes</th>}{e.operacion !== "DELETE" && <th>Después</th>}</tr></thead>
        <tbody>
          {claves.map((c) => (
            <tr key={c}>
              <td className="font-medium">{nombreCampo(c)}</td>
              {e.operacion !== "INSERT" && <td className="break-all text-red-700">{etiqueta(c, "antes")}</td>}
              {e.operacion !== "DELETE" && <td className="break-all text-green-800">{etiqueta(c, "despues")}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Auditoria() {
  const [params, setParams] = useSearchParams();
  const [abierto, setAbierto] = useState<number | null>(null);
  const filtros = {
    tabla: params.get("tabla") ?? "",
    accion: params.get("accion") ?? "",
    registroId: params.get("registroId") ?? "",
    desde: params.get("desde") ?? "",
    hasta: params.get("hasta") ?? "",
    page: Number(params.get("page") ?? 0),
  };
  const fijar = (k: string, v: string) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    if (k !== "page") n.delete("page");
    setParams(n, { replace: true });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["auditoria", filtros],
    queryFn: () => api.get<Pagina<EventoAuditoria>>("/auditoria", {
      params: { ...Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== "")), size: 30 },
    }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <Encabezado titulo="Auditoría" subtitulo="Registro inalterable: quién cambió qué, cuándo y desde dónde. Nadie puede editarlo ni borrarlo." />
      <div className="tarjeta mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Seleccion label="Tabla" vacio="Todas" value={filtros.tabla} onChange={(e) => fijar("tabla", e.target.value)} opciones={TABLAS} />
        <Seleccion label="Evento de seguridad" vacio="Todos" value={filtros.accion} onChange={(e) => fijar("accion", e.target.value)}
          opciones={Object.entries(ACCIONES).filter(([k]) => k.startsWith("auth.")).map(([valor, label]) => ({ valor, label }))} />
        {filtros.registroId && (
          <div className="flex items-end">
            <Boton variante="secundario" className="w-full" onClick={() => fijar("registroId", "")}>Quitar filtro de usuario</Boton>
          </div>
        )}
        <Campo label="Desde" type="date" value={filtros.desde} onChange={(e) => fijar("desde", e.target.value)} />
        <Campo label="Hasta" type="date" value={filtros.hasta} onChange={(e) => fijar("hasta", e.target.value)} />
      </div>
      {isLoading && <Cargando />}
      {error && <Alerta>{mensajeDeError(error)}</Alerta>}
      {data && <p className="mb-2 text-sm text-slate-600">{data.totalItems.toLocaleString("es-PE")} evento(s)</p>}
      <ul className="space-y-2">
        {data?.items.map((e) => (
          <li key={e.id} className="tarjeta">
            <button type="button" className="flex min-h-14 w-full flex-wrap items-center gap-3 p-4 text-left" aria-expanded={abierto === e.id}
              onClick={() => setAbierto(abierto === e.id ? null : e.id)}>
              <Insignia color={{ INSERT: "verde", UPDATE: "azul", DELETE: "rojo", EVENTO: "naranja" }[e.operacion] as "verde"}>
                {{ INSERT: "Creó", UPDATE: "Modificó", DELETE: "Eliminó", EVENTO: "Seguridad" }[e.operacion]}
              </Insignia>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  {e.accion ? nombreAccion(e.accion) : TABLAS.find((t) => t.valor === e.tabla)?.label ?? e.tabla}
                  {e.operacion === "UPDATE" && e.camposCambiados.length > 0 && <span className="font-normal text-slate-600"> · {e.camposCambiados.filter((c) => !OCULTOS.has(c)).map(nombreCampo).join(", ")}</span>}
                </span>
                <span className="text-sm text-slate-500">
                  {fechaHora(e.ocurridoAt)} · por {e.usuarioNombre ?? "sistema / sin sesión"}{e.usuarioAfectado ? ` · afecta a ${e.usuarioAfectado}` : ""}{e.ip ? ` · IP ${e.ip}` : ""}
                </span>
              </span>
              <ChevronDown className={`size-5 transition-transform ${abierto === e.id ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {abierto === e.id && <div className="border-t border-slate-100 p-4"><Diferencias e={e} /></div>}
          </li>
        ))}
      </ul>
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Boton variante="secundario" disabled={filtros.page === 0} onClick={() => fijar("page", String(filtros.page - 1))}>Anterior</Boton>
          <span className="text-slate-600">Página {filtros.page + 1} de {data.totalPages}</span>
          <Boton variante="secundario" disabled={!data.hasNext} onClick={() => fijar("page", String(filtros.page + 1))}>Siguiente</Boton>
        </div>
      )}
    </>
  );
}
