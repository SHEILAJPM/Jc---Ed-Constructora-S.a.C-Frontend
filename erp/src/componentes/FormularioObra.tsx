import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ObraDetalle } from "../lib/tipos";
import { AreaTexto, Boton, Campo, Seleccion } from "./ui";

export const esquemaObra = z
  .object({
    codigo: z.string().trim().toUpperCase().regex(/^[A-Z0-9][A-Z0-9-]{1,19}$/, "Solo MAYÚSCULAS, números y guiones (2 a 20)"),
    nombre: z.string().trim().min(3, "Mínimo 3 caracteres").max(150),
    cliente: z.string().trim().max(150).optional(),
    descripcion: z.string().trim().max(2000).optional(),
    departamento: z.string().trim().max(60).optional(),
    provincia: z.string().trim().max(60).optional(),
    distrito: z.string().trim().max(80).optional(),
    direccion: z.string().trim().max(200).optional(),
    estado: z.enum(["PLANIFICADA", "EJECUCION", "PARALIZADA", "CULMINADA"]),
    fechaInicio: z.string().optional(),
    fechaFinPrevista: z.string().optional(),
    campamentoActivo: z.boolean(),
    comedorActivo: z.boolean(),
    presupuestoContractual: z.union([z.literal(""), z.coerce.number().min(0, "No puede ser negativo")]).optional(),
    moneda: z.enum(["PEN", "USD"]),
  })
  .refine((d) => !d.fechaInicio || !d.fechaFinPrevista || d.fechaFinPrevista >= d.fechaInicio, {
    path: ["fechaFinPrevista"],
    message: "No puede ser anterior al inicio",
  });

export type DatosObra = z.input<typeof esquemaObra>;

export function valoresIniciales(o?: ObraDetalle | null): DatosObra {
  return {
    codigo: o?.codigo ?? "",
    nombre: o?.nombre ?? "",
    cliente: o?.cliente ?? "",
    descripcion: o?.descripcion ?? "",
    departamento: o?.departamento ?? "Lima",
    provincia: o?.provincia ?? "",
    distrito: o?.distrito ?? "",
    direccion: o?.direccion ?? "",
    estado: (o?.estado === "ANULADA" ? "PLANIFICADA" : o?.estado) ?? "PLANIFICADA",
    fechaInicio: o?.fechaInicio ?? "",
    fechaFinPrevista: o?.fechaFinPrevista ?? "",
    campamentoActivo: o?.campamentoActivo ?? false,
    comedorActivo: o?.comedorActivo ?? false,
    presupuestoContractual: o?.presupuestoContractual ?? "",
    moneda: o?.moneda ?? "PEN",
  };
}

/** Convierte el formulario al cuerpo que espera el API (vacíos → null). */
export function aCuerpo(d: DatosObra) {
  const vacio = (v?: string) => (v && v.trim() ? v.trim() : null);
  return {
    ...d,
    codigo: d.codigo.trim().toUpperCase(),
    cliente: vacio(d.cliente), descripcion: vacio(d.descripcion), departamento: vacio(d.departamento),
    provincia: vacio(d.provincia), distrito: vacio(d.distrito), direccion: vacio(d.direccion),
    fechaInicio: vacio(d.fechaInicio), fechaFinPrevista: vacio(d.fechaFinPrevista),
    presupuestoContractual: d.presupuestoContractual === "" || d.presupuestoContractual === undefined ? null : Number(d.presupuestoContractual),
  };
}

export default function FormularioObra({ inicial, soloLectura, textoBoton, onGuardar, extra }: {
  inicial: DatosObra; soloLectura?: boolean; textoBoton: string; onGuardar: (d: DatosObra) => Promise<void>; extra?: React.ReactNode;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DatosObra>({
    resolver: zodResolver(esquemaObra),
    defaultValues: inicial,
    mode: "onTouched",
  });

  return (
    <form onSubmit={handleSubmit(onGuardar)} noValidate className="space-y-5">
      <fieldset disabled={soloLectura} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo label="Código" required {...register("codigo")} error={errors.codigo?.message} ayuda="Ej.: OBR-2026-01" />
          <Campo label="Nombre de la obra" required className="sm:col-span-2" {...register("nombre")} error={errors.nombre?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Cliente" {...register("cliente")} error={errors.cliente?.message} />
          <Seleccion label="Estado" required {...register("estado")} opciones={[
            { valor: "PLANIFICADA", label: "Planificada" }, { valor: "EJECUCION", label: "En ejecución" },
            { valor: "PARALIZADA", label: "Paralizada" }, { valor: "CULMINADA", label: "Culminada" },
          ]} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo label="Departamento" {...register("departamento")} />
          <Campo label="Provincia" {...register("provincia")} />
          <Campo label="Distrito" {...register("distrito")} />
        </div>
        <Campo label="Dirección o referencia" {...register("direccion")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Campo label="Fecha de inicio" type="date" {...register("fechaInicio")} />
          <Campo label="Fin previsto" type="date" {...register("fechaFinPrevista")} error={errors.fechaFinPrevista?.message} />
          <Campo label="Presupuesto contractual" type="number" inputMode="decimal" min={0} step="0.01"
            {...register("presupuestoContractual")} error={errors.presupuestoContractual?.message} />
          <Seleccion label="Moneda" {...register("moneda")} opciones={[{ valor: "PEN", label: "Soles (PEN)" }, { valor: "USD", label: "Dólares (USD)" }]} />
        </div>
        <AreaTexto label="Descripción" {...register("descripcion")} />
        <div className="flex flex-wrap gap-6">
          <label className="flex min-h-12 items-center gap-3 font-medium">
            <input type="checkbox" className="size-6 accent-[#f7841e]" {...register("campamentoActivo")} /> Tiene campamento
          </label>
          <label className="flex min-h-12 items-center gap-3 font-medium">
            <input type="checkbox" className="size-6 accent-[#f7841e]" {...register("comedorActivo")} /> Tiene comedor
          </label>
        </div>
      </fieldset>
      {extra}
      {!soloLectura && <Boton type="submit" cargando={isSubmitting}>{textoBoton}</Boton>}
    </form>
  );
}
