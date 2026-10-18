import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cola } from "../lib/almacen";

vi.mock("../lib/api", async (orig) => {
  const real = await orig<typeof import("../lib/api")>();
  return { ...real, api: vi.fn() };
});
import { api } from "../lib/api";
import Inicio, { type Estado } from "../pantallas/Inicio";

const base: Estado = {
  nombre: "Pedro Ramos", documento: "70000001", consintio: true, dispositivoEstado: "ACTIVO",
  zona: { obra: "PRB-A · Edificio", lat: -12.1, lng: -77, radioM: 150 }, bloqueos: [], puedeMarcar: true,
  ultimoTipo: null, ultimaHora: null, comisionVigente: null,
};

describe("cola offline", () => {
  it("guarda, lista y quita marcajes pendientes", async () => {
    await cola.guardar({ idempotencia: "a1", payload: "{}", firma: "f", selfie: new Blob(["x"]), tipo: "ENTRADA", hora: "2026-10-18T10:00:00Z", intentos: 0 });
    expect((await cola.todos()).map((p) => p.idempotencia)).toContain("a1");
    await cola.quitar("a1");
    expect((await cola.todos()).find((p) => p.idempotencia === "a1")).toBeUndefined();
  });
});

describe("pantalla de inicio", () => {
  beforeEach(() => vi.mocked(api).mockReset());

  it("con todo en regla habilita MARCAR ENTRADA", async () => {
    vi.mocked(api).mockResolvedValue(base);
    render(<Inicio ir={() => {}} />);
    const boton = await screen.findByRole("button", { name: /MARCAR ENTRADA/ });
    expect(boton).toBeEnabled();
  });

  it("con SCTR vencido bloquea y muestra el motivo", async () => {
    vi.mocked(api).mockResolvedValue({ ...base, bloqueos: ["Tu SCTR venció el 2026-10-15. No puedes marcar hasta regularizarlo."], puedeMarcar: false });
    render(<Inicio ir={() => {}} />);
    expect(await screen.findByText(/SCTR venció/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /MARCAR/ })).toBeDisabled();
  });

  it("sin consentimiento manda a firmarlo antes de cualquier selfie", async () => {
    vi.mocked(api).mockResolvedValue({ ...base, consintio: false });
    const ir = vi.fn();
    render(<Inicio ir={ir} />);
    await waitFor(() => expect(ir).toHaveBeenCalledWith({ id: "consentimiento" }));
    expect(screen.getByRole("button", { name: /MARCAR/ })).toBeDisabled();
  });

  it("con celular pendiente de aprobación no deja marcar", async () => {
    vi.mocked(api).mockResolvedValue({ ...base, dispositivoEstado: "PENDIENTE", puedeMarcar: false });
    render(<Inicio ir={() => {}} />);
    expect(await screen.findByText(/esperando la aprobación del Administrador/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /MARCAR/ })).toBeDisabled();
  });
});
