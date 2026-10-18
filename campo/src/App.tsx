import { useCallback, useEffect, useState } from "react";
import { datosSesion, renovar } from "./lib/api";
import { Logo } from "./Iconos";
import CambiarPin from "./pantallas/CambiarPin";
import Consentimiento from "./pantallas/Consentimiento";
import Historial from "./pantallas/Historial";
import Inicio from "./pantallas/Inicio";
import Login from "./pantallas/Login";
import Marcar from "./pantallas/Marcar";
import { sincronizar } from "./lib/marcaje";

export type Pantalla =
  | { id: "cargando" }
  | { id: "login" }
  | { id: "pin" }
  | { id: "inicio" }
  | { id: "consentimiento" }
  | { id: "marcar"; tipo: "ENTRADA" | "SALIDA" }
  | { id: "historial" };

export default function App() {
  const [pantalla, setPantalla] = useState<Pantalla>({ id: "cargando" });
  const ir = useCallback((p: Pantalla) => setPantalla(p), []);

  // Al abrir: recupera la sesión (con la firma del celular) o pide ingresar.
  useEffect(() => {
    (async () => {
      if (!(await datosSesion())) return ir({ id: "login" });
      try {
        const s = await renovar();
        if (!s) return ir({ id: "login" });
        ir({ id: s.debeCambiarPin ? "pin" : "inicio" });
      } catch {
        ir({ id: "inicio" }); // sin señal: igual puede marcar (se guarda en la cola)
      }
    })();
  }, [ir]);

  // Cola offline: se envía al volver la señal, al volver a la app y cada minuto.
  useEffect(() => {
    const intentar = () => void sincronizar();
    window.addEventListener("online", intentar);
    document.addEventListener("visibilitychange", intentar);
    const t = setInterval(intentar, 60_000);
    return () => {
      window.removeEventListener("online", intentar);
      document.removeEventListener("visibilitychange", intentar);
      clearInterval(t);
    };
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex h-16 shrink-0 items-center bg-grafito px-4">
        <Logo />
      </header>
      <main className="flex flex-1 flex-col p-4">
        {pantalla.id === "cargando" && <p className="m-auto text-slate-600">Cargando…</p>}
        {pantalla.id === "login" && <Login ir={ir} />}
        {pantalla.id === "pin" && <CambiarPin ir={ir} />}
        {pantalla.id === "inicio" && <Inicio ir={ir} />}
        {pantalla.id === "consentimiento" && <Consentimiento ir={ir} />}
        {pantalla.id === "marcar" && <Marcar ir={ir} tipo={pantalla.tipo} />}
        {pantalla.id === "historial" && <Historial ir={ir} />}
      </main>
    </div>
  );
}
