import clsx from "clsx";
import {
  BedDouble, Box, Building2, CheckSquare, Clock, DraftingCompass, Gauge, HardHat, Handshake, History, Home, KeyRound,
  FileText, LogOut, Menu, Settings, ShoppingCart, Smartphone, Truck, User, UserCog, Users, Wallet, X, type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router";
import { menuPara, type ItemMenu } from "../lib/menu";
import { useSesion } from "../lib/sesion";
import LimiteError from "./LimiteError";
import Logo from "./Logo";

const ICONOS: Record<string, LucideIcon> = {
  home: Home, gauge: Gauge, check: CheckSquare, obra: Building2, reloj: Clock, personas: Users, caja: Box,
  carrito: ShoppingCart, dinero: Wallet, camion: Truck, cama: BedDouble, plano: DraftingCompass, casco: HardHat,
  apreton: Handshake, persona: User, usuarios: UserCog, llave: KeyRound, ajustes: Settings, historial: History,
  celular: Smartphone, documento: FileText,
};

const GRUPOS: { id: ItemMenu["grupo"]; titulo?: string }[] = [
  { id: "principal" },
  { id: "modulos", titulo: "Módulos" },
  { id: "admin", titulo: "Administración" },
];

function Navegacion({ onNavegar }: { onNavegar?: () => void }) {
  const { yo } = useSesion();
  const items = menuPara(yo);
  return (
    <nav aria-label="Menú principal" className="flex-1 overflow-y-auto px-3 py-4">
      {GRUPOS.map((g) => {
        const delGrupo = items.filter((i) => i.grupo === g.id);
        if (!delGrupo.length) return null;
        return (
          <div key={g.id} className="mb-5">
            {g.titulo && <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">{g.titulo}</p>}
            <ul className="space-y-1">
              {delGrupo.map((i) => {
                const Icono = ICONOS[i.icono] ?? Home;
                return (
                  <li key={i.ruta}>
                    <NavLink
                      to={i.ruta}
                      end={i.ruta === "/"}
                      onClick={onNavegar}
                      className={({ isActive }) =>
                        clsx(
                          "flex min-h-12 items-center gap-3 rounded-lg px-3 font-medium transition-colors",
                          isActive ? "bg-naranja text-white" : "text-slate-200 hover:bg-white/10 hover:text-white",
                        )
                      }
                    >
                      <Icono className="size-5 shrink-0" aria-hidden />
                      <span className="flex-1">{i.etiqueta}</span>
                      {i.fase && <span className="rounded bg-white/10 px-1.5 text-xs text-slate-300">F{i.fase}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function PieUsuario() {
  const { yo, salir } = useSesion();
  return (
    <div className="border-t border-white/10 p-3">
      <NavLink to="/cuenta" className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-slate-200 hover:bg-white/10">
        <span className="flex size-9 items-center justify-center rounded-full bg-naranja font-bold text-white">
          {yo?.nombre.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate font-semibold text-white">{yo?.nombre}</span>
          <span className="block truncate text-sm text-slate-400">{yo?.roles[0]?.rolNombre ?? "Sin rol asignado"}</span>
        </span>
      </NavLink>
      <button type="button" onClick={() => void salir()} className="mt-1 flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-slate-300 hover:bg-white/10 hover:text-white">
        <LogOut className="size-5" aria-hidden /> Cerrar sesión
      </button>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setAbierto(false), [pathname]);

  return (
    <div className="min-h-dvh lg:pl-72">
      {/* Barra lateral fija (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-grafito lg:flex">
        <div className="flex h-16 items-center px-6"><Logo /></div>
        <Navegacion />
        <PieUsuario />
      </aside>

      {/* Barra superior (móvil) */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-grafito px-4 lg:hidden">
        <Logo />
        <button type="button" onClick={() => setAbierto(true)} aria-label="Abrir menú" aria-expanded={abierto}
          className="inline-flex size-12 items-center justify-center rounded-lg text-white hover:bg-white/10">
          <Menu className="size-6" />
        </button>
      </header>

      {/* Cajón (móvil) */}
      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setAbierto(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-80 flex-col bg-grafito shadow-xl">
            <div className="flex h-16 items-center justify-between px-4">
              <Logo />
              <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar menú"
                className="inline-flex size-12 items-center justify-center rounded-lg text-white hover:bg-white/10">
                <X className="size-6" />
              </button>
            </div>
            <Navegacion onNavegar={() => setAbierto(false)} />
            <PieUsuario />
          </div>
        </div>
      )}

      <main id="contenido" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <LimiteError clave={pathname}>{children}</LimiteError>
      </main>
    </div>
  );
}
