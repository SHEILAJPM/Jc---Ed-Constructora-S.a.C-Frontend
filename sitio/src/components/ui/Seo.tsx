import { EMPRESA } from "../../lib/empresa";

const SITIO = (import.meta.env.VITE_SITIO_URL ?? "https://jcyedconstructora.com").replace(/\/$/, "");

interface Props {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noIndex?: boolean;
}

/** Metadatos por página con el soporte nativo de React 19 (se elevan a <head>). */
export default function Seo({ title, description, path, image, jsonLd, noIndex }: Props) {
  const titulo = title.includes("JC & ED") ? title : `${title} | ${EMPRESA.nombre}`;
  const url = `${SITIO}${path}`;
  return (
    <>
      <title>{titulo}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex" />}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="es_PE" />
      <meta property="og:site_name" content={EMPRESA.nombre} />
      <meta property="og:title" content={titulo} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image ?? `${SITIO}/og-imagen.png`} />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </>
  );
}

export function jsonLdEmpresa() {
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: EMPRESA.nombre,
    legalName: EMPRESA.razonSocial,
    foundingDate: String(EMPRESA.fundacion),
    url: SITIO,
    logo: `${SITIO}/logo.svg`,
    telephone: EMPRESA.telefonos.map((t) => t.numero),
    areaServed: "PE",
    address: { "@type": "PostalAddress", addressLocality: "Lima", addressCountry: "PE" },
    sameAs: Object.values(EMPRESA.redes),
  };
}
