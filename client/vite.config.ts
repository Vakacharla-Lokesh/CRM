import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React runtime — changes rarely, cached aggressively
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Charting — recharts is the biggest single dependency
          "vendor-charts": ["recharts"],
          // Table
          "vendor-table": ["@tanstack/react-table"],
          // UI primitives + icons
          "vendor-ui": ["radix-ui", "lucide-react", "class-variance-authority", "clsx", "tailwind-merge"],
        },
      },
    },
  },
});
