/* ==========================================================================
   👑 SERVICE WORKER - COALLIA PERMIA (Version 4.0 - Safari Redirect Fix)
   👨‍💻 AUTEUR : Sami Charles Hassen Harigua
   🎯 OBJECTIF : Cache-fort pour l'interface compatible iOS & Android
   ========================================================================== */

const CACHE_NAME = 'permia-core-v71';

const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'css/style.css',
    'js/script.js',
    // 🔐 VITAL : crypto-js hébergé en local, plus aucun aléa de CDN au déverrouillage
    'js/crypto-js.min.js',
    'manifest.json',
    'img/logo-coallia.png',
    'img/app-icon.png',

    // Filet de secours réseau (utilisé seulement si la copie locale manque)
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js',
    'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// 1. INSTALLATION SÉCURISÉE : Aspiration et nettoyage des redirections
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                ASSETS_TO_CACHE.map(async (url) => {
                    try {
                        const response = await fetch(url);
                        if (!response.ok) throw new Error('Échec réseau');

                        // 👑 FIX CRITIQUE SAFARI / IOS : Si la réponse est marquée comme "redirected",
                        // on clone son contenu dans une enveloppe neuve pour effacer le drapeau que Safari rejette.
                        if (response.redirected) {
                            const cleanResponse = new Response(response.body, {
                                status: 200,
                                statusText: 'OK',
                                headers: response.headers
                            });
                            return cache.put(url, cleanResponse);
                        }

                        // Sinon, on stocke la réponse normale
                        return cache.put(url, response);
                    } catch (err) {
                        console.error("🛑 Erreur de mise en cache sur l'asset :", url, err);
                    }
                })
            );
        })
    );
    self.skipWaiting();
});

// 2. ACTIVATION : Nettoyage automatique des anciennes versions de caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. INTERCEPTION (Fetch) : Stratégie hybride
//    - Code (html/js/css) : RÉSEAU D'ABORD → les corrections arrivent sans bump de version
//    - Images / manifest  : CACHE D'ABORD → démarrage instantané
self.addEventListener('fetch', (e) => {
    // 🛡️ SÉCURITÉ : On ne touche JAMAIS aux POST/PUT (envois vers les Workers, sync, DI)
    if (e.request.method !== 'GET') {
        return;
    }

    // 🛡️ SÉCURITÉ : Les requêtes vers tes Workers Cloudflare passent en direct
    if (e.request.url.includes('workers.dev')) {
        return;
    }

    const url = new URL(e.request.url);

    // 📦 CDN : cache d'abord. Les versions sont figées, donc aucun risque d'obsolescence,
    //    et l'app reste opérationnelle hors-ligne même si le cache HTTP a été vidé.
    if (url.origin !== self.location.origin) {
        e.respondWith(
            // ignoreVary : les CDN renvoient un en-tête Vary qui empêchait parfois
            // de retrouver l'asset pourtant bien présent en cache
            caches.match(e.request, { ignoreVary: true }).then((cached) => {
                if (cached) return cached;
                return fetch(e.request).then((reponse) => {
                    if (reponse && (reponse.ok || reponse.type === 'opaque')) {
                        const copie = reponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copie));
                    }
                    return reponse;
                }).catch(() => {
                    // 🛡️ Ne JAMAIS renvoyer undefined : le navigateur en fait une erreur réseau
                    // et le <script> concerné n'est jamais exécuté.
                    return cached || new Response('', { status: 504, statusText: 'CDN indisponible' });
                });
            })
        );
        return;
    }

    const estDuCode = e.request.mode === 'navigate'
        || url.pathname.endsWith('.html')
        || url.pathname.endsWith('.js')
        || url.pathname.endsWith('.css')
        || url.pathname === '/'
        || url.pathname.endsWith('/');

    if (estDuCode) {
        // 🌐 RÉSEAU D'ABORD : on prend la version fraîche, on la met en cache,
        // et on retombe sur le cache uniquement si le réseau est absent.
        e.respondWith(
            fetch(e.request)
                .then((reponseReseau) => {
                    if (reponseReseau && reponseReseau.ok) {
                        const copie = reponseReseau.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copie));
                    }
                    return reponseReseau;
                })
                .catch(() => {
                    // 📡 Hors-ligne : on sert la dernière version connue
                    return caches.match(e.request).then((cached) => {
                        return cached || caches.match('index.html');
                    });
                })
        );
        return;
    }

    // 🖼️ CACHE D'ABORD pour le reste (images, manifest, polices)
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            return cachedResponse || fetch(e.request);
        })
    );
});