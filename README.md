# JC & ED Constructora · Frontend

| Carpeta | Qué es | Estado |
|---|---|---|
| `sitio/` | Sitio web público (React 19 + Vite + TypeScript + Tailwind 4) | Fases 1–2 listas, más cotizador y libro de reclamaciones |
| `erp/` | Web del ERP (React 19 + Vite + Tailwind 4 + Leaflet) | Fases 1–2 listas |
| `campo/` | App de marcaje: PWA offline + Android (Capacitor 8) | Fase 2 lista |

## Sitio web: levantar en local

Requiere Node 22+ y el `web-api` corriendo en `http://localhost:8081` (repo Backend, carpeta `web-api`).

```bash
cd sitio
npm install
cp .env.example .env.local   # llave de PRUEBA de Turnstile incluida
npm run dev                  # http://localhost:5173 (Vite reenvía /api al web-api)
npm test                     # pruebas unitarias
npm run build                # build de producción en dist/
```

## Qué reemplazar antes de publicar

- **Logo:** `src/components/ui/Logo.tsx`, `public/logo.svg` y `public/favicon.svg` son provisionales.
- **Datos de la empresa:** `src/lib/empresa.ts` (RUC, correo, dirección y horario marcados como `COMPLETAR`).
- **Fotos de proyectos, certificados y equipo:** se suben desde el panel admin (fase 6).
- **Proyectos de ejemplo:** se borran o reemplazan desde el panel; están marcados como `EJEMPLO`.
- **Testimonios:** solo reales y con permiso; la sección se oculta mientras no haya.
- **Clientes y aliados:** logos con autorización.
- **Hitos de la línea de tiempo y código de ética:** `src/pages/LaEmpresa.tsx`.
- **Textos legales:** `src/pages/legal/*`, para revisión de un abogado.
- **Mapa de Google:** `src/pages/Contacto.tsx`, cuando se confirme la dirección.
- **Turnstile:** `VITE_TURNSTILE_SITE_KEY` real.

## Seguridad

- El único script de terceros es Cloudflare Turnstile, y solo carga en las páginas con formulario.
- Las fuentes se sirven desde el propio sitio: no hay Google Fonts.
- Sin analítica de rastreo ni cookies de publicidad.

## ERP: levantar en local

Requiere el `erp-api` corriendo en `http://localhost:8080` (repo Backend, carpeta `erp-api`).

```bash
cd erp
npm install
npm run dev    # http://localhost:5174 (Vite reenvía /api al erp-api)
npm test
```

- **Sesión:** el token de acceso vive solo en memoria y el refresh en una cookie HttpOnly. Por eso, en desarrollo, la web y el API se usan por el mismo origen (proxy de Vite).
- **Mapa:** OpenStreetMap. Para mucho tráfico en producción conviene un proveedor de mapas con contrato.

## App de campo: levantar en local

Requiere el `erp-api` en `http://localhost:8080`.

```bash
cd campo
npm install
npm run dev     # http://localhost:5175 (Vite reenvía /api al erp-api)
npm test
```

- **Probar en el navegador:** entra con un obrero de prueba (DNI `70000001`, PIN = `SEMILLA_PIN` del backend). Chrome deja simular la ubicación en DevTools → Sensors.
- **El celular necesita HTTPS** para cámara, GPS y la llave del dispositivo (salvo en `localhost`).

### App Android

Requiere Android Studio (SDK 36) y JDK 21.

```bash
cd campo
cp .env.example .env.local     # VITE_API_URL=https://<dominio del erp-api>/api
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug     # app/build/outputs/apk/debug/app-debug.apk
```

- `android/local.properties` debe tener `sdk.dir=C:/Users/<usuario>/AppData/Local/Android/Sdk` (con `/`).
- El plugin nativo está en `android/app/src/main/java/pe/jced/campo/IntegridadPlugin.java`: llave en Android Keystore, ubicación de una sola lectura con detección de GPS falso, root y emulador.
- Para publicar: firmar con una llave de la empresa (no la de debug) y activar Play Integrity en Play Console.
