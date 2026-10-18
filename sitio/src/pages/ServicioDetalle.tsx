import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useParams } from "react-router";
import Acordeon from "../components/ui/Acordeon";
import { EncabezadoSeccion, Reveal } from "../components/ui/Animados";
import { BotonLink } from "../components/ui/Boton";
import CabeceraPagina from "../components/ui/CabeceraPagina";
import Cargando from "../components/ui/Cargando";
import { ICONOS_SERVICIO, PlanoEdificio } from "../components/ui/Planos";
import Seo from "../components/ui/Seo";
import TarjetaProyecto from "../components/ui/TarjetaProyecto";
import { useProyectosRelacionados, useServicio } from "../lib/consultas";
import NoEncontrado from "./NoEncontrado";

export default function ServicioDetalle() {
  const { slug = "" } = useParams();
  const { data: s, isLoading, isError } = useServicio(slug);
  const { data: relacionados } = useProyectosRelacionados(slug);

  if (isLoading) return <Cargando texto="Cargando servicio" />;
  if (isError || !s) return <NoEncontrado />;
  const Icono = ICONOS_SERVICIO[s.icon] ?? PlanoEdificio;

  return (
    <>
      <Seo
        title={s.seoTitle ?? s.title}
        description={s.seoDescription ?? s.shortDescription}
        path={`/servicios/${s.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: s.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
        }}
      />
      <CabeceraPagina
        lamina={`Especialidad · ${s.title}`}
        titulo={s.title}
        bajada={s.shortDescription}
        migas={[{ to: "/servicios", label: "Servicios" }, { to: `/servicios/${s.slug}`, label: s.title }]}
      >
        <Reveal delay={0.25}>
          <BotonLink to={`/cotizar?servicio=${s.slug}`} className="mt-10">
            Cotizar {s.title.toLowerCase()} <ArrowRight className="size-4" aria-hidden />
          </BotonLink>
        </Reveal>
      </CabeceraPagina>

      <section className="contenedor seccion grid gap-14 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <p className="font-display text-2xl leading-relaxed text-white md:text-3xl">{s.description}</p>
        </Reveal>
        <Reveal delay={0.1} className="vidrio cotas p-8">
          <Icono className="mb-6 size-16 text-ambar" />
          <h2 className="etiqueta mb-5">Qué incluye</h2>
          <ul className="space-y-3">
            {s.includes.map((x) => (
              <li key={x} className="flex gap-3 text-hormigon/85">
                <Check className="mt-1 size-4 shrink-0 text-ambar" aria-hidden /> {x}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="seccion border-y border-linea bg-marino/50">
        <div className="contenedor">
          <EncabezadoSeccion etiqueta="Etapas" titulo="Así ejecutamos el servicio" />
          <ol className="mt-14 grid gap-px bg-linea md:grid-cols-2 lg:grid-cols-4">
            {s.stages.map((e, i) => (
              <Reveal as="li" key={e.title} delay={i * 0.08} className="bg-noche p-7">
                <span className="font-mono text-sm text-ambar">Etapa {String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">{e.title}</h3>
                <p className="mt-2 text-sm text-hormigon/70">{e.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="contenedor seccion grid gap-14 lg:grid-cols-2">
        <div>
          <EncabezadoSeccion etiqueta="Seguridad" titulo="Medidas de seguridad en obra" />
          <ul className="mt-10 space-y-4">
            {s.safetyMeasures.map((m) => (
              <Reveal as="li" key={m} className="flex items-start gap-4 border-b border-linea pb-4 text-hormigon/85">
                <ShieldCheck className="size-6 shrink-0 text-ambar" aria-hidden /> {m}
              </Reveal>
            ))}
          </ul>
        </div>
        <div>
          <EncabezadoSeccion etiqueta="Preguntas frecuentes" titulo="Lo que nos suelen preguntar" />
          <div className="mt-10">
            <Acordeon items={s.faqs.map((f) => ({ pregunta: f.question, respuesta: f.answer }))} />
          </div>
        </div>
      </section>

      {!!relacionados?.items.length && (
        <section className="contenedor pb-10">
          <EncabezadoSeccion etiqueta="Proyectos relacionados" titulo={`Obras de ${s.title.toLowerCase()}`} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {relacionados.items.map((p) => <TarjetaProyecto key={p.slug} p={p} />)}
          </div>
        </section>
      )}

      <section className="contenedor seccion">
        <div className="cinta mb-0 h-2" aria-hidden />
        <div className="flex flex-col items-start justify-between gap-6 bg-marino p-8 md:flex-row md:items-center md:p-12">
          <h2 className="font-display text-3xl font-bold text-white">¿Necesitas {s.title.toLowerCase()}?</h2>
          <BotonLink to={`/cotizar?servicio=${s.slug}`}>
            Solicitar cotización <ArrowRight className="size-4" aria-hidden />
          </BotonLink>
        </div>
      </section>
    </>
  );
}
