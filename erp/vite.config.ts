/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: true,
    // Mismo origen en desarrollo: la cookie del refresh (SameSite=Strict, /api/auth) funciona sin CORS.
    proxy: { "/api": { target: "http://localhost:8080", changeOrigin: true } },
  },
  build: {
    target: "es2022",
    rollupOptions: { output: { manualChunks: { mapa: ["leaflet", "react-leaflet", "@geoman-io/leaflet-geoman-free"] } } },
  },
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"], css: false },
});
