import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// Cloudflare Turnstile (captcha invisible). Es el ÚNICO script de terceros del sitio y solo se
// carga en las páginas con formulario.
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let cargando: Promise<void> | null = null;

function cargarScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  cargando ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => { cargando = null; reject(new Error("No se pudo cargar la verificación anti-spam")); };
    document.head.appendChild(s);
  });
  return cargando;
}

export interface TurnstileRef {
  reiniciar: () => void;
}

const Turnstile = forwardRef<TurnstileRef, { onToken: (t: string | null) => void }>(function Turnstile({ onToken }, ref) {
  const caja = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const callback = useRef(onToken);
  callback.current = onToken;

  useImperativeHandle(ref, () => ({
    reiniciar: () => {
      callback.current(null);
      if (widget.current) window.turnstile?.reset(widget.current);
    },
  }));

  useEffect(() => {
    let vivo = true;
    cargarScript()
      .then(() => {
        if (!vivo || !caja.current || !window.turnstile) return;
        widget.current = window.turnstile.render(caja.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          language: "es",
          theme: "dark",
          appearance: "interaction-only",
          callback: (t: string) => callback.current(t),
          "expired-callback": () => callback.current(null),
          "error-callback": () => callback.current(null),
        });
      })
      .catch(() => callback.current(null));
    return () => {
      vivo = false;
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, []);

  return <div ref={caja} className="min-h-0" />;
});

export default Turnstile;
