import { describe, expect, it } from "vitest";
import { esGrave, textoSenal } from "../lib/asistencia";

describe("señales de marcaje en lenguaje del usuario", () => {
  it("nunca muestra el código técnico", () => {
    for (const c of ["GPS_FALSO", "FUERA_DE_GEOCERCA", "DOCUMENTO_VENCIDO:SCTR", "DOCUMENTO_FALTANTE:EMO", "GEOCERCA:Cantera", "ALGO_NUEVO"]) {
      expect(textoSenal(c)).not.toMatch(/[A-Z]{3,}_/);
    }
    expect(textoSenal("DOCUMENTO_VENCIDO:SCTR")).toBe("SCTR vencido");
    expect(textoSenal("DOCUMENTO_FALTANTE:EMO")).toBe("Falta examen médico (EMO)");
  });

  it("distingue lo que rechaza de lo que solo pide revisión", () => {
    expect(esGrave("GPS_FALSO")).toBe(true);
    expect(esGrave("DOCUMENTO_VENCIDO:SCTR")).toBe(true);
    expect(esGrave("PRECISION_BAJA")).toBe(false);
  });
});
