import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Configuration du serveur de développement
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Configuration de build
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@fortawesome/react-fontawesome", "@fortawesome/free-solid-svg-icons"],
          maps: ["leaflet", "react-leaflet"],
          lightbox: ["yet-another-react-lightbox"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // Configuration des variables d'environnement
  define: {
    __APP_VERSION__: JSON.stringify("1.0.0"),
  },

  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "axios",
      "leaflet",
      "react-leaflet",
      "chart.js",
      "react-chartjs-2",
    ],
  },
});
