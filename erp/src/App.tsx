import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import Layout from "./componentes/Layout";
import { Cargando } from "./componentes/ui";
import { tiene } from "./lib/menu";
import { useSesion } from "./lib/sesion";
import CambiarClave from "./paginas/CambiarClave";
import Inicio from "./paginas/Inicio";
import Login from "./paginas/Login";
import { Recuperar, Restablecer } from "./paginas/Recuperar";

const Obras = lazy(() => import("./paginas/Obras"));
const ObraNueva = lazy(() => import("./paginas/ObraNueva"));
const ObraDetalle = lazy(() => import("./paginas/ObraDetalle"));
const Usuarios = lazy(() => import("./paginas/Usuarios"));
const UsuarioDetalle = lazy(() => import("./paginas/UsuarioDetalle"));
const Roles = lazy(() => import("./paginas/Roles"));
const Configuracion = lazy(() => import("./paginas/Configuracion"));
const Auditoria = lazy(() => import("./paginas/Auditoria"));
const ModuloPendiente = lazy(() => import("./paginas/ModuloPendiente"));
const Trabajadores = lazy(() => import("./paginas/Trabajadores"));
const TrabajadorDetalle = lazy(() => import("./paginas/TrabajadorDetalle"));
const ImportarTrabajadores = lazy(() => import("./paginas/ImportarTrabajadores"));
const Asistencia = lazy(() => import("./paginas/Asistencia"));
const Dispositivos = lazy(() => import("./paginas/Dispositivos"));
const ConsentimientoTexto = lazy(() => import("./paginas/ConsentimientoTexto"));

/** Solo oculta: el servidor vuelve a verificar el permiso en cada petición. */
function ConPermiso({ permiso, children }: { permiso: string; children: ReactNode }) {
  const { yo } = useSesion();
  if (!tiene(yo, permiso)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { yo, cargando } = useSesion();
  const { pathname } = useLocation();

  if (cargando) return <Cargando texto="Verificando sesión…" />;

  if (!yo) {
    return (
      <Routes>
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/restablecer" element={<Restablecer />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Con clave temporal, lo único permitido es cambiarla.
  if (yo.debeCambiarPassword && pathname !== "/cuenta") return <CambiarClave obligatorio />;

  return (
    <Layout>
      <Suspense fallback={<Cargando />}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/cuenta" element={<CambiarClave />} />
          <Route path="/obras" element={<ConPermiso permiso="core.obra.ver"><Obras /></ConPermiso>} />
          <Route path="/obras/nueva" element={<ConPermiso permiso="core.obra.crear"><ObraNueva /></ConPermiso>} />
          <Route path="/obras/:id" element={<ConPermiso permiso="core.obra.ver"><ObraDetalle /></ConPermiso>} />
          <Route path="/usuarios" element={<ConPermiso permiso="core.usuario.ver"><Usuarios /></ConPermiso>} />
          <Route path="/usuarios/:id" element={<ConPermiso permiso="core.usuario.ver"><UsuarioDetalle /></ConPermiso>} />
          <Route path="/roles" element={<ConPermiso permiso="core.rol.ver"><Roles /></ConPermiso>} />
          <Route path="/configuracion" element={<ConPermiso permiso="core.configuracion.ver"><Configuracion /></ConPermiso>} />
          <Route path="/auditoria" element={<ConPermiso permiso="audit.evento.ver"><Auditoria /></ConPermiso>} />
          <Route path="/trabajadores" element={<ConPermiso permiso="rrhh.trabajador.ver"><Trabajadores /></ConPermiso>} />
          <Route path="/trabajadores/importar" element={<ConPermiso permiso="rrhh.importacion.gestionar"><ImportarTrabajadores /></ConPermiso>} />
          <Route path="/trabajadores/:id" element={<ConPermiso permiso="rrhh.trabajador.ver"><TrabajadorDetalle /></ConPermiso>} />
          <Route path="/asistencia" element={<ConPermiso permiso="campo.marcaje.ver"><Asistencia /></ConPermiso>} />
          <Route path="/dispositivos" element={<ConPermiso permiso="core.dispositivo.aprobar"><Dispositivos /></ConPermiso>} />
          <Route path="/consentimiento" element={<ConPermiso permiso="campo.consentimiento.gestionar"><ConsentimientoTexto /></ConPermiso>} />
          <Route path="/modulo/:slug" element={<ModuloPendiente />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
