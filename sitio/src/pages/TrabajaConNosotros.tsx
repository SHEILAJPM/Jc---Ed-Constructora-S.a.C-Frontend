import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, MapPin } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EncabezadoSeccion, Reveal } from "../components/ui/Animados";
import { Boton } from "../components/ui/Boton";
import CabeceraPagina from "../components/ui/CabeceraPagina";
import { AreaTexto, Campo, Casilla, Seleccion } from "../components/ui/Campos";
import { AlertaError, Exito, SelectorArchivos, TextoPrivacidad } from "../components/ui/FormUtil";
import Seo from "../components/ui/Seo";
import Turnstile, { type TurnstileRef } from "../components/ui/Turnstile";
import { api, mensajeDeError, multipart } from "../lib/api";
import { useConvocatorias } from "../lib/consultas";
import { aceptaPrivacidad, MB, nombre, telefono, validarArchivos } from "../lib/formularios";

const esquema = z.object({
  jobOpeningId: z.string().optional(),
  fullName: nombre,
  email: z.email("Correo no válido"),
  phone: telefono,
  message: z.string().trim().max(2000).optional(),
  privacyAccepted: aceptaPrivacidad,
});
type Datos = z.input<typeof esquema>;

export default function TrabajaConNosotros() {
  const { data: convocatorias } = useConvocatorias();
  const [cv, setCv] = useState<File[]>([]);
  const [errorCv, setErrorCv] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<string | null>(null);
  const captcha = useRef<TurnstileRef>(null);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Datos>({ resolver: zodResolver(esquema), mode: "onTouched" });

  const enviar = handleSubmit(async (d) => {
    setError(null);
    const e = cv.length === 0 ? "Adjunta tu CV en PDF" : validarArchivos(cv, { max: 1, maxBytes: 5 * MB, tipos: ["application/pdf"] });
    setErrorCv(e);
    if (e) return;
    if (!token) return setError("Estamos verificando que no eres un robot. Espera un segundo y vuelve a enviar.");
    try {
      const { data } = await api.post<{ mensaje: string }>(
        "/applications",
        multipart({ ...d, jobOpeningId: d.jobOpeningId || null, captchaToken: token }, [{ campo: "cv", files: cv }]),
      );
      setEnviado(data.mensaje);
    } catch (err) {
      setError(mensajeDeError(err));
      captcha.current?.reiniciar();
    }
  });

  return (
    <>
      <Seo title="Trabaja con nosotros" description="Únete al equipo de JC & ED Constructora: convocatorias activas y envío de CV." path="/trabaja-con-nosotros" />
      <CabeceraPagina
        lamina="Lámina 06 · Talento"
        titulo="Construye tu carrera con nosotros"
        resaltar={["carrera"]}
        bajada="Buscamos personas que compartan nuestros valores: integridad, seguridad, calidad, compromiso e innovación. Personal motivado y orgulloso de pertenecer."
        migas={[{ to: "/trabaja-con-nosotros", label: "Trabaja con nosotros" }]}
      />

      <section className="contenedor seccion">
        <EncabezadoSeccion etiqueta="Convocatorias" titulo="Convocatorias activas" />
        {convocatorias && convocatorias.length === 0 && (
          <p className="mt-8 text-hormigon/70">Por ahora no hay convocatorias abiertas. Puedes dejarnos tu CV para futuras oportunidades.</p>
        )}
        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {(convocatorias ?? []).map((j) => (
            <Reveal as="li" key={j.id} className="vidrio cotas flex flex-col p-7">
              <h3 className="font-display text-2xl font-semibold text-white">{j.title}</h3>
              <p className="mt-2 flex flex-wrap gap-4 text-sm text-acero">
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden /> {j.location}</span>
                <span className="inline-flex items-center gap-1.5"><Briefcase className="size-4" aria-hidden /> {j.employment}</span>
                {j.closesOn && <span>Cierra: {new Date(j.closesOn + "T00:00").toLocaleDateString("es-PE")}</span>}
              </p>
              <p className="mt-4 text-hormigon/80">{j.description}</p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-hormigon/75 marker:text-ambar">
                {j.requirements.map((r) => <li key={r}>{r}</li>)}
              </ul>
              <Boton
                type="button"
                variante="secundario"
                className="mt-6 self-start"
                onClick={() => {
                  setValue("jobOpeningId", j.id);
                  document.getElementById("postular")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Postular
              </Boton>
            </Reveal>
          ))}
        </ul>
      </section>

      <section id="postular" className="contenedor max-w-3xl pb-16">
        <EncabezadoSeccion etiqueta="Postulación" titulo="Envíanos tu CV" />
        <div className="mt-10">
          {enviado ? (
            <Exito titulo="¡Postulación enviada!"><p>{enviado}</p></Exito>
          ) : (
            <form onSubmit={enviar} noValidate className="space-y-5">
              <Seleccion
                label="Convocatoria"
                opciones={[...(convocatorias ?? []).map((j) => ({ valor: j.id, label: j.title }))]}
                {...register("jobOpeningId")}
              />
              <p className="-mt-3 text-xs text-acero">Si no eliges una, la tomamos como candidatura espontánea.</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo label="Nombre completo" required autoComplete="name" {...register("fullName")} error={errors.fullName?.message} />
                <Campo label="Teléfono" required type="tel" autoComplete="tel" {...register("phone")} error={errors.phone?.message} />
              </div>
              <Campo label="Correo" required type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
              <AreaTexto label="Mensaje (opcional)" rows={4} {...register("message")} />
              <SelectorArchivos
                etiqueta="Adjunta tu CV"
                ayuda="Solo PDF · máximo 5 MB"
                aceptar="application/pdf"
                multiple={false}
                archivos={cv}
                onCambiar={(f) => { setCv(f); setErrorCv(null); }}
                error={errorCv}
              />
              <Casilla label={<TextoPrivacidad />} {...register("privacyAccepted")} error={errors.privacyAccepted?.message} />
              <Turnstile ref={captcha} onToken={setToken} />
              <AlertaError mensaje={error} />
              <Boton type="submit" disabled={isSubmitting}>{isSubmitting ? "Enviando…" : "Enviar postulación"}</Boton>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
