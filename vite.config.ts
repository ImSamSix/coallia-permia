import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  plugins: [
    VitePWA({
      // Logique de cache 100% personnalisée (voir src/sw.ts) : on garde le
      // contrôle fin du réseau-d'abord / cache-d'abord de l'ancien sw.js.
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: false,
      registerType: "autoUpdate",
      manifest: {
        short_name: "Permia",
        name: "Permia",
        lang: "fr",
        orientation: "portrait",
        start_url: "./index.html",
        background_color: "#f2f2f7",
        display: "standalone",
        scope: "./",
        theme_color: "#0055a4",
        description: "Application de gestion pour la permanence Coallia Permia",
        icons: [
          { src: "img/app-icon.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "img/app-icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "img/app-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      injectManifest: {
        // Les CDN figés (versions épinglées) restent pré-cachés au même titre
        // que les fichiers locaux, comme dans l'ancien ASSETS_TO_CACHE.
        globPatterns: ["**/*.{js,css,html,png,ico,svg}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  build: {
    outDir: "dist",
    sourcemap: true
  }
});
