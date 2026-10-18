import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRef, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { useSearchParams } from "react-router";
import { z } from "zod";
import { Boton, BotonExterno } from "../components/ui/Boton";
import CabeceraPagina from "../components/ui/CabeceraPagina";
import { AreaTexto, Campo, Casilla, Seleccion } from "../components/ui/Campos";
import { AlertaError, Exito, SelectorArchivos, TextoPrivacidad } from "../components/ui/FormUtil";
import { IconoWhatsApp } from "../components/ui/IconosMarca";
import { ICONOS_SERVICIO, PlanoEdificio } from "../components/ui/Planos";
import Seo from "../components/ui/Seo";
import Turnstile, { type TurnstileRef } from "../components/ui/Turnstile";
import { api, mensajeDeError, multipart, type LeadCreado } from "../lib/api";
import { useServicios } from "../lib/consultas";
import { enlaceWhatsApp } from "../lib/empresa";
import {
  aceptaPrivacidad, correoOpcional, DEPARTAMENTOS, MB, nombre, PLAZOS, PRESUPUESTOS, SECTORES_INMUEBLE, telefono, validarArchivos,
} from "../lib/formularios";

const esquema = z.object({
  serviceSlug: z.string().min(1, "Elige un tipo de servicio"),
  sector: z.string().min(1, "Elige el tipo de inmueble o sector"),
  department: z.string().min(1, "Elige el departamento"),
  district: z.string().trim().min(2, "Indica el distrito").max(80),
  areaM2: z.union([z.literal(""), z.coerce.number().positive("Metraje no válido").max(10_000_000)]).optional(),
  desiredTimeline: z.string().min(1, "Elige un plazo"),
  budgetRange: z.string().min(1, "Elige un rango"),
  fullName: nombre,
  phone: telefono,
  email: correoOpcional,
  message: z.string().trim().max(3000).optional(),
  privacyAccepted: aceptaPrivacidad,
});
type Datos = z.input<typeof esquema>;

const PASOS: { titulo: string; campos: FieldPath<Datos>[] }[] = [
  { titulo: "Tipo de servicio", campos: ["serviceSlug"] },
  { titulo: "Inmueble o sector", campos: ["sector"] },
  { titulo: "Ubicación y metraje", campos: ["department", "district", "areaM2"] },
  { titulo: "Plazo y presupuesto", campos: ["desiredTimeline", "budgetRange"] },
  { titulo: "Fotos o planos", campos: [] },
  { titulo: "Tus datos", campos: ["fullName", "phone", "email", "message", "privacyAccepted"] },
];

