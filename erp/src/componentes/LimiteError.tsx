import { AlertTriangle } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

/** Si una pantalla falla, se muestra un aviso en lugar de dejar la app en blanco. */
export default class LimiteError extends Component<{ children: ReactNode; clave?: string }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error en pantalla:", error, info.componentStack);
  }

  componentDidUpdate(prev: { clave?: string }) {
    if (prev.clave !== this.props.clave && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="tarjeta flex flex-col items-center gap-3 p-10 text-center">
        <AlertTriangle className="size-12 text-ambar" aria-hidden />
        <p className="text-xl font-semibold">Esta pantalla tuvo un problema.</p>
        <p className="text-slate-600">Recarga la página. Si se repite, avisa al Administrador.</p>
        <button type="button" onClick={() => location.reload()} className="min-h-12 rounded-lg bg-naranja px-5 font-semibold text-white">Recargar</button>
      </div>
    );
  }
}
