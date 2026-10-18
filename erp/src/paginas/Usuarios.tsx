import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Alerta, Boton, Campo, Cargando, Encabezado, Insignia, Modal, Seleccion, fechaHora } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import { tiene } from "../lib/menu";
import { useSesion } from "../lib/sesion";
import type { UsuarioResumen } from "../lib/tipos";

export default function Usuarios() {
  const { yo } = useSesion();
  const qc = useQueryClient();
  const navegar = useNavigate();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("ACTIVO");
  const [nuevo, setNuevo] = useState(false);
  const [form, setForm] = useState({ email: "", nombre: "", dni: "", telefono: "" });
  const [error, setError] = useState<string | null>(null);
  const [creado, setCreado] = useState<{ id: string; claveTemporal: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["usuarios", q, estado],
    queryFn: () => api.get<UsuarioResumen[]>("/usuarios", { params: { q: q || undefined, estado: estado || undefined } }).then((r) => r.data),
  });

  return (
    <>
      <Encabezado
        titulo="Usuarios"
        acciones={tiene(yo, "core.usuario.gestionar") && (
          <Boton onClick={() => { setNuevo(true); setCreado(null); setError(null); setForm({ email: "", nombre: "", dni: "", telefono: "" }); }}>
            <Plus className="size-5" aria-hidden /> Nuevo usuario
          </Boton>
        )}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_14rem]">
        <Campo label="Buscar" placeholder="Nombre, correo o DNI" value={q} onChange={(e) => setQ(e.target.value)} />
        <Seleccion label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} vacio="Todos"
          opciones={[{ valor: "ACTIVO", label: "Activos" }, { valor: "INACTIVO", label: "Inactivos" }]} />
      </div>
      {isLoading && <Cargando />}
      <div className="tarjeta overflow-x-auto">
        <table className="tabla w-full min-w-[640px]">
          <thead>
            <tr><th>Usuario</th><th>Roles</th><th>Seguridad</th><th>Último ingreso</th></tr>
          </thead>
          <tbody>
            {data?.map((u) => (
              <tr key={u.id} className="cursor-pointer hover:bg-orange-50/50" onClick={() => navegar(`/usuarios/${u.id}`)}>
                <td>
                  <Link to={`/usuarios/${u.id}`} className="font-semibold hover:text-naranja">{u.nombre}</Link>
                  <span className="block text-sm text-slate-500">{u.email}</span>
                </td>
                <td className="text-sm">{u.roles.length ? u.roles.join(", ") : <span className="text-amber-700">Sin rol</span>}</td>
                <td className="space-x-1 space-y-1">
                  {u.estado === "INACTIVO" && <Insignia color="rojo">Inactivo</Insignia>}
                  {u.bloqueado && <Insignia color="ambar"><Lock className="mr-1 size-3.5" />Bloqueado</Insignia>}
                  {u.mfaHabilitado && <Insignia color="verde"><ShieldCheck className="mr-1 size-3.5" />MFA</Insignia>}
                </td>
                <td className="text-sm text-slate-600">{fechaHora(u.ultimoLoginAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal abierto={nuevo} titulo={creado ? "Usuario creado" : "Nuevo usuario"} onCerrar={() => setNuevo(false)}>
        {creado ? (
          <div className="space-y-4">
            <Alerta tipo="aviso">
              Contraseña temporal (se muestra <strong>una sola vez</strong>). Entrégala en persona; al entrar deberá cambiarla.
            </Alerta>
            <p className="rounded-lg bg-slate-100 p-4 text-center font-mono text-xl">{creado.claveTemporal}</p>
            <Boton className="w-full" onClick={() => navegar(`/usuarios/${creado.id}`)}>Asignar roles</Boton>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              try {
                const { data } = await api.post<{ id: string; claveTemporal: string }>("/usuarios", form);
                setCreado(data);
                await qc.invalidateQueries({ queryKey: ["usuarios"] });
              } catch (err) {
                setError(mensajeDeError(err));
              }
            }}
          >
            <Campo label="Correo" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Campo label="Nombre completo" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="DNI" inputMode="numeric" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
              <Campo label="Teléfono" type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            {error && <Alerta>{error}</Alerta>}
            <div className="flex justify-end gap-3">
              <Boton type="button" variante="secundario" onClick={() => setNuevo(false)}>Cancelar</Boton>
              <Boton type="submit">Crear usuario</Boton>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
