/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // La app se instala y abre SIN conexión (precache del shell). Las llamadas al API nunca se cachean.
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icono.svg"],
      manifest: {
        name: "JC & ED · Marcaje",
        short_name: "JC&ED Marcaje",
        description: "Marcaje de asistencia en obra",
        lang: "es-PE",
        theme_color: "#1E293B",
        background_color: "#1E293B",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icono-192.png", sizes: "192x192", type: "image/png" },
          { src: "icono-512.png", sizes: "512x512", type: "image/png" },
          { src: "icono.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [],
      },
    }),
  ],
  server: { port: 5175, strictPort: true, proxy: { "/api": { target: "http://localhost:8080", changeOrigin: true } } },
  build: { target: "es2020", cssCodeSplit: false },
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"], css: false },
});
