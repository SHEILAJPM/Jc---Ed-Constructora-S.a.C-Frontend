import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Reveal } from "../components/ui/Animados";
import CabeceraPagina from "../components/ui/CabeceraPagina";
import Cargando from "../components/ui/Cargando";
import { ICONOS_SERVICIO, PlanoEdificio } from "../components/ui/Planos";
import Seo from "../components/ui/Seo";
import { useServicios } from "../lib/consultas";
import { CtaFinal } from "../sections/home/Secciones";

export default function Servicios() {
  const { data, isLoading } = useServicios();
  return (
    <>
      <Seo
        title="Servicios de construcción en Lima"
        description="Obras civiles, remodelaciones, demoliciones y excavaciones con supervisión de ingeniería y control de calidad. JC & ED Constructora SAC."
        path="/servicios"
      />
      <CabeceraPagina
        lamina="Lámina 02 · Especialidades"
        titulo="Cuatro especialidades, un mismo estándar"
        resaltar={["estándar"]}
        bajada="Desde el expediente técnico hasta la entrega, cada servicio se ejecuta con ingenieros en obra y protocolos de calidad."
        migas={[{ to: "/servicios", label: "Servicios" }]}
      />
      <section className="contenedor seccion">
        {isLoading && <Cargando texto="Cargando servicios" />}
        <ol className="divide-y divide-linea border-y border-linea">
          {(data ?? []).map((s, i) => {
            const Icono = ICONOS_SERVICIO[s.icon] ?? PlanoEdificio;
            return (
              <Reveal as="li" key={s.slug}>
                <Link
                  to={`/servicios/${s.slug}`}
                  className="group grid items-center gap-6 py-10 md:grid-cols-[6rem_1fr_auto] md:py-14"
                  data-cursor="grande"
                >
                  <span className="font-mono text-5xl text-acero/40 transition-colors group-hover:text-ambar">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex items-start gap-6">
                    <Icono className="hidden size-20 shrink-0 text-ambar sm:block" />
                    <div>
                      <h2 className="font-display text-3xl font-bold text-white transition-transform duration-500 group-hover:translate-x-2 md:text-5xl">{s.title}</h2>
                      <p className="mt-3 max-w-2xl text-hormigon/70">{s.shortDescription}</p>
                    </div>
                  </div>
                  <span className="inline-flex size-14 items-center justify-center rounded-full border border-linea transition-all duration-500 group-hover:border-ambar group-hover:bg-ambar group-hover:text-noche">
                    <ArrowRight className="size-5" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ol>
      </section>
      <CtaFinal />
    </>
  );
}
