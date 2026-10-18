import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router";
import { AnimatePresence } from "motion/react";
import Layout from "./components/layout/Layout";
import PageTransition from "./components/layout/PageTransition";
import Cargando from "./components/ui/Cargando";
import Inicio from "./pages/Inicio";

// La portada va en el paquete principal; el resto se carga al navegar.
const Servicios = lazy(() => import("./pages/Servicios"));
const ServicioDetalle = lazy(() => import("./pages/ServicioDetalle"));
const Proyectos = lazy(() => import("./pages/Proyectos"));
const ProyectoDetalle = lazy(() => import("./pages/ProyectoDetalle"));
const LaEmpresa = lazy(() => import("./pages/LaEmpresa"));
const Contacto = lazy(() => import("./pages/Contacto"));
const Cotizar = lazy(() => import("./pages/Cotizar"));
const TrabajaConNosotros = lazy(() => import("./pages/TrabajaConNosotros"));
const LibroReclamaciones = lazy(() => import("./pages/LibroReclamaciones"));
const Privacidad = lazy(() => import("./pages/legal/Privacidad"));
const Terminos = lazy(() => import("./pages/legal/Terminos"));
const Cookies = lazy(() => import("./pages/legal/Cookies"));
const NoEncontrado = lazy(() => import("./pages/NoEncontrado"));

export default function App() {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait" initial={false}>
        <PageTransition key={location.pathname}>
          <Suspense fallback={<Cargando />}>
            <Routes location={location}>
              <Route path="/" element={<Inicio />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/servicios/:slug" element={<ServicioDetalle />} />
              <Route path="/proyectos" element={<Proyectos />} />
              <Route path="/proyectos/:slug" element={<ProyectoDetalle />} />
              <Route path="/la-empresa" element={<LaEmpresa />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/cotizar" element={<Cotizar />} />
              <Route path="/trabaja-con-nosotros" element={<TrabajaConNosotros />} />
              <Route path="/libro-de-reclamaciones" element={<LibroReclamaciones />} />
              <Route path="/politica-de-privacidad" element={<Privacidad />} />
              <Route path="/terminos-de-uso" element={<Terminos />} />
              <Route path="/politica-de-cookies" element={<Cookies />} />
              <Route path="*" element={<NoEncontrado />} />
            </Routes>
          </Suspense>
        </PageTransition>
      </AnimatePresence>
    </Layout>
  );
}
