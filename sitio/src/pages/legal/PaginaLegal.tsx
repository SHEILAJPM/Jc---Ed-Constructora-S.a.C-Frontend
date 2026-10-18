import type { ReactNode } from "react";
import CabeceraPagina from "../../components/ui/CabeceraPagina";
import Seo from "../../components/ui/Seo";

export default function PaginaLegal({ titulo, descripcion, ruta, actualizado, children }: {
  titulo: string; descripcion: string; ruta: string; actualizado: string; children: ReactNode;
}) {
  return (
    <>
      <Seo title={titulo} description={descripcion} path={ruta} />
      <CabeceraPagina lamina="Documento legal" titulo={titulo} migas={[{ to: ruta, label: titulo }]} />
      <article className="contenedor seccion max-w-3xl">
        <p className="mb-10 border-l-2 border-ambar bg-marino/60 p-4 text-sm text-hormigon/80">
          Texto base · Última actualización: {actualizado}. <strong className="text-ambar">Pendiente de revisión por un abogado</strong> antes de publicarse.
        </p>
        <div className="space-y-8 text-hormigon/85 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_li]:marker:text-ambar [&_ul]:space-y-2">
          {children}
        </div>
      </article>
    </>
  );
}
