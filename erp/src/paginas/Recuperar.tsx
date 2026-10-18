import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Alerta, Boton, Campo } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import { MarcoAcceso } from "./Login";

export function Recuperar() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <MarcoAcceso titulo="Recuperar contraseña">
      {enviado ? (
        <Alerta tipo="exito">Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña. Revisa tu bandeja.</Alerta>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e: FormEvent) => {
            e.preventDefault();
            setEnviando(true);
            setError(null);
            try {
              await api.post("/auth/password/olvide", { email });
              setEnviado(true);
            } catch (err) {
              setError(mensajeDeError(err));
            } finally {
              setEnviando(false);
            }
          }}
        >
          <Campo label="Correo" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          {error && <Alerta>{error}</Alerta>}
          <Boton type="submit" className="w-full" cargando={enviando}>Enviar enlace</Boton>
        </form>
      )}
      <Link to="/" className="mt-4 flex min-h-12 items-center justify-center text-slate-600 underline">Volver al ingreso</Link>
    </MarcoAcceso>
  );
}

export function Restablecer() {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const [clave, setClave] = useState("");
  const [repite, setRepite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  return (
    <MarcoAcceso titulo="Nueva contraseña">
      {listo ? (
        <>
          <Alerta tipo="exito">Listo. Por seguridad se cerraron todas tus sesiones; ingresa con tu nueva contraseña.</Alerta>
          <Boton className="mt-4 w-full" onClick={() => navegar("/")}>Ir al ingreso</Boton>
        </>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e: FormEvent) => {
            e.preventDefault();
            if (clave !== repite) return setError("Las contraseñas no coinciden");
            setEnviando(true);
            setError(null);
            try {
              await api.post("/auth/password/restablecer", { token: params.get("token") ?? "", password: clave });
              setListo(true);
            } catch (err) {
              setError(mensajeDeError(err));
            } finally {
              setEnviando(false);
            }
          }}
        >
          <Campo label="Nueva contraseña" type="password" autoComplete="new-password" required value={clave}
            onChange={(e) => setClave(e.target.value)} ayuda="Mínimo 10 caracteres, con letras y números." />
          <Campo label="Repite la contraseña" type="password" autoComplete="new-password" required value={repite} onChange={(e) => setRepite(e.target.value)} />
          {error && <Alerta>{error}</Alerta>}
          <Boton type="submit" className="w-full" cargando={enviando}>Guardar contraseña</Boton>
        </form>
      )}
    </MarcoAcceso>
  );
}
