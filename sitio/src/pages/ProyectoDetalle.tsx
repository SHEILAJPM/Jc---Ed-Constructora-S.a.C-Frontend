import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import AntesDespues from "../components/ui/AntesDespues";
import { EncabezadoSeccion, Reveal } from "../components/ui/Animados";
import { BotonLink } from "../components/ui/Boton";
import CabeceraPagina from "../components/ui/CabeceraPagina";
import Cargando from "../components/ui/Cargando";
import Lightbox from "../components/ui/Lightbox";
import { LaminaProvisional } from "../components/ui/Planos";
import Seo from "../components/ui/Seo";
import { useProyecto } from "../lib/consultas";
import { etiquetaCategoria } from "../lib/empresa";
import NoEncontrado from "./NoEncontrado";

function incrustarVideo(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1`;
  return null;
}

export default function ProyectoDetalle() {
  const { slug = "" } = useParams();
  const { data: p, isLoading, isError } = useProyecto(slug);
  const [indice, setIndice] = useState<number | null>(null);

  if (isLoading) return <Cargando texto="Cargando proyecto" />;
  if (isError || !p) return <NoEncontrado />;

  const ficha = [
    ["Cliente", p.clientName],
    ["Ubicación", p.location],
    ["Año", p.year?.toString()],
    ["Área", p.areaM2 ? `${p.areaM2.toLocaleString("es-PE")} m²` : null],
    ["Plazo", p.durationText],
    ["Servicio", p.serviceTitle],
  ].filter(([, v]) => v) as [string, string][];
  const video = p.videoUrl ? incrustarVideo(p.videoUrl) : null;

  return (
    <>
      <Seo
        title={p.seoTitle ?? p.title}
        description={p.seoDescription ?? p.summary}
        path={`/proyectos/${p.slug}`}
        image={p.gallery[0]?.url}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Project",
          name: p.title,
          description: p.summary,
          ...(p.location && { location: p.location }),
          ...(p.gallery[0] && { image: p.gallery.map((g) => g.url) }),
        }}
      />
      <CabeceraPagina
        lamina={`${etiquetaCategoria(p.category)}${p.year ? ` · ${p.year}` : ""}${p.sample ? " · PROYECTO DE EJEMPLO" : ""}`}
        titulo={p.title}
        bajada={p.summary}
        migas={[{ to: "/proyectos", label: "Proyectos" }, { to: `/proyectos/${p.slug}`, label: p.title }]}
      />

      <section className="contenedor seccion grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          {p.gallery.length === 0 ? (
            <div className="cotas aspect-[16/10]"><LaminaProvisional categoria={p.category} titulo={p.title} /></div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {p.gallery.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setIndice(i)}
                  className={`group relative overflow-hidden bg-marino ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]"}`}
                  aria-label={`Ampliar imagen: ${g.alt}`}
                >
                  <img src={g.url} alt={g.alt} loading={i === 0 ? "eager" : "lazy"} decoding="async" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </button>
              ))}
            </div>
          )}
        </div>

        <Reveal as="aside" className="vidrio cotas h-fit p-7 lg:sticky lg:top-28">
          <h2 className="etiqueta mb-6">Ficha técnica</h2>
          <dl className="divide-y divide-linea">
            {ficha.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3">
                <dt className="text-acero">{k}</dt>
                <dd className="text-right font-mono text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <BotonLink to={`/cotizar${p.serviceSlug ? `?servicio=${p.serviceSlug}` : ""}`} className="mt-8 w-full">
            ¿Quieres algo similar?
          </BotonLink>
        </Reveal>
      </section>

      {(p.challenge || p.solution) && (
        <section className="seccion border-y border-linea bg-marino/50">
          <div className="contenedor grid gap-12 md:grid-cols-2">
            {p.challenge && (
              <Reveal>
                <p className="etiqueta mb-4 text-ambar">El reto</p>
                <p className="text-lg text-hormigon/85">{p.challenge}</p>
              </Reveal>
            )}
            {p.solution && (
              <Reveal delay={0.1}>
                <p className="etiqueta mb-4 text-ambar">La solución</p>
                <p className="text-lg text-hormigon/85">{p.solution}</p>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {p.before && p.after && (
        <section className="contenedor seccion">
          <EncabezadoSeccion etiqueta="Antes / Después" titulo="Desliza para comparar" />
          <div className="mt-12"><AntesDespues antes={p.before} despues={p.after} /></div>
        </section>
      )}

      {video && (
        <section className="contenedor pb-16">
          <div className="cotas aspect-video overflow-hidden bg-marino">
            <iframe src={video} title={`Video de ${p.title}`} loading="lazy" allow="fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" className="size-full" />
          </div>
        </section>
      )}

      {(p.previousSlug || p.nextSlug) && (
        <nav aria-label="Otros proyectos" className="contenedor grid gap-px border-y border-linea bg-linea sm:grid-cols-2">
          {p.previousSlug && (
            <Link to={`/proyectos/${p.previousSlug}`} className="group flex items-center gap-4 bg-noche py-8 pr-6">
              <ArrowLeft className="size-6 text-ambar transition-transform group-hover:-translate-x-1" aria-hidden />
              <span><span className="etiqueta block">Proyecto anterior</span><span className="font-display text-lg text-white">Ver obra</span></span>
            </Link>
          )}
          {p.nextSlug && (
            <Link to={`/proyectos/${p.nextSlug}`} className="group flex items-center justify-end gap-4 bg-noche py-8 pl-6 text-right sm:col-start-2">
              <span><span className="etiqueta block">Proyecto siguiente</span><span className="font-display text-lg text-white">Ver obra</span></span>
              <ArrowRight className="size-6 text-ambar transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          )}
        </nav>
      )}

      <Lightbox
        items={p.gallery.map((g) => ({ url: g.url, alt: g.alt }))}
        indice={indice}
        onCambiar={setIndice}
        onCerrar={() => setIndice(null)}
      />
    </>
  );
}
