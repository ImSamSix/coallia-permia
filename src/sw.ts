/// <reference lib="webworker" />
/* ==========================================================================
   👑 SERVICE WORKER - COALLIA PERMIA (Vite/Workbox)
   🎯 OBJECTIF : Cache-fort pour l'interface, compatible iOS & Android.
   Réintègre la stratégie hybride de l'ancien sw.js manuel (réseau d'abord
   pour le code, cache d'abord pour les images/CDN figés) par-dessus le
   pré-cache généré par vite-plugin-pwa (liste de fichiers construite et
   hashée automatiquement à chaque build, au lieu d'un ASSETS_TO_CACHE
   maintenu à la main).
   ========================================================================== */
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

// 📦 Pré-cache : fichiers de build (manifeste injecté par vite-plugin-pwa)
//    + filet de secours CDN figé en version (identique à l'ancien ASSETS_TO_CACHE).
precacheAndRoute([
  ...self.__WB_MANIFEST,
  { url: "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js", revision: null },
  { url: "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js", revision: null },
  { url: "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js", revision: null }
]);
cleanupOutdatedCaches();

const RUNTIME_CACHE = "permia-runtime";

function estWorkerRelais(url: URL): boolean {
  // 🛡️ SÉCURITÉ : les requêtes vers les Workers Cloudflare (login, sync,
  // relais Power Automate) passent TOUJOURS en direct, jamais interceptées.
  return url.href.includes("workers.dev");
}

// 🌐 CODE (html/js/css/navigations) : RÉSEAU D'ABORD
//    Les corrections arrivent sans bump de version de cache.
registerRoute(
  ({ request, url }) =>
    url.origin === self.location.origin &&
    !estWorkerRelais(url) &&
    (request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith(".js") || url.pathname.endsWith(".css") || url.pathname === "/" || url.pathname.endsWith("/")),
  new NetworkFirst({ cacheName: RUNTIME_CACHE })
);

// 📦 CDN (cross-origin, hors Workers) : CACHE D'ABORD, ignoreVary
//    Les versions sont figées, donc aucun risque d'obsolescence, et l'app
//    reste opérationnelle hors-ligne même si le cache HTTP a été vidé.
registerRoute(
  ({ url }) => url.origin !== self.location.origin && !estWorkerRelais(url),
  new CacheFirst({ cacheName: RUNTIME_CACHE, matchOptions: { ignoreVary: true } })
);

// 🖼️ Reste du même domaine (images, manifest, polices) : CACHE D'ABORD
registerRoute(({ url }) => url.origin === self.location.origin && !estWorkerRelais(url), new CacheFirst({ cacheName: RUNTIME_CACHE }));

// 📡 Hors-ligne total sur une navigation : on retombe sur la dernière page connue.
setCatchHandler(async ({ request }) => {
  if (request.mode === "navigate") {
    const cached = await caches.match("index.html");
    if (cached) return cached;
  }
  return Response.error();
});
