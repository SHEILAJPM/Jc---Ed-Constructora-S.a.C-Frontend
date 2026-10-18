import { Construction } from "lucide-react";
import { Navigate, useParams } from "react-router";
import { Encabezado } from "../componentes/ui";
import { MENU, tiene } from "../lib/menu";
import { useSesion } from "../lib/sesion";

/** Módulos que se construyen en fases siguientes: el menú ya respeta los permisos de cada rol. */
export default function ModuloPendiente() {
  const { slug } = useParams();
  const { yo } = useSesion();
  const item = MENU.find((m) => m.ruta === `/modulo/${slug}`);
  if (!item || (item.permiso && !tiene(yo, item.permiso))) return <Navigate to="/" replace />;
  return (
    <>
      <Encabezado titulo={item.etiqueta} />
      <div className="tarjeta flex flex-col items-center gap-4 p-10 text-center">
        <Construction className="size-14 text-naranja" aria-hidden />
        <p className="text-xl font-semibold">Este módulo se construye en la Fase {item.fase}.</p>
        <p className="max-w-md text-slate-600">Tu rol ya tiene el acceso configurado: cuando el módulo esté listo, aparecerá aquí sin cambios adicionales.</p>
      </div>
    </>
  );
}
