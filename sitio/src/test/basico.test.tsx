import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Campo } from "../components/ui/Campos";
import { enlaceWhatsApp } from "../lib/empresa";
import { MB, validarArchivos } from "../lib/formularios";

describe("validarArchivos", () => {
  const archivo = (nombre: string, tipo: string, bytes: number) => new File([new Uint8Array(bytes)], nombre, { type: tipo });
  const reglas = { max: 2, maxBytes: 1 * MB, tipos: ["application/pdf"] };

  it("acepta archivos válidos", () => {
    expect(validarArchivos([archivo("cv.pdf", "application/pdf", 1000)], reglas)).toBeNull();
  });
  it("rechaza formatos no permitidos", () => {
    expect(validarArchivos([archivo("x.exe", "application/x-msdownload", 10)], reglas)).toMatch(/formato/);
  });
  it("rechaza archivos muy grandes", () => {
    expect(validarArchivos([archivo("cv.pdf", "application/pdf", 2 * MB)], reglas)).toMatch(/supera 1 MB/);
  });
  it("rechaza demasiados archivos", () => {
    const f = archivo("a.pdf", "application/pdf", 10);
    expect(validarArchivos([f, f, f], reglas)).toMatch(/Máximo 2/);
  });
});

describe("enlaceWhatsApp", () => {
  it("codifica el mensaje y usa el número oficial", () => {
    const url = enlaceWhatsApp("Hola & adiós");
    expect(url).toBe("https://wa.me/51951147302?text=Hola%20%26%20adi%C3%B3s");
  });
});

describe("Campo", () => {
  it("asocia la etiqueta y anuncia el error", () => {
    render(<Campo label="Teléfono" error="Teléfono no válido" />);
    const input = screen.getByLabelText("Teléfono");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Teléfono no válido");
  });
});
