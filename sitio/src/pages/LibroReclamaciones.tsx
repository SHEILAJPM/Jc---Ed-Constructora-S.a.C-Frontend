import { zodResolver } from "@hookform/resolvers/zod";
import { Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Boton } from "../components/ui/Boton";
import CabeceraPagina from "../components/ui/CabeceraPagina";
import { AreaTexto, Campo, Casilla, Seleccion } from "../components/ui/Campos";
import { AlertaError, Exito, TextoPrivacidad } from "../components/ui/FormUtil";
import { IconoLibro } from "../components/ui/IconosMarca";
import Seo from "../components/ui/Seo";
import Turnstile, { type TurnstileRef } from "../components/ui/Turnstile";
import { api, mensajeDeError, type ReclamoCreado } from "../lib/api";
import { EMPRESA } from "../lib/empresa";
import { aceptaPrivacidad, nombre, telefono } from "../lib/formularios";

const esquema = z
  .object({
    type: z.enum(["RECLAMO", "QUEJA"], { error: "Elige reclamo o queja" }),
    fullName: nombre,
    documentType: z.enum(["DNI", "CE", "PASAPORTE", "RUC"], { error: "Elige el tipo de documento" }),
    documentNumber: z.string().trim().regex(/^[A-Za-z0-9-]{6,15}$/, "Documento no válido"),
    address: z.string().trim().min(5, "Indica tu domicilio").max(200),
    phone: telefono,
    email: z.email("Correo no válido"),
    minor: z.boolean().optional(),
    guardianName: z.string().trim().max(120).optional(),
    itemType: z.enum(["PRODUCTO", "SERVICIO"], { error: "Elige producto o servicio" }),
    itemAmount: z.union([z.literal(""), z.coerce.number().min(0, "Monto no válido")]).optional(),
    itemDescription: z.string().trim().min(3, "Describe el bien contratado").max(500),
    detail: z.string().trim().min(10, "Detalla lo ocurrido (mínimo 10 caracteres)").max(3000),
    request: z.string().trim().min(5, "Indica tu pedido").max(1500),
    privacyAccepted: aceptaPrivacidad,
  })
  .refine((d) => !d.minor || (d.guardianName && d.guardianName.length >= 3), {
    path: ["guardianName"],
    message: "Indica el nombre de tu padre, madre o apoderado",
  });
type Datos = z.input<typeof esquema>;

function Bloque({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5 border border-linea p-6 md:p-8">
      <legend className="px-2 font-display text-lg font-semibold text-white">
        <span className="font-mono text-ambar">{n}.</span> {titulo}
      </legend>
      {children}
    </fieldset>
  );
}

