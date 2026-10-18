import { EMPRESA } from "../../lib/empresa";
import PaginaLegal from "./PaginaLegal";

export default function Terminos() {
  return (
    <PaginaLegal titulo="Términos de uso" ruta="/terminos-de-uso" actualizado="octubre de 2026"
      descripcion="Condiciones de uso del sitio web de JC & ED Constructora SAC.">
      <section>
        <h2>1. Objeto</h2>
        <p>Estos términos regulan el uso del sitio web de {EMPRESA.razonSocial}. Al navegar en él aceptas estas condiciones.</p>
      </section>
      <section>
        <h2>2. Información del sitio</h2>
        <p>Los contenidos son informativos. Las cotizaciones no son automáticas: toda propuesta se emite por escrito después de la evaluación de un ingeniero y solo es vinculante cuando ambas partes la firman.</p>
      </section>
      <section>
        <h2>3. Uso permitido</h2>
        <ul>
          <li>No envíes información falsa ni datos de terceros sin su autorización.</li>
          <li>No intentes vulnerar la seguridad del sitio ni enviar contenido malicioso o publicidad no solicitada.</li>
        </ul>
      </section>
      <section>
        <h2>4. Propiedad intelectual</h2>
        <p>Marcas, logotipos, textos, fotografías y diseños pertenecen a la empresa o a sus titulares. No se permite su reproducción sin autorización.</p>
      </section>
      <section>
        <h2>5. Legislación aplicable</h2>
        <p>Se rigen por las leyes de la República del Perú.</p>
      </section>
    </PaginaLegal>
  );
}
