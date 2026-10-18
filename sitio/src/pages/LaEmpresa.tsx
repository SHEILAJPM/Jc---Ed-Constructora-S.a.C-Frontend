import { Award, Eye, Handshake, HardHat, Lightbulb, ShieldCheck, Target } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EncabezadoSeccion, Reveal } from "../components/ui/Animados";
import CabeceraPagina from "../components/ui/CabeceraPagina";
import Seo from "../components/ui/Seo";
import { CalidadEtica, CtaFinal } from "../sections/home/Secciones";

// Hitos con fechas por confirmar: solo 2012 (fundación) es un dato oficial.
const HITOS = [
  { anio: "2012", t: "Fundación", d: "Nace JC & ED Constructora con objetivos comprometidos con la ética y la integridad." },
  { anio: "20XX", t: "Hito por confirmar", d: "Primeras obras de infraestructura y saneamiento (completar fecha y detalle)." },
  { anio: "20XX", t: "Certificaciones INACAL", d: "Obtención de las certificaciones en control y gestión de calidad (completar fechas)." },
  { anio: "20XX", t: "Hito por confirmar", d: "Proyectos para los sectores salud y educación (completar)." },
  { anio: "Hoy", t: "Más de 100 obras", d: "Seguimos innovando y mejorando continuamente en un mercado exigente." },
];

const VALORES = [
  { t: "Integridad", d: "Actuamos con honestidad y transparencia en cada contrato.", I: Handshake },
  { t: "Seguridad", d: "La vida y la salud de nuestro equipo están primero.", I: HardHat },
  { t: "Calidad", d: "Protocolos y controles certificados en cada partida.", I: Award },
  { t: "Compromiso", d: "Cumplimos lo que firmamos: alcance, plazo y presupuesto.", I: ShieldCheck },
  { t: "Innovación", d: "Mejora continua en métodos, equipos y gestión.", I: Lightbulb },
];

