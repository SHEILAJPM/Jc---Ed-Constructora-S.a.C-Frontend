import { Phone } from "lucide-react";
import { Link } from "react-router";
import { useServicios } from "../../lib/consultas";
import { EMPRESA, enlaceWhatsApp, NAV } from "../../lib/empresa";
import { IconoFacebook, IconoInstagram, IconoLibro, IconoLinkedIn, IconoWhatsApp } from "../ui/IconosMarca";
import Logo from "../ui/Logo";

export default function Footer() {
  const { data: servicios } = useServicios();
  const anio = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-linea bg-marino">
      <div className="cinta h-2 opacity-90" aria-hidden />
      <div className="contenedor grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-xs text-hormigon/70">
            No solo construimos obras, también valores. Ingeniería, calidad y ética desde {EMPRESA.fundacion}.
          </p>
          <div className="flex gap-3">
            {[
              { href: EMPRESA.redes.facebook, label: "Facebook", Icono: IconoFacebook },
              { href: EMPRESA.redes.instagram, label: "Instagram", Icono: IconoInstagram },
              { href: EMPRESA.redes.linkedin, label: "LinkedIn", Icono: IconoLinkedIn },
            ].map(({ href, label, Icono }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} de JC & ED Constructora`}
                className="inline-flex size-12 items-center justify-center rounded-[3px] border border-linea text-hormigon/80 transition-colors hover:border-ambar hover:text-ambar"
              >
                <Icono className="size-5" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Enlaces rápidos">
          <h2 className="etiqueta mb-5">Enlaces rápidos</h2>
          <ul className="space-y-3">
            {[...NAV, { to: "/cotizar", label: "Cotizar proyecto" }, { to: "/trabaja-con-nosotros", label: "Trabaja con nosotros" }].map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="text-hormigon/80 hover:text-ambar">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Servicios">
          <h2 className="etiqueta mb-5">Servicios</h2>
          <ul className="space-y-3">
            {(servicios ?? []).map((s) => (
              <li key={s.slug}>
                <Link to={`/servicios/${s.slug}`} className="text-hormigon/80 hover:text-ambar">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="etiqueta mb-5">Contacto</h2>
          <ul className="space-y-4">
            {EMPRESA.telefonos.map((t) => (
              <li key={t.e164} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <a href={`tel:+${t.e164}`} className="inline-flex items-center gap-2 font-mono text-hormigon hover:text-ambar">
                  <Phone className="size-4 text-ambar" aria-hidden /> {t.numero}
                </a>
                <a
                  href={enlaceWhatsApp("Hola, quiero información sobre una obra.", t.e164)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#25D366] hover:underline"
                >
                  <IconoWhatsApp className="size-4" /> WhatsApp
                </a>
              </li>
            ))}
          </ul>
          <Link
            to="/libro-de-reclamaciones"
            className="mt-8 inline-flex items-center gap-3 rounded-[3px] border border-linea px-4 py-3 text-hormigon hover:border-ambar"
          >
            <IconoLibro className="size-7 text-ambar" />
            <span className="leading-tight">
              <span className="block font-display font-semibold">Libro de Reclamaciones</span>
              <span className="text-xs text-acero">Registro virtual</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="border-t border-linea">
        <div className="contenedor flex flex-col gap-4 py-6 text-sm text-acero md:flex-row md:items-center md:justify-between">
          <p>
            © {anio} JC &amp; ED Constructora SAC. Todos los derechos reservados. · {EMPRESA.razonSocial} · RUC {EMPRESA.ruc}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><Link to="/politica-de-privacidad" className="hover:text-ambar">Política de Privacidad</Link></li>
            <li><Link to="/terminos-de-uso" className="hover:text-ambar">Términos</Link></li>
            <li><Link to="/politica-de-cookies" className="hover:text-ambar">Cookies</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
