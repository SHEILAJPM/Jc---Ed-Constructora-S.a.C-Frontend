import { useState, type FormEvent } from "react";
import type { Pantalla } from "../App";
import { api } from "../lib/api";
import { Aviso } from "./Login";

export default function CambiarPin({ ir }: { ir: (p: Pantalla) => void }) {
  const [actual, setActual] = useState("");
  const [nuevo, setNuevo] = useState("");
  const [repite, setRepite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (nuevo !== repite) return setError("Los PIN nuevos no coinciden");
    setError(null);
    setEnviando(true);
    try {
      await api("/auth/campo/pin", { method: "POST", body: JSON.stringify({ actual, nuevo }) });
      ir({ id: "inicio" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el PIN");
    } finally {
      setEnviando(false);
    }
  };

  const campo = (label: string, v: string, set: (s: string) => void) => (
    <label className="block">
      <span className="mb-1 block font-semibold">{label}</span>
      <input className="campo tracking-[0.5em]" type="password" inputMode="numeric" maxLength={8} required value={v}
        onChange={(e) => set(e.target.value.replace(/\D/g, ""))} />
    </label>
  );

  return (
    <form onSubmit={enviar} className="flex flex-1 flex-col gap-5">
      <h1 className="text-2xl font-extrabold">Crea tu PIN</h1>
      <p className="text-slate-700">Cambia el PIN que te dieron por uno que solo tú sepas. No uses tu DNI ni números seguidos.</p>
      {campo("PIN que te dieron", actual, setActual)}
      {campo("Nuevo PIN (6 dígitos)", nuevo, setNuevo)}
      {campo("Repite el nuevo PIN", repite, setRepite)}
      {error && <Aviso>{error}</Aviso>}
      <button type="submit" className="boton-primario mt-auto" disabled={enviando || nuevo.length < 4}>
        {enviando ? "Guardando…" : "Guardar PIN"}
      </button>
    </form>
  );
}
