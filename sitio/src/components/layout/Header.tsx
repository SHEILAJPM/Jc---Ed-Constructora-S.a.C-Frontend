import clsx from "clsx";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { NAV } from "../../lib/empresa";
import { BotonLink } from "../ui/Boton";
import Logo from "../ui/Logo";
import MenuMovil from "./MenuMovil";

/** Header sticky: se encoge y gana vidrio al hacer scroll; se oculta al bajar y reaparece al subir. */
export default function Header() {
  const [compacto, setCompacto] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    let ultimo = window.scrollY;
    let pendiente = false;
    const alScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setCompacto(y > 24);
        setOculto(y > 320 && y > ultimo + 4);
        if (y < ultimo - 4) setOculto(false);
        ultimo = y;
        pendiente = false;
      });
    };
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  useEffect(() => setMenuAbierto(false), [pathname]);

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,padding,border-color] duration-500 ease-[var(--ease-obra)]",
          oculto && !menuAbierto ? "-translate-y-full" : "translate-y-0",
          compacto ? "vidrio border-x-0 border-t-0 py-2" : "border-b border-transparent py-4 md:py-5",
        )}
      >
        <div className="contenedor flex items-center justify-between gap-6">
          <NavLink to="/" aria-label="JC & ED Constructora, ir al inicio" className="shrink-0">
            <Logo compacto={compacto} />
          </NavLink>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.to === "/"}
                    className={({ isActive }) =>
                      clsx(
                        "group relative px-4 py-2 font-display text-[0.95rem] font-medium transition-colors",
                        isActive ? "text-white" : "text-hormigon/75 hover:text-white",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {n.label}
                        <span
                          className={clsx(
                            "absolute inset-x-4 -bottom-0.5 h-px origin-left bg-ambar transition-transform duration-500 ease-[var(--ease-obra)]",
                            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                          )}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {/* En móvil el CTA vive dentro del menú: aquí no cabe junto a la hamburguesa. */}
            <div className="hidden md:block">
              <BotonLink to="/cotizar">Cotizar Proyecto</BotonLink>
            </div>
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-[3px] border border-linea text-hormigon lg:hidden"
              aria-label="Abrir menú"
              aria-expanded={menuAbierto}
              aria-controls="menu-movil"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </header>
      <MenuMovil abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
    </>
  );
}
