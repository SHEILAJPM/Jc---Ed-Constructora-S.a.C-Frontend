import { useState, type FormEvent } from "react";
import type { Pantalla } from "../App";
import { login } from "../lib/api";

export function Aviso({ tipo = "error", children }: { tipo?: "error" | "info" | "ok"; children: React.ReactNode }) {
  const c = { error: "border-red-300 bg-red-50 text-red-900", info: "border-sky-300 bg-sky-50 text-sky-900", ok: "border-green-300 bg-green-50 text-green-900" }[tipo];
  return <div role={tipo === "error" ? "alert" : "status"} className={`rounded-xl border-2 p-4 font-medium ${c}`}>{children}</div>;
}

export default function Login({ ir }: { ir: (p: Pantalla) => void }) {
  const [documento, setDocumento] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const s = await login(documento.trim(), pin);
      ir({ id: s.debeCambiarPin ? "pin" : "inicio" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo ingresar");
      setPin("");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="flex flex-1 flex-col gap-5">
      <h1 className="text-2xl font-extrabold">Ingresa con tu DNI</h1>
      <label className="block">
        <span className="mb-1 block font-semibold">DNI o carné de extranjería</span>
        <input className="campo" inputMode="numeric" autoComplete="username" maxLength={12} required
          value={documento} onChange={(e) => setDocumento(e.target.value.toUpperCase().replace(/\s/g, ""))} />
      </label>
      <label className="block">
        <span className="mb-1 block font-semibold">PIN</span>
        <input className="campo tracking-[0.5em]" type="password" inputMode="numeric" autoComplete="current-password" maxLength={8} required
          value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
      </label>
      {error && <Aviso>{error}</Aviso>}
      <button type="submit" className="boton-primario mt-auto" disabled={enviando || documento.length < 6 || pin.length < 4}>
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>
      <p className="text-center text-base text-slate-600">¿Olvidaste tu PIN? Pídele uno nuevo al Adm. de Obra.</p>
    </form>
  );
}