export default function LibroReclamaciones() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creado, setCreado] = useState<(ReclamoCreado & { tipo: string }) | null>(null);
  const captcha = useRef<TurnstileRef>(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Datos>({
    resolver: zodResolver(esquema),
    mode: "onTouched",
    defaultValues: { minor: false, itemAmount: "" },
  });
  const menor = watch("minor");

  const enviar = handleSubmit(async (d) => {
    setError(null);
    if (!token) return setError("Estamos verificando que no eres un robot. Espera un segundo y vuelve a enviar.");
    try {
      const { data } = await api.post<ReclamoCreado>("/complaints", {
        ...d,
        minor: !!d.minor,
        guardianName: d.minor ? d.guardianName : null,
        itemAmount: d.itemAmount === "" ? null : Number(d.itemAmount),
        captchaToken: token,
      });
      setCreado({ ...data, tipo: d.type });
    } catch (e) {
      setError(mensajeDeError(e));
      captcha.current?.reiniciar();
    }
  });

  return (
    <>
      <Seo title="Libro de Reclamaciones" description="Libro de Reclamaciones virtual de JC & ED Constructora SAC conforme al Código de Protección y Defensa del Consumidor." path="/libro-de-reclamaciones" />
      <CabeceraPagina
        lamina="Libro de Reclamaciones virtual"
        titulo="Libro de Reclamaciones"
        bajada={`${EMPRESA.razonSocial} · RUC ${EMPRESA.ruc}. Conforme al Código de Protección y Defensa del Consumidor (Ley N.° 29571).`}
        migas={[{ to: "/libro-de-reclamaciones", label: "Libro de Reclamaciones" }]}
      >
        <IconoLibro className="mt-8 size-14 text-ambar" />
      </CabeceraPagina>

      <section className="contenedor seccion max-w-4xl">
        {creado ? (
          <Exito titulo="Hoja registrada">
            <p>Tu {creado.tipo.toLowerCase()} quedó registrado con el número</p>
            <p className="font-mono text-3xl font-bold text-ambar">{creado.code}</p>
            <p>
              Fecha de registro: {new Date(creado.createdAt).toLocaleString("es-PE")}. Te enviamos una copia a tu correo. Responderemos
              a más tardar el <strong>{new Date(creado.dueDate + "T00:00").toLocaleDateString("es-PE")}</strong>.
            </p>
            <Boton type="button" variante="secundario" onClick={() => window.print()} className="mt-2">
              <Printer className="size-4" aria-hidden /> Imprimir constancia
            </Boton>
          </Exito>
        ) : (
          <form onSubmit={enviar} noValidate className="space-y-8">
            <div className="vidrio p-5 text-sm text-hormigon/80">
              <p><strong className="text-white">Reclamo:</strong> disconformidad relacionada a los productos o servicios.</p>
              <p className="mt-1"><strong className="text-white">Queja:</strong> disconformidad no relacionada a los productos o servicios, o malestar respecto a la atención al público.</p>
            </div>

            <Bloque n={1} titulo="Identificación del consumidor">
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo label="Nombre completo" required autoComplete="name" {...register("fullName")} error={errors.fullName?.message} className="sm:col-span-2" />
                <Seleccion label="Tipo de documento" required opciones={[
                  { valor: "DNI", label: "DNI" }, { valor: "CE", label: "Carné de extranjería" },
                  { valor: "PASAPORTE", label: "Pasaporte" }, { valor: "RUC", label: "RUC" },
                ]} {...register("documentType")} error={errors.documentType?.message} />
                <Campo label="Número de documento" required {...register("documentNumber")} error={errors.documentNumber?.message} />
                <Campo label="Domicilio" required autoComplete="street-address" {...register("address")} error={errors.address?.message} className="sm:col-span-2" />
                <Campo label="Teléfono" required type="tel" autoComplete="tel" {...register("phone")} error={errors.phone?.message} />
                <Campo label="Correo" required type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
              </div>
              <Casilla label="Soy menor de edad" {...register("minor")} />
              {menor && <Campo label="Nombre del padre, madre o apoderado" required {...register("guardianName")} error={errors.guardianName?.message} />}
            </Bloque>

            <Bloque n={2} titulo="Identificación del bien contratado">
              <div className="grid gap-5 sm:grid-cols-2">
                <Seleccion label="Tipo" required opciones={[{ valor: "SERVICIO", label: "Servicio" }, { valor: "PRODUCTO", label: "Producto" }]}
                  {...register("itemType")} error={errors.itemType?.message} />
                <Campo label="Monto reclamado (S/)" type="number" inputMode="decimal" min={0} step="0.01" {...register("itemAmount")} error={errors.itemAmount?.message} />
              </div>
              <AreaTexto label="Descripción del bien o servicio" required rows={3} {...register("itemDescription")} error={errors.itemDescription?.message} />
            </Bloque>

            <Bloque n={3} titulo="Detalle de la reclamación">
              <Seleccion label="Tipo de solicitud" required opciones={[{ valor: "RECLAMO", label: "Reclamo" }, { valor: "QUEJA", label: "Queja" }]}
                {...register("type")} error={errors.type?.message} />
              <AreaTexto label="Detalle" required {...register("detail")} error={errors.detail?.message} />
              <AreaTexto label="Pedido del consumidor" required rows={3} {...register("request")} error={errors.request?.message} />
            </Bloque>

            <p className="text-sm text-acero">
              La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer
              una denuncia ante el INDECOPI. El proveedor deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días hábiles.
            </p>
            <Casilla label={<TextoPrivacidad />} {...register("privacyAccepted")} error={errors.privacyAccepted?.message} />
            <Turnstile ref={captcha} onToken={setToken} />
            <AlertaError mensaje={error} />
            <Boton type="submit" disabled={isSubmitting}>{isSubmitting ? "Registrando…" : "Registrar hoja de reclamación"}</Boton>
          </form>
        )}
      </section>
    </>
  );
}
