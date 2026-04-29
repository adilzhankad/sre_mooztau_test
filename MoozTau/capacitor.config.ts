import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mooztau.app",
  appName: "MoozTau",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
