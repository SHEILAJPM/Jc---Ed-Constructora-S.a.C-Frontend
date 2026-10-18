import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, LogOut, Pencil, Plus, ShieldOff, Trash2, Unlock, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { Alerta, Boton, Cargando, Encabezado, Insignia, Modal, ModalMotivo, Seleccion, fechaHora } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import { tiene } from "../lib/menu";
import { useSesion } from "../lib/sesion";
import type { ObraResumen, Rol, UsuarioDetalle as Usuario } from "../lib/tipos";

type Accion =
  | { tipo: "desactivar" } | { tipo: "quitarRol"; id: string; nombre: string } | { tipo: "revocar"; familia: string }
  | { tipo: "revocarTodas" } | { tipo: "mfa" };

export default function UsuarioDetalle() {
  const { id = "" } = useParams();
  const { yo } = useSesion();
  const qc = useQueryClient();
  const gestionar = tiene(yo, "core.usuario.gestionar");
  const revocar = tiene(yo, "core.sesion.revocar");
  const [accion, setAccion] = useState<Accion | null>(null);
  const [asignar, setAsignar] = useState<{ id?: string; rolCodigo: string; obraId: string } | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error" | "aviso"; texto: string } | null>(null);

  const { data: u, isLoading } = useQuery({ queryKey: ["usuario", id], queryFn: () => api.get<Usuario>(`/usuarios/${id}`).then((r) => r.data) });
  const roles = useQuery({ queryKey: ["roles"], queryFn: () => api.get<Rol[]>("/roles").then((r) => r.data), enabled: gestionar });
  const obras = useQuery({ queryKey: ["obras", false], queryFn: () => api.get<ObraResumen[]>("/obras").then((r) => r.data), enabled: gestionar });

  if (isLoading || !u) return <Cargando />;

  const actualizar = (d: Usuario) => {
    qc.setQueryData(["usuario", id], d);
    void qc.invalidateQueries({ queryKey: ["usuarios"] });
  };
  const ejecutar = async (fn: () => Promise<Usuario>, ok?: string) => {
    setMensaje(null);
    try {
      actualizar(await fn());
      if (ok) setMensaje({ tipo: "exito", texto: ok });
    } catch (e) {
      throw new Error(mensajeDeError(e));
    }
  };
  const rolSel = roles.data?.find((r) => r.codigo === asignar?.rolCodigo);
  const bloqueado = u.bloqueadoHasta && new Date(u.bloqueadoHasta) > new Date();

  return (
    <>
      <Encabezado
        titulo={u.nombre}
        subtitulo={<>{u.email}{u.dni ? ` · DNI ${u.dni}` : ""}{u.telefono ? ` · ${u.telefono}` : ""}</>}
        acciones={gestionar && (
          <>
            {u.estado === "ACTIVO"
              ? <Boton variante="secundario" onClick={() => setAccion({ tipo: "desactivar" })}><UserX className="size-5" aria-hidden /> Desactivar</Boton>
              : <Boton variante="secundario" onClick={() => void ejecutar(() => api.post<Usuario>(`/usuarios/${id}/reactivar`).then((r) => r.data), "Usuario reactivado.").catch((e) => setMensaje({ tipo: "error", texto: e.message }))}><UserCheck className="size-5" aria-hidden /> Reactivar</Boton>}
            <Boton variante="secundario" onClick={async () => {
              try {
                const { data } = await api.post<{ claveTemporal: string }>(`/usuarios/${id}/clave-temporal`);
                setMensaje({ tipo: "aviso", texto: `Nueva contraseña temporal (solo se muestra ahora): ${data.claveTemporal}` });
                void qc.invalidateQueries({ queryKey: ["usuario", id] });
              } catch (e) {
                setMensaje({ tipo: "error", texto: mensajeDeError(e) });
              }
            }}><KeyRound className="size-5" aria-hidden /> Clave temporal</Boton>
          </>
        )}
      />
      {mensaje && <div className="mb-4"><Alerta tipo={mensaje.tipo}><span className="break-all">{mensaje.texto}</span></Alerta></div>}

      <div className="mb-6 flex flex-wrap gap-2">
        <Insignia color={u.estado === "ACTIVO" ? "verde" : "rojo"}>{u.estado === "ACTIVO" ? "Activo" : `Inactivo: ${u.inactivadoMotivo}`}</Insignia>
        <Insignia color={u.mfaHabilitado ? "verde" : "gris"}>{u.mfaHabilitado ? "MFA activo" : "Sin MFA"}</Insignia>
        {u.debeCambiarPassword && <Insignia color="ambar">Clave temporal pendiente</Insignia>}
        {bloqueado && <Insignia color="rojo">Bloqueado hasta {fechaHora(u.bloqueadoHasta)}</Insignia>}
        <Insignia>Último ingreso: {fechaHora(u.ultimoLoginAt)}</Insignia>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="tarjeta p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Roles por obra</h2>
            {gestionar && u.estado === "ACTIVO" && (
              <Boton variante="secundario" onClick={() => setAsignar({ rolCodigo: "", obraId: "" })}><Plus className="size-5" aria-hidden /> Asignar rol</Boton>
            )}
          </div>
          {u.asignaciones.length === 0 && <p className="text-slate-600">Sin roles: este usuario no puede ver nada.</p>}
          <ul className="divide-y divide-slate-100">
            {u.asignaciones.map((a) => (
              <li key={a.id} className="flex min-h-14 items-center justify-between gap-3 py-2">
                <span>
                  <span className="font-semibold">{a.rolNombre}</span>
                  <span className="block text-sm text-slate-500">{a.alcance === "GLOBAL" ? "Todas las obras (global)" : a.obraNombre}</span>
                </span>
                {gestionar && (
                  <span className="flex">
                    <button type="button" aria-label={`Cambiar rol ${a.rolNombre}`} onClick={() => setAsignar({ id: a.id, rolCodigo: a.rolCodigo, obraId: a.obraId ?? "" })}
                      className="inline-flex size-12 items-center justify-center rounded-lg hover:bg-slate-100"><Pencil className="size-5" /></button>
                    <button type="button" aria-label={`Quitar rol ${a.rolNombre}`} onClick={() => setAccion({ tipo: "quitarRol", id: a.id, nombre: a.rolNombre })}
                      className="inline-flex size-12 items-center justify-center rounded-lg text-rojo hover:bg-red-50"><Trash2 className="size-5" /></button>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <Link to={`/auditoria?registroId=${u.id}`} className="mt-3 inline-flex min-h-12 items-center font-semibold text-naranja">Ver historial en auditoría →</Link>
        </section>

        <section className="tarjeta p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Sesiones abiertas</h2>
            {revocar && (
              <div className="flex flex-wrap gap-2">
                {u.sesiones.length > 0 && <Boton variante="secundario" onClick={() => setAccion({ tipo: "revocarTodas" })}><LogOut className="size-5" aria-hidden /> Cerrar todas</Boton>}
                {u.mfaHabilitado && <Boton variante="secundario" onClick={() => setAccion({ tipo: "mfa" })}><ShieldOff className="size-5" aria-hidden /> Reiniciar MFA</Boton>}
                {bloqueado && gestionar && <Boton variante="secundario" onClick={() => void ejecutar(() => api.post<Usuario>(`/usuarios/${id}/desbloquear`).then((r) => r.data), "Cuenta desbloqueada.").catch((e) => setMensaje({ tipo: "error", texto: e.message }))}><Unlock className="size-5" aria-hidden /> Desbloquear</Boton>}
              </div>
            )}
          </div>
          {u.sesiones.length === 0 && <p className="text-slate-600">No hay sesiones abiertas.</p>}
          <ul className="divide-y divide-slate-100">
            {u.sesiones.map((s) => (
              <li key={s.familia} className="flex min-h-14 items-center justify-between gap-3 py-2">
                <span className="min-w-0 text-sm">
                  <span className="block truncate font-medium">{s.userAgent ?? "Navegador desconocido"}</span>
                  <span className="text-slate-500">IP {s.ip ?? "—"} · último uso {fechaHora(s.ultimoUsoAt)} · {s.mfa ? "con MFA" : "sin MFA"}</span>
                </span>
                {revocar && (
                  <button type="button" onClick={() => setAccion({ tipo: "revocar", familia: s.familia })} aria-label="Cerrar esta sesión"
                    className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg text-rojo hover:bg-red-50"><LogOut className="size-5" /></button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Modal abierto={!!asignar} titulo={asignar?.id ? "Cambiar rol" : "Asignar rol"} onCerrar={() => setAsignar(null)}>
        {asignar && (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const cuerpo = { rolCodigo: asignar.rolCodigo, obraId: rolSel?.alcance === "OBRA" ? asignar.obraId || null : null };
              try {
                const r = asignar.id
                  ? await api.patch<Usuario>(`/usuarios/${id}/roles/${asignar.id}`, cuerpo)
                  : await api.post<Usuario>(`/usuarios/${id}/roles`, cuerpo);
                actualizar(r.data);
                setAsignar(null);
                setMensaje({ tipo: "exito", texto: asignar.id ? "Rol cambiado (queda en la auditoría con el valor anterior y el nuevo)." : "Rol asignado." });
              } catch (err) {
                setMensaje({ tipo: "error", texto: mensajeDeError(err) });
                setAsignar(null);
              }
            }}
          >
            <Seleccion label="Rol" required vacio="Elige un rol" value={asignar.rolCodigo}
              onChange={(e) => setAsignar({ ...asignar, rolCodigo: e.target.value })}
              opciones={(roles.data ?? []).filter((r) => r.activo).map((r) => ({ valor: r.codigo, label: `${r.nombre}${r.alcance === "GLOBAL" ? " (global)" : ""}` }))} />
            {rolSel?.alcance === "OBRA" && (
              <Seleccion label="Obra" required vacio="Elige la obra" value={asignar.obraId}
                onChange={(e) => setAsignar({ ...asignar, obraId: e.target.value })}
                opciones={(obras.data ?? []).map((o) => ({ valor: o.id, label: `${o.codigo} · ${o.nombre}` }))} />
            )}
            {rolSel?.requiereMfa && <Alerta tipo="info">Este rol exige verificación en dos pasos: se le pedirá al ingresar.</Alerta>}
            <div className="flex justify-end gap-3">
              <Boton type="button" variante="secundario" onClick={() => setAsignar(null)}>Cancelar</Boton>
              <Boton type="submit" disabled={!asignar.rolCodigo || (rolSel?.alcance === "OBRA" && !asignar.obraId)}>Guardar</Boton>
            </div>
          </form>
        )}
      </Modal>

      <ModalMotivo
        abierto={!!accion}
        titulo={{ desactivar: "Desactivar usuario", quitarRol: "Quitar rol", revocar: "Cerrar sesión", revocarTodas: "Cerrar todas las sesiones", mfa: "Reiniciar MFA" }[accion?.tipo ?? "desactivar"]}
        descripcion={{
          desactivar: "No podrá ingresar y se cerrarán todas sus sesiones. No se borra: se puede reactivar.",
          quitarRol: <>Se quitará el rol <strong>{accion?.tipo === "quitarRol" ? accion.nombre : ""}</strong>. Pierde el acceso de inmediato.</>,
          revocar: "La sesión se corta al instante, aunque su token no haya vencido.",
          revocarTodas: "Todas sus sesiones se cortan al instante.",
          mfa: "Deberá configurar de nuevo su app autenticadora al ingresar (por ejemplo, si perdió el celular).",
        }[accion?.tipo ?? "desactivar"]}
        accion="Confirmar"
        onCerrar={() => setAccion(null)}
        onConfirmar={async (motivo) => {
          const a = accion!;
          const url = {
            desactivar: `/usuarios/${id}/desactivar`,
            quitarRol: a.tipo === "quitarRol" ? `/usuarios/${id}/roles/${a.id}/anular` : "",
            revocar: a.tipo === "revocar" ? `/usuarios/${id}/sesiones/${a.familia}/revocar` : "",
            revocarTodas: `/usuarios/${id}/sesiones/revocar-todas`,
            mfa: `/usuarios/${id}/mfa/reiniciar`,
          }[a.tipo];
          await ejecutar(() => api.post<Usuario>(url, { motivo }).then((r) => r.data), "Hecho. Quedó registrado en la auditoría.");
        }}
      />
    </>
  );
}
