import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ─── Wi-Fi / LAN доступ ───────────────────────────────────────────────────
  // host: true  → Vite слушает 0.0.0.0 и печатает Network URL вида
  //   http://192.168.x.x:5173 — открой его с телефона в той же Wi-Fi сети.
  // strictPort  → не прыгать на другой порт, если 5173 занят (предсказуемый URL).
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
});
