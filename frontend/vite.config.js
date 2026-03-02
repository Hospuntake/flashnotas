import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Redirige /api/* al backend automáticamente
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
