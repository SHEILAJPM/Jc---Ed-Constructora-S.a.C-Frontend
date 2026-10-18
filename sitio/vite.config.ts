/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // En desarrollo el navegador habla con el mismo origen y Vite reenvía al web-api.
    proxy: { "/api": { target: "http://localhost:8081", changeOrigin: true } },
  },
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        // Librerías pesadas en trozos aparte: la portada no espera por GSAP/Motion.
        manualChunks: {
          react: ["react", "react-dom", "react-router"],
          datos: ["@tanstack/react-query", "axios"],
          animacion: ["gsap", "motion", "lenis"],
          formularios: ["react-hook-form", "zod", "@hookform/resolvers"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
