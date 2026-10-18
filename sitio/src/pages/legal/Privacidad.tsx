import { EMPRESA } from "../../lib/empresa";
import PaginaLegal from "./PaginaLegal";

export default function Privacidad() {
  return (
    <PaginaLegal titulo="Política de Privacidad" ruta="/politica-de-privacidad" actualizado="octubre de 2026"
      descripcion="Cómo JC & ED Constructora SAC trata los datos personales conforme a la Ley N.° 29733.">
      <section>
        <h2>1. Responsable del tratamiento</h2>
        <p>{EMPRESA.razonSocial}, con RUC {EMPRESA.ruc} y domicilio en {EMPRESA.direccion}, es responsable del tratamiento de los datos personales que se recogen en este sitio, conforme a la Ley N.° 29733, Ley de Protección de Datos Personales, y su Reglamento.</p>
      </section>
      <section>
        <h2>2. Datos que recogemos</h2>
        <ul>
          <li>Cotizador y contacto: nombre, teléfono, correo, ubicación del proyecto, metraje, plazo, presupuesto referencial y los archivos que adjuntes.</li>
          <li>Trabaja con nosotros: nombre, correo, teléfono y tu CV.</li>
          <li>Libro de Reclamaciones: los datos exigidos por el Código de Protección y Defensa del Consumidor.</li>
          <li>Datos técnicos mínimos (dirección IP) para prevenir spam y fraude.</li>
        </ul>
      </section>
      <section>
        <h2>3. Finalidad</h2>
        <p>Atender tu solicitud, preparar propuestas, evaluar postulaciones, responder reclamos y cumplir obligaciones legales. No vendemos ni cedemos tus datos a terceros con fines comerciales.</p>
      </section>
      <section>
        <h2>4. Plazo de conservación</h2>
        <p>Conservamos los datos mientras sean necesarios para la finalidad y durante los plazos que exige la ley. Las hojas del Libro de Reclamaciones se conservan por el plazo legal.</p>
      </section>
      <section>
        <h2>5. Encargados y transferencias</h2>
        <p>Usamos proveedores de infraestructura (alojamiento, base de datos, correo y verificación anti-spam) que tratan los datos solo por encargo nuestro. Algunos pueden estar fuera del Perú (flujo transfronterizo), con garantías adecuadas.</p>
      </section>
      <section>
        <h2>6. Tus derechos (ARCO)</h2>
        <p>Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición escribiendo a {EMPRESA.correo}. Si no quedas conforme, puedes acudir a la Autoridad Nacional de Protección de Datos Personales.</p>
      </section>
      <section>
        <h2>7. Seguridad</h2>
        <p>Aplicamos medidas técnicas y organizativas: conexión cifrada, acceso restringido, archivos privados con enlaces temporales y registro de accesos.</p>
      </section>
    </PaginaLegal>
  );
}
