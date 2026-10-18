import { useState, type FormEvent } from "react";
import { Alerta, Boton, Campo, Encabezado } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import { useSesion } from "../lib/sesion";
import { MarcoAcceso } from "./Login";

/** Cambio de contraseña. Con clave temporal es obligatorio antes de usar el sistema. */
export default function CambiarClave({ obligatorio = false }: { obligatorio?: boolean }) {
  const { yo, recargar, salir } = useSesion();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repite, setRepite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const formulario = (
    <form
      className="max-w-md space-y-4"
      onSubmit={async (e: FormEvent) => {
        e.preventDefault();
        if (nueva !== repite) return setError("Las contraseñas nuevas no coinciden");
        setEnviando(true);
        setError(null);
        try {
          await api.post("/auth/password/cambiar", { actual, nueva });
          setOk(true);
          setActual("");
          setNueva("");
          setRepite("");
          await recargar();
        } catch (err) {
          setError(mensajeDeError(err));
        } finally {
          setEnviando(false);
        }
      }}
    >
      <Campo label={obligatorio ? "Contraseña temporal" : "Contraseña actual"} type="password" autoComplete="current-password" required
        value={actual} onChange={(e) => setActual(e.target.value)} />
      <Campo label="Nueva contraseña" type="password" autoComplete="new-password" required value={nueva}
        onChange={(e) => setNueva(e.target.value)} ayuda="Mínimo 10 caracteres, con letras y números." />
      <Campo label="Repite la nueva contraseña" type="password" autoComplete="new-password" required value={repite} onChange={(e) => setRepite(e.target.value)} />
      {error && <Alerta>{error}</Alerta>}
      {ok && !obligatorio && <Alerta tipo="exito">Contraseña actualizada.</Alerta>}
      <Boton type="submit" cargando={enviando} className="w-full sm:w-auto">Guardar contraseña</Boton>
    </form>
  );

  if (obligatorio) {
    return (
      <MarcoAcceso titulo="Crea tu contraseña">
        <p className="mb-4 text-slate-700">Hola {yo?.nombre}. Estás usando una contraseña temporal: crea una propia para continuar.</p>
        {formulario}
        <button type="button" onClick={() => void salir()} className="mt-4 min-h-12 w-full text-slate-600 underline">Cerrar sesión</button>
      </MarcoAcceso>
    );
  }

  return (
    <>
      <Encabezado titulo="Mi cuenta" subtitulo={`${yo?.nombre} · ${yo?.email}`} />
      <div className="tarjeta p-6">
        <h2 className="mb-4 text-lg font-bold">Cambiar contraseña</h2>
        {formulario}
        <p className="mt-6 text-sm text-slate-600">
          Verificación en dos pasos: <strong>{yo?.mfaHabilitado ? "activa" : "no activada"}</strong>. Si perdiste tu celular, pide al
          Administrador que la reinicie.
        </p>
      </div>
    </>
  );
}
