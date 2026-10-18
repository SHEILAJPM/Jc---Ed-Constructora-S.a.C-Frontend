import { KeyRound, LogIn, ShieldCheck, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { IconoLogo } from "../componentes/Logo";
import { Alerta, Boton, Campo } from "../componentes/ui";
import { api, mensajeDeError } from "../lib/api";
import { useSesion } from "../lib/sesion";
import type { RespuestaSesion } from "../lib/tipos";

type Paso =
  | { tipo: "credenciales" }
  | { tipo: "verificar"; desafio: string }
  | { tipo: "configurar"; desafio: string; secreto?: string; qr?: string }
  | { tipo: "respaldo"; codigos: string[]; token: string };

export function MarcoAcceso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-grafito lg:flex-row">
      {/* Foto de obra con capa grafito encima: el logo es blanco y debe ir siempre sobre fondo oscuro.
          Si /login-fondo.jpeg no existe, queda el grafito liso. */}
      <div
        className="flex items-center gap-3 bg-cover bg-center px-6 py-8 lg:w-2/5 lg:flex-col lg:items-start lg:justify-between lg:p-12"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgb(30 41 59 / 0.85), rgb(30 41 59 / 0.6) 50%, rgb(30 41 59 / 0.9)), url('/login-fondo.jpeg')",
        }}
      >
        <div className="flex items-center gap-3">
          <IconoLogo className="h-12 w-auto" />
          <div className="leading-none text-white">
            <p className="text-2xl font-extrabold">JC &amp; ED</p>
            <p className="text-xs font-bold tracking-[0.3em] text-slate-300">CONSTRUCTORA</p>
          </div>
        </div>
        <p className="hidden max-w-sm text-lg text-slate-300 lg:block">
          Cada sol, hora y material, trazable hasta una obra, una partida y una persona responsable.
        </p>
      </div>
      <main className="flex flex-1 items-start justify-center bg-fondo px-4 py-8 sm:items-center lg:rounded-l-3xl">
        <div className="tarjeta w-full max-w-md p-6 sm:p-8">
          <h1 className="mb-6 text-2xl font-bold">{titulo}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function Login() {
  const { iniciar } = useSesion();
  const [paso, setPaso] = useState<Paso>({ tipo: "credenciales" });
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Un solo secreto por desafío (en modo estricto React monta dos veces: no debe pedir dos secretos distintos).
  const pedidos = useRef(new Set<string>());

  const ejecutar = async (fn: () => Promise<void>) => {
    setError(null);
    setEnviando(true);
    try {
      await fn();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  const tras = async (r: RespuestaSesion) => {
    if (r.estado === "MFA_REQUERIDO") setPaso({ tipo: "verificar", desafio: r.desafio! });
    else if (r.estado === "MFA_CONFIGURAR") setPaso({ tipo: "configurar", desafio: r.desafio! });
    else await iniciar(r.accessToken!);
  };

  // Al llegar a "configurar", se pide el secreto y se dibuja el QR EN EL NAVEGADOR (nunca se envía a un servicio externo).
  useEffect(() => {
    if (paso.tipo !== "configurar" || paso.secreto || pedidos.current.has(paso.desafio)) return;
    pedidos.current.add(paso.desafio);
    void ejecutar(async () => {
      const { data } = await api.post<{ secreto: string; uri: string }>("/auth/mfa/configurar", { desafio: paso.desafio });
      const qr = await QRCode.toDataURL(data.uri, { margin: 1, width: 240 });
      setPaso({ ...paso, secreto: data.secreto, qr });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso]);

  if (paso.tipo === "respaldo") {
    return (
      <MarcoAcceso titulo="Guarda tus códigos de respaldo">
        <Alerta tipo="aviso">
          Si pierdes el celular, cada código sirve <strong>una sola vez</strong> para entrar. Guárdalos en un lugar seguro: no se
          volverán a mostrar.
        </Alerta>
        <ul className="my-5 grid grid-cols-2 gap-2 font-mono text-lg">
          {paso.codigos.map((c) => <li key={c} className="rounded-lg bg-slate-100 px-3 py-2 text-center">{c}</li>)}
        </ul>
        <Boton className="w-full" onClick={() => void navigator.clipboard?.writeText(paso.codigos.join("\n"))} variante="secundario">
          Copiar códigos
        </Boton>
        <Boton className="mt-3 w-full" onClick={() => void iniciar(paso.token)}>Ya los guardé, continuar</Boton>
      </MarcoAcceso>
    );
  }

  if (paso.tipo === "configurar") {
    return (
      <MarcoAcceso titulo="Activa la verificación en dos pasos">
        <p className="mb-4 text-slate-700">
          Tu rol maneja información sensible, así que exige un segundo factor. Instala <strong>Google Authenticator</strong>,{" "}
          <strong>Microsoft Authenticator</strong> o <strong>Authy</strong> y escanea este código:
        </p>
        <div className="mb-4 flex justify-center">
          {paso.qr ? <img src={paso.qr} alt="Código QR para la app autenticadora" className="size-60 rounded-lg border" /> : <div className="size-60 animate-pulse rounded-lg bg-slate-100" />}
        </div>
        {paso.secreto && (
          <p className="mb-4 break-all text-center text-sm text-slate-600">
            ¿No puedes escanear? Escribe esta clave: <span className="font-mono font-semibold text-grafito">{paso.secreto}</span>
          </p>
        )}
        <form
          className="space-y-4"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            void ejecutar(async () => {
              const { data } = await api.post<RespuestaSesion>("/auth/mfa/activar", { desafio: paso.desafio, codigo });
              setPaso({ tipo: "respaldo", codigos: data.codigosRespaldo ?? [], token: data.accessToken! });
            });
          }}
        >
          <Campo label="Código de 6 dígitos" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required
            value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))} />
          {error && <Alerta>{error}</Alerta>}
          <Boton type="submit" className="w-full" cargando={enviando} disabled={codigo.length !== 6}>
            <ShieldCheck className="size-5" aria-hidden /> Activar y entrar
          </Boton>
        </form>
      </MarcoAcceso>
    );
  }

  if (paso.tipo === "verificar") {
    return (
      <MarcoAcceso titulo="Verificación en dos pasos">
        <form
          className="space-y-4"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            void ejecutar(async () => {
              const { data } = await api.post<RespuestaSesion>("/auth/mfa/verificar", { desafio: paso.desafio, codigo });
              await tras(data);
            });
          }}
        >
          <p className="flex items-start gap-3 text-slate-700">
            <Smartphone className="mt-0.5 size-6 shrink-0 text-naranja" aria-hidden />
            Abre tu app autenticadora y escribe el código de 6 dígitos. También puedes usar un código de respaldo (XXXXX-XXXXX).
          </p>
          <Campo label="Código" autoComplete="one-time-code" maxLength={11} required value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())} />
          {error && <Alerta>{error}</Alerta>}
          <Boton type="submit" className="w-full" cargando={enviando}>
            <KeyRound className="size-5" aria-hidden /> Verificar
          </Boton>
          <button type="button" className="min-h-12 w-full text-slate-600 underline" onClick={() => { setPaso({ tipo: "credenciales" }); setCodigo(""); }}>
            Volver
          </button>
        </form>
      </MarcoAcceso>
    );
  }

  return (
    <MarcoAcceso titulo="Ingresar al ERP">
      <form
        className="space-y-4"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void ejecutar(async () => {
            const { data } = await api.post<RespuestaSesion>("/auth/login", { email, password: clave });
            setClave("");
            await tras(data);
          });
        }}
      >
        <Campo label="Correo" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Campo label="Contraseña" type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
        {error && <Alerta>{error}</Alerta>}
        <Boton type="submit" className="w-full" cargando={enviando}>
          <LogIn className="size-5" aria-hidden /> Ingresar
        </Boton>
        <Link to="/recuperar" className="flex min-h-12 items-center justify-center text-slate-600 underline">¿Olvidaste tu contraseña?</Link>
      </form>
    </MarcoAcceso>
  );
}
