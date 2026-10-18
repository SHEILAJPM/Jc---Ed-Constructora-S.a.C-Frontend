import { ArrowRight, ArrowUpRight, BadgeCheck, Building2, GraduationCap, HeartPulse, Landmark, Quote, Store, Waves } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import { Contador, EncabezadoSeccion, Reveal, TarjetaTilt, TituloPalabras } from "../../components/ui/Animados";
import { BotonLink } from "../../components/ui/Boton";
import Lightbox from "../../components/ui/Lightbox";
import { ICONOS_SERVICIO, PlanoEdificio } from "../../components/ui/Planos";
import { useCertificados, useCifras, useServicios, useTestimonios } from "../../lib/consultas";

// ─── Cifras ──────────────────────────────────────────────────────────────
export function Cifras() {
  const { data } = useCifras();
  if (!data?.length) return null;
  return (
    <section aria-label="La empresa en cifras" className="border-y border-linea bg-marino/60">
      <div className="contenedor grid divide-linea sm:grid-cols-3 sm:divide-x">
        {data.map((c, i) => (
          <Reveal key={c.code} delay={i * 0.1} className="cotas flex flex-col items-start gap-2 px-2 py-10 sm:px-8">
            <Contador valor={c.value} prefijo={c.prefix} sufijo={c.suffix} className="degradado-acento font-mono text-6xl font-bold tracking-tighter lg:text-7xl" />
            <p className="etiqueta text-hormigon/80">{c.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── Servicios resumidos ─────────────────────────────────────────────────
export function ServiciosResumen() {
  const { data } = useServicios();
  return (
    <section className="seccion contenedor" aria-labelledby="no-improvisamos">
      <EncabezadoSeccion
        etiqueta="Servicios"
        titulo="No improvisamos"
        bajada="Cuatro especialidades con un mismo método: planificación, supervisión de ingeniería y control de calidad en cada etapa."
      />
      <h2 id="no-improvisamos" className="sr-only">Servicios</h2>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {(data ?? []).map((s, i) => {
          const Icono = ICONOS_SERVICIO[s.icon] ?? PlanoEdificio;
          return (
            <Reveal key={s.slug} delay={i * 0.08}>
              <TarjetaTilt className="h-full rounded-[3px]">
                <Link to={`/servicios/${s.slug}`} className="vidrio borde-brillo flex h-full min-h-80 flex-col rounded-[3px] p-7" data-cursor="grande">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-sm text-ambar">{String(i + 1).padStart(2, "0")}</span>
                    <ArrowUpRight className="size-5 text-acero transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-ambar" aria-hidden />
                  </div>
                  <Icono className="my-8 size-16 text-ambar transition-transform duration-500 [transform:translateZ(40px)] group-hover:scale-110" />
                  <h3 className="font-display text-2xl font-semibold text-white">{s.title}</h3>
                  <p className="mt-3 text-sm text-hormigon/70">{s.shortDescription}</p>
                </Link>
              </TarjetaTilt>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ─── Proceso de trabajo ──────────────────────────────────────────────────
const PASOS = [
  { t: "Consulta y visita técnica", d: "Escuchamos tu idea y evaluamos el terreno o el espacio en persona." },
  { t: "Diseño y expediente", d: "Planos, especificaciones y expediente técnico listos para construir." },
  { t: "Presupuesto y cronograma", d: "Costos por partida y plazos claros antes de empezar." },
  { t: "Ejecución con supervisión", d: "Ingenieros en obra, protocolos de calidad y reportes de avance." },
  { t: "Entrega y postventa", d: "Entrega documentada y acompañamiento después del proyecto." },
];

export function Proceso() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const alto = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <section className="seccion relative overflow-hidden bg-marino/50" aria-labelledby="proceso">
      <div className="reticula absolute inset-0 -z-10 opacity-40" aria-hidden />
      <div className="contenedor grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <EncabezadoSeccion
            etiqueta="Proceso de trabajo"
            titulo="Antes, durante y después del proyecto"
            resaltar={["después"]}
            bajada="Damos valor a nuestros clientes en cada etapa. Así trabajamos, paso a paso."
          />
          <h2 id="proceso" className="sr-only">Proceso de trabajo</h2>
        </div>
        <div ref={ref} className="relative pl-10">
          <div className="absolute bottom-0 left-[11px] top-0 w-px bg-linea" aria-hidden />
          <motion.div style={{ height: alto }} className="absolute left-[11px] top-0 w-px bg-gradient-to-b from-ambar to-naranja" aria-hidden />
          <ol className="space-y-12">
            {PASOS.map((p, i) => (
              <Reveal as="li" key={p.t} className="relative">
                <span className="absolute -left-10 top-1 flex size-6 items-center justify-center rounded-full border border-ambar bg-noche font-mono text-[0.65rem] text-ambar">
                  {i + 1}
                </span>
                <h3 className="font-display text-2xl font-semibold text-white">{p.t}</h3>
                <p className="mt-2 max-w-md text-hormigon/70">{p.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ─── Calidad y ética ─────────────────────────────────────────────────────
export function CalidadEtica() {
  const { data: certs } = useCertificados();
  const [indice, setIndice] = useState<number | null>(null);
  const conImagen = (certs ?? []).filter((c) => c.imageUrl);
  return (
    <section className="seccion contenedor" aria-labelledby="calidad">
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <EncabezadoSeccion etiqueta="Calidad y ética" titulo="4 certificaciones INACAL" resaltar={["INACAL"]} />
          <h2 id="calidad" className="sr-only">Calidad y ética</h2>
          <Reveal delay={0.1}>
            <blockquote className="cotas mt-10 border-l-2 border-ambar bg-marino/60 p-7">
              <p className="font-display text-2xl font-semibold leading-snug text-white">
                “No solo construimos obras, también valores.”
              </p>
              <footer className="etiqueta mt-4">Código de ética · JC &amp; ED Constructora</footer>
            </blockquote>
          </Reveal>
          <Reveal delay={0.2}>
            <Link to="/la-empresa#etica" className="mt-8 inline-flex min-h-12 items-center gap-2 font-display font-semibold text-ambar hover:underline">
              Conoce nuestro código de ética <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
        </div>
        <ul className="grid grid-cols-2 gap-4">
          {(certs ?? []).map((c, i) => (
            <Reveal as="li" key={c.id} delay={i * 0.08}>
              <button
                type="button"
                disabled={!c.imageUrl}
                onClick={() => setIndice(conImagen.findIndex((x) => x.id === c.id))}
                className="vidrio cotas flex h-full min-h-44 w-full flex-col justify-between p-5 text-left enabled:hover:border-ambar/50"
                aria-label={c.imageUrl ? `Ver ${c.name}` : c.name}
              >
                <BadgeCheck className="size-9 text-ambar" aria-hidden />
                <span>
                  <span className="etiqueta block">{c.issuer}{c.code ? ` · ${c.code}` : ""}</span>
                  <span className="mt-1 block font-display font-semibold text-white">{c.name}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
      <Lightbox
        items={conImagen.map((c) => ({ url: c.imageUrl!, alt: c.name }))}
        indice={indice}
        onCambiar={setIndice}
        onCerrar={() => setIndice(null)}
      />
    </section>
  );
}

// ─── Sectores ────────────────────────────────────────────────────────────
const SECTORES = [
  { t: "Vivienda", I: Building2 },
  { t: "Comercial", I: Store },
  { t: "Salud", I: HeartPulse },
  { t: "Educación", I: GraduationCap },
  { t: "Saneamiento", I: Waves },
  { t: "Sector público", I: Landmark },
];

export function Sectores() {
  return (
    <section className="seccion border-y border-linea bg-marino/40" aria-labelledby="sectores">
      <div className="contenedor">
        <EncabezadoSeccion etiqueta="Sectores" titulo="Construimos para quienes construyen el país" centrado />
        <h2 id="sectores" className="sr-only">Sectores que atendemos</h2>
        <ul className="mt-14 grid grid-cols-2 gap-px bg-linea sm:grid-cols-3 lg:grid-cols-6">
          {SECTORES.map(({ t, I }, i) => (
            <Reveal as="li" key={t} delay={i * 0.06} className="group flex flex-col items-center gap-4 bg-noche px-4 py-10 text-center">
              <I className="size-10 text-acero transition-all duration-500 group-hover:-translate-y-1 group-hover:text-ambar" aria-hidden strokeWidth={1.3} />
              <span className="font-display font-semibold text-white">{t}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── Testimonios (solo reales y autorizados; si no hay, la sección no aparece) ──
export function Testimonios() {
  const { data } = useTestimonios();
  if (!data?.length) return null;
  return (
    <section className="seccion contenedor" aria-labelledby="testimonios">
      <EncabezadoSeccion etiqueta="Testimonios" titulo="Lo que dicen nuestros clientes" />
      <h2 id="testimonios" className="sr-only">Testimonios</h2>
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.08} className="vidrio flex flex-col justify-between p-7">
            <Quote className="size-8 text-ambar" aria-hidden />
            <p className="mt-5 text-lg text-hormigon/90">“{t.quote}”</p>
            <p className="mt-6 font-display font-semibold text-white">
              {t.authorName}
              <span className="block text-sm font-normal text-acero">{[t.authorRole, t.company].filter(Boolean).join(" · ")}</span>
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── Clientes / aliados (placeholders hasta tener logos autorizados) ─────
export function Clientes() {
  return (
    <section className="contenedor pb-8" aria-label="Clientes y aliados">
      <p className="etiqueta mb-8 text-center">Clientes y aliados · logos por reemplazar</p>
      <ul className="grid grid-cols-2 gap-px bg-linea sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="group flex h-24 items-center justify-center bg-noche">
            <span className="font-display text-lg font-bold tracking-widest text-acero/40 grayscale transition-all duration-500 group-hover:text-ambar group-hover:grayscale-0">
              LOGO {String(i + 1).padStart(2, "0")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── CTA final ───────────────────────────────────────────────────────────
export function CtaFinal() {
  return (
    <section className="contenedor seccion" aria-labelledby="cta-final">
      <div className="cotas ruido relative overflow-hidden bg-gradient-to-br from-marino-2 via-marino to-noche px-6 py-16 text-center sm:px-12 lg:py-24">
        <div className="reticula absolute inset-0 opacity-40" aria-hidden />
        <div className="relative">
          <TituloPalabras
            as="h2"
            texto="Ayúdanos a llegar más lejos, nosotros haremos realidad tu proyecto."
            resaltar={["realidad"]}
            className="mx-auto max-w-4xl text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
          />
          <span id="cta-final" className="sr-only">Cotiza tu proyecto</span>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-hormigon/75">
              ¿Un centro educativo, de salud, vivienda, oficinas o centros comerciales? Tú tienes la última palabra.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <BotonLink to="/cotizar" className="mt-10">
              Cotizar mi proyecto <ArrowRight className="size-4" aria-hidden />
            </BotonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
