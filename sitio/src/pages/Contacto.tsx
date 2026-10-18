import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Reveal } from "../components/ui/Animados";
import { Boton } from "../components/ui/Boton";
import CabeceraPagina from "../components/ui/CabeceraPagina";
import { AreaTexto, Campo, Casilla, Seleccion } from "../components/ui/Campos";
import { AlertaError, Exito, TextoPrivacidad } from "../components/ui/FormUtil";
import { IconoFacebook, IconoInstagram, IconoLinkedIn, IconoWhatsApp } from "../components/ui/IconosMarca";
import Seo from "../components/ui/Seo";
import Turnstile, { type TurnstileRef } from "../components/ui/Turnstile";
import { api, mensajeDeError, multipart, type LeadCreado } from "../lib/api";
import { EMPRESA, enlaceWhatsApp } from "../lib/empresa";
import { aceptaPrivacidad, correoOpcional, nombre, SECTORES_INMUEBLE, telefono } from "../lib/formularios";

const esquema = z.object({
  fullName: nombre,
  phone: telefono,
  email: correoOpcional,
  sector: z.string().min(1, "Elige el tipo de proyecto"),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(3000),
  privacyAccepted: aceptaPrivacidad,
});
type Datos = z.input<typeof esquema>;

export default function Contacto() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creado, setCreado] = useState<LeadCreado | null>(null);
  const captcha = useRef<TurnstileRef>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Datos>({
    resolver: zodResolver(esquema),
    mode: "onTouched",
  });

  const enviar = handleSubmit(async (d) => {
    setError(null);
    if (!token) {
      setError("Estamos verificando que no eres un robot. Espera un segundo y vuelve a enviar.");
      return;
    }
    try {
      const { data } = await api.post<LeadCreado>("/leads", multipart({ ...d, source: "CONTACTO", captchaToken: token }));
      setCreado(data);
    } catch (e) {
      setError(mensajeDeError(e));
      captcha.current?.reiniciar();
    }
  });

  return (
    <>
      <Seo title="Contacto" description="Escríbenos o llámanos: +51 951 147 302 · +51 962 175 876. Atención en Lima y todo el Perú." path="/contacto" />
      <CabeceraPagina
        lamina="Lámina 05 · Contacto"
        titulo="Conversemos sobre tu proyecto"
        resaltar={["proyecto"]}
        bajada="Respóndenos unas pocas preguntas y un ingeniero te contactará. ¿Prefieres hablar ya? Escríbenos por WhatsApp."
        migas={[{ to: "/contacto", label: "Contacto" }]}
      />

      <section className="contenedor seccion grid gap-14 lg:grid-cols-[1.3fr_1fr]">
        <div>
          {creado ? (
            <Exito titulo="¡Mensaje recibido!">
              <p>Tu número de solicitud es <strong className="font-mono text-ambar">{creado.code}</strong>.</p>
              <p>{creado.message}</p>
            </Exito>
          ) : (
            <form onSubmit={enviar} noValidate className="space-y-5" aria-describedby="nota-obligatorios">
              <p id="nota-obligatorios" className="text-sm text-acero">Los campos con <span className="text-ambar">*</span> son obligatorios.</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo label="Nombre" required autoComplete="name" {...register("fullName")} error={errors.fullName?.message} />
                <Campo label="Teléfono" required type="tel" autoComplete="tel" inputMode="tel" {...register("phone")} error={errors.phone?.message} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo label="Correo (opcional)" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
                <Seleccion label="Tipo de proyecto" required opciones={SECTORES_INMUEBLE} {...register("sector")} error={errors.sector?.message} />
              </div>
              <AreaTexto label="Mensaje" required {...register("message")} error={errors.message?.message} />
              <Casilla label={<TextoPrivacidad />} {...register("privacyAccepted")} error={errors.privacyAccepted?.message} />
              <Turnstile ref={captcha} onToken={setToken} />
              <AlertaError mensaje={error} />
              <Boton type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Enviando…" : "Enviar mensaje"}
              </Boton>
            </form>
          )}
        </div>

        <Reveal as="aside" className="space-y-6">
          <div className="vidrio cotas space-y-6 p-7">
            <h2 className="etiqueta">Datos de contacto</h2>
            <ul className="space-y-5">
              {EMPRESA.telefonos.map((t) => (
                <li key={t.e164} className="flex items-center justify-between gap-4">
                  <a href={`tel:+${t.e164}`} className="flex items-center gap-3 font-mono text-lg text-white hover:text-ambar">
                    <Phone className="size-5 text-ambar" aria-hidden /> {t.numero}
                  </a>
                  <a href={enlaceWhatsApp("Hola, quiero información sobre una obra.", t.e164)} target="_blank" rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-[3px] bg-[#25D366] px-3 text-sm font-semibold text-white" aria-label={`WhatsApp ${t.numero}`}>
                    <IconoWhatsApp className="size-4" /> WhatsApp
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-3 text-hormigon/85"><Mail className="size-5 text-ambar" aria-hidden /> {EMPRESA.correo}</li>
              <li className="flex items-start gap-3 text-hormigon/85"><MapPin className="mt-0.5 size-5 text-ambar" aria-hidden /> {EMPRESA.direccion}</li>
              <li className="flex items-start gap-3 text-hormigon/85">
                <Clock className="mt-0.5 size-5 text-ambar" aria-hidden />
                <span>{EMPRESA.horario.map((h) => <span key={h.dias} className="block">{h.dias}: {h.horas}</span>)}</span>
              </li>
            </ul>
            <div className="flex gap-3 border-t border-linea pt-6">
              {[
                { href: EMPRESA.redes.facebook, l: "Facebook", I: IconoFacebook },
                { href: EMPRESA.redes.instagram, l: "Instagram", I: IconoInstagram },
                { href: EMPRESA.redes.linkedin, l: "LinkedIn", I: IconoLinkedIn },
              ].map(({ href, l, I }) => (
                <a key={l} href={href} target="_blank" rel="noopener noreferrer" aria-label={l}
                  className="inline-flex size-12 items-center justify-center rounded-[3px] border border-linea hover:border-ambar hover:text-ambar">
                  <I className="size-5" />
                </a>
              ))}
            </div>
          </div>
          {/* El mapa oficial de Google Maps se inserta cuando se confirme la dirección. */}
          <div className="reticula cotas flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-marino p-6 text-center">
            <MapPin className="size-10 text-ambar" aria-hidden />
            <p className="font-display font-semibold text-white">Mapa de ubicación</p>
            <p className="text-sm text-acero">Pendiente: insertar el embed oficial de Google Maps con la dirección real.</p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