const TIPOS_ADJUNTO = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function Opciones({ opciones, valor, onElegir, nombre: n }: {
  opciones: { valor: string; label: string; icono?: React.ReactNode; detalle?: string }[]; valor?: string; onElegir: (v: string) => void; nombre: string;
}) {
  return (
    <div role="radiogroup" aria-label={n} className="grid gap-3 sm:grid-cols-2">
      {opciones.map((o) => {
        const activo = valor === o.valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onElegir(o.valor)}
            className={clsx(
              "flex min-h-20 items-center gap-4 rounded-[3px] border p-5 text-left transition-all duration-300",
              activo ? "border-ambar bg-ambar/10 shadow-[0_0_0_1px_var(--color-ambar)]" : "border-linea bg-marino/50 hover:border-acero",
            )}
          >
            {o.icono}
            <span className="flex-1">
              <span className="block font-display text-lg font-semibold text-white">{o.label}</span>
              {o.detalle && <span className="mt-1 block text-sm text-acero">{o.detalle}</span>}
            </span>
            <span className={clsx("flex size-6 shrink-0 items-center justify-center rounded-full border", activo ? "border-ambar bg-ambar text-noche" : "border-acero/50")}>
              {activo && <Check className="size-4" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function Cotizar() {
  const [params] = useSearchParams();
  const { data: servicios } = useServicios();
  const [paso, setPaso] = useState(0);
  const [direccion, setDireccion] = useState(1);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [errorArchivos, setErrorArchivos] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creado, setCreado] = useState<{ lead: LeadCreado; datos: Datos } | null>(null);
  const captcha = useRef<TurnstileRef>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  const { register, handleSubmit, trigger, setValue, watch, formState: { errors, isSubmitting } } = useForm<Datos>({
    resolver: zodResolver(esquema),
    mode: "onTouched",
    defaultValues: {
      serviceSlug: params.get("servicio") ?? "", sector: "", department: "Lima", district: "", areaM2: "",
      desiredTimeline: "", budgetRange: "", fullName: "", phone: "", email: "", message: "",
    },
  });
  const v = watch();

  const ir = async (destino: number) => {
    if (destino > paso) {
      const ok = await trigger(PASOS[paso].campos, { shouldFocus: true });
      if (!ok) return;
      if (paso === 4) {
        const e = validarArchivos(archivos, { max: 5, maxBytes: 10 * MB, tipos: TIPOS_ADJUNTO });
        setErrorArchivos(e);
        if (e) return;
      }
    }
    setDireccion(destino > paso ? 1 : -1);
    setPaso(destino);
    requestAnimationFrame(() => titulo.current?.focus());
  };

  const enviar = handleSubmit(async (d) => {
    setError(null);
    if (!token) {
      setError("Estamos verificando que no eres un robot. Espera un segundo y vuelve a enviar.");
      return;
    }
    try {
      const datos = { ...d, areaM2: d.areaM2 === "" ? null : Number(d.areaM2), source: "COTIZADOR", captchaToken: token };
      const { data } = await api.post<LeadCreado>("/leads", multipart(datos, [{ campo: "files", files: archivos }]));
      setCreado({ lead: data, datos: d });
      window.dispatchEvent(new CustomEvent("conversion", { detail: { tipo: "cotizacion" } }));
    } catch (e) {
      setError(mensajeDeError(e));
      captcha.current?.reiniciar();
    }
  });

  const servicioElegido = servicios?.find((s) => s.slug === v.serviceSlug);

  if (creado) {
    const d = creado.datos;
    const resumen = [
      `Hola JC & ED, envié la solicitud ${creado.lead.code}.`,
      `Servicio: ${servicios?.find((s) => s.slug === d.serviceSlug)?.title ?? d.serviceSlug}`,
      `Sector: ${d.sector}`,
      `Ubicación: ${d.district}, ${d.department}`,
      d.areaM2 ? `Metraje: ${d.areaM2} m²` : null,
      `Plazo: ${d.desiredTimeline}`,
      `Nombre: ${d.fullName}`,
    ].filter(Boolean).join("\n");
    return (
      <>
        <Seo title="Solicitud enviada" description="Recibimos tu solicitud de cotización." path="/cotizar" noIndex />
        <section className="contenedor pb-16 pt-36">
          <Exito titulo="¡Solicitud enviada!">
            <p>Tu número de solicitud es</p>
            <p className="font-mono text-3xl font-bold text-ambar">{creado.lead.code}</p>
            <p>Un ingeniero evaluará tu caso y te contactará. No damos precios automáticos: cada obra se evalúa por separado.</p>
            <BotonExterno href={enlaceWhatsApp(resumen)} className="mt-4 bg-none !bg-[#25D366] !text-white" data-evento="clic-whatsapp">
              <IconoWhatsApp className="size-5" /> Continuar por WhatsApp
            </BotonExterno>
          </Exito>
        </section>
      </>
    );
  }

  const progreso = ((paso + 1) / PASOS.length) * 100;

  return (
    <>
      <Seo title="Cotizar proyecto" description="Cotiza tu obra en 6 pasos: servicio, sector, ubicación, plazo, planos y datos de contacto. Un ingeniero evalúa cada caso." path="/cotizar" />
      <CabeceraPagina lamina="Cotizador · 6 pasos" titulo="Cotiza tu proyecto" resaltar={["proyecto"]} migas={[{ to: "/cotizar", label: "Cotizar" }]}
        bajada="Responde 6 pasos rápidos. Un ingeniero revisa cada solicitud: no mostramos precios automáticos." />

      <section className="contenedor seccion max-w-4xl">
        {/* Progreso */}
        <div className="mb-10">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="etiqueta">Paso {paso + 1} de {PASOS.length}</p>
            <p className="font-mono text-sm text-ambar">{Math.round(progreso)}%</p>
          </div>
          <div className="h-1.5 overflow-hidden bg-marino-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progreso)} aria-label="Progreso del cotizador">
            <motion.div className="h-full bg-gradient-to-r from-ambar to-naranja" animate={{ width: `${progreso}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
          </div>
          <ol className="mt-4 hidden grid-cols-6 gap-2 md:grid">
            {PASOS.map((p, i) => (
              <li key={p.titulo} className={clsx("text-xs", i <= paso ? "text-hormigon" : "text-acero/60")}>{p.titulo}</li>
            ))}
          </ol>
        </div>

        <form onSubmit={enviar} noValidate>
          <AnimatePresence mode="wait" custom={direccion}>
            <motion.div
              key={paso}
              custom={direccion}
              initial={{ opacity: 0, x: direccion * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direccion * -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 ref={titulo} tabIndex={-1} className="mb-8 font-display text-3xl font-bold text-white outline-none">{PASOS[paso].titulo}</h2>

              {paso === 0 && (
                <>
                  <Opciones
                    nombre="Tipo de servicio"
                    valor={v.serviceSlug}
                    onElegir={(x) => setValue("serviceSlug", x, { shouldValidate: true })}
                    opciones={(servicios ?? []).map((s) => {
                      const I = ICONOS_SERVICIO[s.icon] ?? PlanoEdificio;
                      return { valor: s.slug, label: s.title, detalle: s.shortDescription, icono: <I className="size-12 shrink-0 text-ambar" /> };
                    })}
                  />
                  {errors.serviceSlug && <p role="alert" className="mt-3 text-sm text-[#ff8a7a]">{errors.serviceSlug.message}</p>}
                </>
              )}

              {paso === 1 && (
                <>
                  <Opciones nombre="Inmueble o sector" valor={v.sector} onElegir={(x) => setValue("sector", x, { shouldValidate: true })} opciones={SECTORES_INMUEBLE} />
                  {errors.sector && <p role="alert" className="mt-3 text-sm text-[#ff8a7a]">{errors.sector.message}</p>}
                </>
              )}

              {paso === 2 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Seleccion label="Departamento" required opciones={DEPARTAMENTOS} {...register("department")} error={errors.department?.message} />
                  <Campo label="Distrito" required {...register("district")} error={errors.district?.message} />
                  <Campo label="Metraje aproximado (m²)" type="number" inputMode="decimal" min={1} {...register("areaM2")} error={errors.areaM2?.message}
                    ayuda="Opcional. Una cifra aproximada nos ayuda a preparar la visita." className="sm:col-span-2" />
                </div>
              )}

              {paso === 3 && (
                <div className="space-y-8">
                  <div>
                    <p className="etiqueta mb-4">Plazo deseado</p>
                    <Opciones nombre="Plazo deseado" valor={v.desiredTimeline} onElegir={(x) => setValue("desiredTimeline", x, { shouldValidate: true })} opciones={PLAZOS} />
                    {errors.desiredTimeline && <p role="alert" className="mt-3 text-sm text-[#ff8a7a]">{errors.desiredTimeline.message}</p>}
                  </div>
                  <div>
                    <p className="etiqueta mb-4">Presupuesto referencial</p>
                    <Opciones nombre="Presupuesto referencial" valor={v.budgetRange} onElegir={(x) => setValue("budgetRange", x, { shouldValidate: true })} opciones={PRESUPUESTOS} />
                    {errors.budgetRange && <p role="alert" className="mt-3 text-sm text-[#ff8a7a]">{errors.budgetRange.message}</p>}
                  </div>
                </div>
              )}

              {paso === 4 && (
                <SelectorArchivos
                  etiqueta="Arrastra tus fotos o planos aquí, o toca para elegirlos"
                  ayuda="Opcional · JPG, PNG, WEBP o PDF · hasta 5 archivos de 10 MB"
                  aceptar={TIPOS_ADJUNTO.join(",")}
                  archivos={archivos}
                  onCambiar={(f) => { setArchivos(f); setErrorArchivos(null); }}
                  error={errorArchivos}
                />
              )}

              {paso === 5 && (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Campo label="Nombre completo" required autoComplete="name" {...register("fullName")} error={errors.fullName?.message} />
                    <Campo label="Teléfono / WhatsApp" required type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} error={errors.phone?.message} />
                  </div>
                  <Campo label="Correo (opcional)" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
                  <AreaTexto label="Cuéntanos más (opcional)" rows={4} {...register("message")} error={errors.message?.message} />
                  <div className="vidrio p-5 text-sm">
                    <p className="etiqueta mb-3">Resumen</p>
                    <p className="text-hormigon/85">
                      {servicioElegido?.title} · {v.sector} · {v.district}, {v.department}
                      {v.areaM2 ? ` · ${v.areaM2} m²` : ""} · {v.desiredTimeline} · {v.budgetRange}
                      {archivos.length ? ` · ${archivos.length} archivo(s)` : ""}
                    </p>
                  </div>
                  <Casilla label={<TextoPrivacidad />} {...register("privacyAccepted")} error={errors.privacyAccepted?.message} />
                  <Turnstile ref={captcha} onToken={setToken} />
                  <AlertaError mensaje={error} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between gap-4 border-t border-linea pt-8">
            <Boton type="button" variante="fantasma" onClick={() => ir(paso - 1)} disabled={paso === 0}>
              <ArrowLeft className="size-4" aria-hidden /> Atrás
            </Boton>
            {paso < PASOS.length - 1 ? (
              <Boton type="button" onClick={() => ir(paso + 1)}>
                Siguiente <ArrowRight className="size-4" aria-hidden />
              </Boton>
            ) : (
              <Boton type="submit" disabled={isSubmitting}>{isSubmitting ? "Enviando…" : "Enviar solicitud"}</Boton>
            )}
          </div>
        </form>
      </section>
    </>
  );
}
