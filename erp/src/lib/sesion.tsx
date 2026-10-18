import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { alPerderSesion, api, fijarToken, renovar } from "./api";
import type { Yo } from "./tipos";

interface Sesion {
  yo: Yo | null;
  cargando: boolean;
  /** Tras un login exitoso: guarda el token y carga el perfil. */
  iniciar: (accessToken: string) => Promise<void>;
  recargar: () => Promise<void>;
  salir: () => Promise<void>;
}

const Ctx = createContext<Sesion | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [yo, setYo] = useState<Yo | null>(null);
  const [cargando, setCargando] = useState(true);
  const qc = useQueryClient();

  const recargar = useCallback(async () => {
    const { data } = await api.get<Yo>("/auth/me");
    setYo(data);
  }, []);

  const iniciar = useCallback(async (token: string) => {
    fijarToken(token);
    await recargar();
  }, [recargar]);

  const salir = useCallback(async () => {
    try {
      await api.post("/auth/logout", null, { headers: { "X-ERP-Cliente": "web" } });
    } catch {
      /* aunque falle la red, la sesión local se cierra */
    }
    fijarToken(null);
    setYo(null);
    qc.clear();
  }, [qc]);

  // Al abrir la app: si hay cookie de refresh válida, se recupera la sesión sin pedir clave.
  useEffect(() => {
    alPerderSesion(() => {
      fijarToken(null);
      setYo(null);
      qc.clear();
    });
    renovar()
      .then(async (t) => {
        if (t) await recargar();
      })
      .catch(() => setYo(null))
      .finally(() => setCargando(false));
  }, [qc, recargar]);

  return <Ctx.Provider value={{ yo, cargando, iniciar, recargar, salir }}>{children}</Ctx.Provider>;
}

export function useSesion() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSesion fuera de ProveedorSesion");
  return s;
}
