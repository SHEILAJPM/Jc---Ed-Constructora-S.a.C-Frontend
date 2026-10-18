// Datos oficiales de la empresa. Lo marcado con "COMPLETAR" se reemplaza por el dato real.
export const EMPRESA = {
  nombre: "JC & ED Constructora SAC",
  nombreCorto: "JC & ED",
  razonSocial: "JC & ED CONSTRUCTORA S.A.C.",
  ruc: "COMPLETAR RUC",
  fundacion: 2012,
  frase: "Planificamos. Construimos. Cumplimos.",
  telefonos: [
    { numero: "+51 951 147 302", e164: "51951147302" },
    { numero: "+51 962 175 876", e164: "51962175876" },
  ],
  whatsapp: "51951147302",
  correo: "COMPLETAR@correo-de-la-empresa.com",
  direccion: "COMPLETAR dirección, Lima, Perú",
  horario: [
    { dias: "Lunes a viernes", horas: "8:00 a. m. – 6:00 p. m." },
    { dias: "Sábados", horas: "8:00 a. m. – 1:00 p. m." },
  ],
  redes: {
    facebook: "https://www.facebook.com/JCyEDConstructoraSAC",
    instagram: "https://www.instagram.com/jcyed_constructorasac/",
    linkedin: "https://www.linkedin.com/company/jcyed-constructora/",
  },
} as const;

export const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/servicios", label: "Servicios" },
  { to: "/proyectos", label: "Proyectos" },
  { to: "/la-empresa", label: "La Empresa" },
  { to: "/contacto", label: "Contacto" },
] as const;

export const CATEGORIAS = [
  { valor: "VIVIENDA", label: "Vivienda" },
  { valor: "COMERCIAL", label: "Comercial" },
  { valor: "SALUD", label: "Salud" },
  { valor: "EDUCACION", label: "Educación" },
  { valor: "SANEAMIENTO", label: "Saneamiento" },
  { valor: "PUBLICO", label: "Sector público" },
] as const;

export type Categoria = (typeof CATEGORIAS)[number]["valor"];

export const etiquetaCategoria = (c: string) => CATEGORIAS.find((x) => x.valor === c)?.label ?? c;

export function enlaceWhatsApp(mensaje: string, numero: string = EMPRESA.whatsapp) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
