import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "pe.jced.campo",
  appName: "JC&ED Marcaje",
  webDir: "dist",
  android: {
    // Sin tráfico HTTP sin cifrar en producción (el API va por HTTPS).
    allowMixedContent: false,
  },
};

export default config;
