import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server:
    mode === "development"
      ? {
          proxy: {
            "/api": {
              target: "http://localhost:8000",
              changeOrigin: true,
            },
          },
        }
      : undefined,
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("docx")) {
              return "vendor-docx";
            }
            if (id.includes("jspdf")) {
              return "vendor-jspdf";
            }
            if (id.includes("html2canvas")) {
              return "vendor-html2canvas";
            }
            if (id.includes("recharts") || id.includes("d3")) {
              return "vendor-recharts";
            }
            if (id.includes("lucide-react")) {
              return "vendor-lucide";
            }
            if (id.includes("motion")) {
              return "vendor-motion";
            }
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "vendor-react-core";
            }
            return "vendor-others";
          }
        },
      },
    },
  },
}));
