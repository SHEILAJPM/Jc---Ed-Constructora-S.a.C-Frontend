import { describe, expect, it } from "vitest";
import { menuPara, tiene, tieneEnObra } from "../lib/menu";
import type { Yo } from "../lib/tipos";

const base = (parcial: Partial<Yo>): Yo => ({
  id: "u", email: "x@jced.test", nombre: "X", debeCambiarPassword: false, mfaHabilitado: false, roles: [],
  permisosGlobales: [], permisosPorObra: {}, ...parcial,
});

const OBRA_A = "obra-a";
const OBRA_B = "obra-b";

describe("menú según permisos (criterio 5)", () => {
  it("almacenero ve solo Inicio, Obras y Almacén", () => {
    const yo = base({ permisosPorObra: { "core.obra.ver": [OBRA_A], "inv.modulo.ver": [OBRA_A] } });
    expect(menuPara(yo).map((m) => m.etiqueta)).toEqual(["Inicio", "Obras", "Almacén"]);
  });

  it("administrador ve la administración y no los módulos operativos", () => {
    const yo = base({
      permisosGlobales: ["core.usuario.ver", "core.usuario.gestionar", "core.rol.ver", "core.configuracion.ver", "audit.evento.ver", "core.obra.ver"],
    });
    const etiquetas = menuPara(yo).map((m) => m.etiqueta);
    expect(etiquetas).toEqual(expect.arrayContaining(["Usuarios", "Roles y permisos", "Configuración", "Auditoría", "Obras"]));
    expect(etiquetas).not.toContain("Almacén");
    expect(etiquetas).not.toContain("Flota y maquinaria");
  });

  it("trabajador ve solo Inicio y Mi portal", () => {
    const yo = base({ permisosPorObra: { "trabajador.portal.ver": [OBRA_A] } });
    expect(menuPara(yo).map((m) => m.etiqueta)).toEqual(["Inicio", "Mi portal (boletas, EPP)"]);
  });

  it("con clave temporal no ve ningún módulo", () => {
    const yo = base({ debeCambiarPassword: true, permisosGlobales: ["core.usuario.ver"] });
    expect(menuPara(yo).map((m) => m.etiqueta)).toEqual(["Inicio"]);
  });
});

describe("alcance por obra", () => {
  it("un permiso de obra no vale en otra obra; uno global vale en todas", () => {
    const alm = base({ permisosPorObra: { "core.obra.ver": [OBRA_A] } });
    expect(tieneEnObra(alm, "core.obra.ver", OBRA_A)).toBe(true);
    expect(tieneEnObra(alm, "core.obra.ver", OBRA_B)).toBe(false);
    const dueno = base({ permisosGlobales: ["core.obra.ver"] });
    expect(tieneEnObra(dueno, "core.obra.ver", OBRA_B)).toBe(true);
    expect(tiene(null, "core.obra.ver")).toBe(false);
  });
});
