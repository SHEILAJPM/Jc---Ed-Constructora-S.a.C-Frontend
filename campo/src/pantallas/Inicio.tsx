import { useCallback, useEffect, useState } from "react";
import type { Pantalla } from "../App";
import { IconoAlerta, IconoCamara, IconoLista, IconoNube, IconoUbicacion } from "../Iconos";
import { cola } from "../lib/almacen";
import { api, cerrarSesionLocal, SinConexion } from "../lib/api";
import { sincronizar } from "../lib/marcaje";
import { Aviso } from "./Login";

export interface Estado {
  nombre: string;
  documento: string;
  consintio: boolean;
  dispositivoEstado: string;
  zona: { obra: string; lat: number; lng: number; radioM: number } | null;
  bloqueos: string[];
  puedeMarcar: boolean;
  ultimoTipo: "ENTRADA" | "SALIDA" | null;
  ultimaHora: string | null;
  comisionVigente: string | null;
}

const hora = (iso: string) => new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

export default function Inicio({ ir }: { ir: (p: Pantalla) => void }) {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [sinSenal, setSinSenal] = useState(false);
  const [pendientes, setPendientes] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setPendientes((await cola.todos()).length);
    try {
      const e = await api<Estado>("/campo/estado");
      setEstado(e);
      setSinSenal(false);
      localStorage.setItem("jced-estado", JSON.stringify(e));
      if (!e.consintio) ir({ id: "consentimiento" });
    } catch (err) {
      if (err instanceof SinConexion) {
        setSinSenal(true);
        // Sin señal: se usa el último estado conocido para poder marcar igual.
        const guardado = localStorage.getItem("jced-estado");
        if (guardado) setEstado(JSON.parse(guardado));
      } else {
        setError(err instanceof Error ? err.message : "Error");
      }
    }
  }, [ir]);

  useEffect(() => {
    void cargar();
    const alVolver = () => void sincronizar().then(cargar);
    window.addEventListener("online", alVolver);
    return () => window.removeEventListener("online", alVolver);
  }, [cargar]);

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <Aviso>{error}</Aviso>
        <button className="boton-secundario mt-auto" onClick={async () => { await cerrarSesionLocal(); ir({ id: "login" }); }}>Salir</button>
      </div>
    );
  }
  if (!estado) return <p className="m-auto text-slate-600">Cargando…</p>;

  const siguiente = estado.ultimoTipo === "ENTRADA" ? "SALIDA" : "ENTRADA";
  const pendienteCelular = estado.dispositivoEstado === "PENDIENTE";

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <p className="text-slate-600">Hola,</p>
        <h1 className="text-2xl font-extrabold leading-tight">{estado.nombre}</h1>
      </div>

      {sinSenal && (
        <Aviso tipo="info">
          <span className="flex items-center gap-2"><IconoNube className="size-6 shrink-0" /> Sin señal. Puedes marcar igual: se enviará al volver la conexión con la hora de ahora.</span>
        </Aviso>
      )}

      {estado.zona && (
        <div className="tarjeta flex items-start gap-3">
          <IconoUbicacion className="size-7 shrink-0 text-naranja" />
          <div>
            <p className="font-bold">{estado.zona.obra}</p>
            <p className="text-base text-slate-600">Marca dentro de {estado.zona.radioM} m del punto de la obra.</p>
            {estado.comisionVigente && <p className="mt-1 text-base font-semibold text-sky-800">En comisión: {estado.comisionVigente}</p>}
          </div>
        </div>
      )}

      {pendienteCelular && (
        <Aviso>Este celular está esperando la aprobación del Administrador. Mientras tanto no puedes marcar desde aquí.</Aviso>
      )}

      {estado.bloqueos.length > 0 && (
        <div role="alert" className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-red-900">
          <p className="flex items-center gap-2 font-bold"><IconoAlerta className="size-6" /> No puedes marcar</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {estado.bloqueos.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      )}

      {estado.ultimaHora && (
        <p className="text-center text-slate-600">
          Última marca: <strong>{estado.ultimoTipo === "ENTRADA" ? "Entrada" : "Salida"}</strong> a las {hora(estado.ultimaHora)}
        </p>
      )}

      {pendientes > 0 && (
        <button className="boton-secundario" onClick={() => void sincronizar().then(cargar)}>
          <IconoNube className="size-6" /> {pendientes} marcaje(s) por enviar · Enviar ahora
        </button>
      )}

      <button
        className="boton-primario mt-auto min-h-24 text-2xl"
        disabled={!estado.consintio || pendienteCelular || estado.bloqueos.length > 0}
        onClick={() => ir({ id: "marcar", tipo: siguiente })}
      >
        <IconoCamara className="size-9" /> MARCAR {siguiente}
      </button>
      <button className="boton-secundario" onClick={() => ir({ id: "historial" })}>
        <IconoLista className="size-6" /> Mis marcajes
      </button>
    </div>
  );
}