function LineaDeTiempo() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const escala = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <div ref={ref} className="relative mt-16">
      <div className="absolute left-4 top-0 h-full w-px bg-linea md:left-1/2" aria-hidden />
      <motion.div style={{ scaleY: escala }} className="absolute left-4 top-0 h-full w-px origin-top bg-gradient-to-b from-ambar to-naranja md:left-1/2" aria-hidden />
      <ol className="space-y-14">
        {HITOS.map((h, i) => (
          <li key={i} className={`relative grid pl-12 md:grid-cols-2 md:pl-0 ${i % 2 ? "md:[&>div]:col-start-2 md:[&>div]:pl-14" : "md:[&>div]:pr-14 md:[&>div]:text-right"}`}>
            <span className="absolute left-[9px] top-2 size-3 rounded-full bg-ambar ring-4 ring-noche md:left-[calc(50%-6px)]" aria-hidden />
            <Reveal>
              <p className="font-mono text-3xl font-bold text-ambar">{h.anio}</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-white">{h.t}</h3>
              <p className="mt-2 text-hormigon/70">{h.d}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function LaEmpresa() {
  return (
    <>
      <Seo
        title="La empresa"
        description="Constructora peruana fundada en 2012, comprometida con la ética, la integridad y la calidad certificada por INACAL."
        path="/la-empresa"
      />
      <CabeceraPagina
        lamina="Lámina 04 · La empresa"
        titulo="No solo solucionamos problemas, creamos soluciones"
        resaltar={["soluciones"]}
        bajada="Fundada a inicios de 2012 con objetivos comprometidos con la ética y la integridad. Innovación y mejora continua para un mercado exigente."
        migas={[{ to: "/la-empresa", label: "La Empresa" }]}
      />

      <section className="contenedor seccion">
        <EncabezadoSeccion etiqueta="Historia" titulo="De 2012 a hoy" />
        <LineaDeTiempo />
      </section>

      <section className="seccion border-y border-linea bg-marino/50">
        <div className="contenedor grid gap-6 md:grid-cols-2">
          <Reveal className="vidrio cotas p-8 lg:p-10">
            <Target className="size-10 text-ambar" aria-hidden />
            <h2 className="mt-6 font-display text-3xl font-bold text-white">Misión</h2>
            <p className="mt-4 text-lg text-hormigon/80">
              Ser una empresa de construcción sólida en el mercado nacional, que da valor a sus clientes antes, durante y después del
              proyecto, con servicios integrados en obras civiles, infraestructura y saneamiento.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="vidrio cotas p-8 lg:p-10">
            <Eye className="size-10 text-ambar" aria-hidden />
            <h2 className="mt-6 font-display text-3xl font-bold text-white">Visión</h2>
            <p className="mt-4 text-lg text-hormigon/80">
              Ser una de las mejores constructoras del mercado nacional, reconocida por su ética y liderazgo en calidad, mejorando el
              entorno y el medio ambiente, con personal motivado y orgulloso de pertenecer.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="contenedor seccion">
        <EncabezadoSeccion etiqueta="Valores" titulo="Lo que no negociamos" />
        <ul className="mt-14 grid gap-px bg-linea sm:grid-cols-2 lg:grid-cols-5">
          {VALORES.map(({ t, d, I }, i) => (
            <Reveal as="li" key={t} delay={i * 0.06} className="bg-noche p-7">
              <I className="size-9 text-ambar" aria-hidden strokeWidth={1.4} />
              <h3 className="mt-5 font-display text-xl font-semibold text-white">{t}</h3>
              <p className="mt-2 text-sm text-hormigon/70">{d}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section id="etica" className="seccion border-y border-linea bg-marino/50">
        <div className="contenedor grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <EncabezadoSeccion etiqueta="Código de ética" titulo="No solo construimos obras, también valores" resaltar={["valores"]} />
          <div className="space-y-10 text-hormigon/85">
            <Reveal>
              <h3 className="etiqueta mb-3 text-ambar">Objetivo</h3>
              <p>Establecer los principios y conductas que guían a todas las personas que trabajan en JC &amp; ED Constructora, para actuar con integridad frente a clientes, proveedores, autoridades y la comunidad.</p>
            </Reveal>
            <Reveal>
              <h3 className="etiqueta mb-3 text-ambar">Alcance</h3>
              <p>Aplica a socios, gerencia, personal administrativo y de obra, subcontratistas y proveedores que actúan en nombre de la empresa.</p>
            </Reveal>
            <Reveal>
              <h3 className="etiqueta mb-3 text-ambar">Principios</h3>
              <ul className="list-disc space-y-2 pl-5 marker:text-ambar">
                <li>Honestidad y transparencia en presupuestos, valorizaciones y comunicaciones.</li>
                <li>Cero tolerancia a la corrupción, el soborno y los conflictos de interés.</li>
                <li>Seguridad y salud en el trabajo como prioridad en cada obra.</li>
                <li>Respeto al medio ambiente y a la comunidad del entorno de la obra.</li>
                <li>Trato digno, igualitario y sin discriminación.</li>
                <li>Confidencialidad de la información de clientes y trabajadores.</li>
              </ul>
              <p className="mt-4 text-sm text-acero">Texto base: reemplazar por el código de ética oficial aprobado por la empresa.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <CalidadEtica />

      <section className="contenedor seccion">
        <EncabezadoSeccion etiqueta="Equipo" titulo="Las personas detrás de cada obra" bajada="Fotos y cargos por reemplazar con el equipo real." />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {["Gerencia General", "Ingeniería y Proyectos", "Seguridad y Salud (SSOMA)", "Administración"].map((area, i) => (
            <Reveal as="li" key={area} delay={i * 0.06}>
              <div className="reticula cotas flex aspect-[3/4] items-end bg-marino p-5">
                <div>
                  <p className="etiqueta">Foto por reemplazar</p>
                  <p className="mt-1 font-display text-lg font-semibold text-white">{area}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <CtaFinal />
    </>
  );
}
