import PaginaLegal from "./PaginaLegal";

export default function Cookies() {
  return (
    <PaginaLegal titulo="Política de cookies" ruta="/politica-de-cookies" actualizado="octubre de 2026"
      descripcion="Este sitio solo usa almacenamiento estrictamente necesario.">
      <section>
        <h2>1. Qué usamos</h2>
        <p>Este sitio <strong>no usa cookies de publicidad ni de rastreo</strong>. Solo guardamos en tu navegador que ya viste el aviso de cookies.</p>
      </section>
      <section>
        <h2>2. Verificación anti-spam</h2>
        <p>En los formularios usamos Cloudflare Turnstile para comprobar que no eres un robot. Este servicio puede usar almacenamiento técnico necesario para esa verificación.</p>
      </section>
      <section>
        <h2>3. Cómo borrarlas</h2>
        <p>Puedes borrar el almacenamiento del sitio desde la configuración de tu navegador en cualquier momento.</p>
      </section>
    </PaginaLegal>
  );
}
