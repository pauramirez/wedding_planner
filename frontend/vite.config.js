import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Local dev: proxy /api to wrangler on 8787 so the frontend can use
      // same-origin cookies without cross-origin credential dance.
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: true
  }
});
