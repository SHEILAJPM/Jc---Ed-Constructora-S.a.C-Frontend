import { Marquesina } from "../components/ui/Animados";
import Seo, { jsonLdEmpresa } from "../components/ui/Seo";
import Hero from "../sections/home/Hero";
import ProyectosDestacados from "../sections/home/ProyectosDestacados";
import { CalidadEtica, Cifras, Clientes, CtaFinal, Proceso, Sectores, ServiciosResumen, Testimonios } from "../sections/home/Secciones";

const ESPECIALIDADES = ["Obras civiles", "Saneamiento", "Infraestructura", "Remodelaciones", "Demoliciones", "Excavaciones"] as const;

export default function Inicio() {
  return (
    <>
      <Seo
        title="JC & ED Constructora SAC | Constructora en Lima: obras civiles, remodelaciones y demoliciones"
        description="Constructora en Lima desde 2012. Diseño y construcción de obras civiles, infraestructura, saneamiento, remodelaciones, demoliciones y excavaciones con 4 certificaciones INACAL."
        path="/"
        jsonLd={jsonLdEmpresa()}
      />
      <Hero />
      <div className="cinta h-1.5" aria-hidden />
      <Marquesina items={ESPECIALIDADES} className="border-b border-linea bg-noche py-7" />
      <Cifras />
      <ServiciosResumen />
      <ProyectosDestacados />
      <Proceso />
      <CalidadEtica />
      <Sectores />
      <Testimonios />
      <Clientes />
      <CtaFinal />
    </>
  );
}
