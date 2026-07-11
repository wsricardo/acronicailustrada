const CACHE_NAME = 'acronica-cache-v3';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
    '/',
    '/css/style.css',
    '/js/main.js',
    '/assets/icon-192.png',
    '/assets/icon-512.png',
    '/assets/og-image.png',
    '/favicon.png',
    OFFLINE_URL
];

// Instalação: Cacheia os arquivos essenciais
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Intercepta requisições
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    const isSameOrigin = requestUrl.origin === self.location.origin;
    const isGoogleFonts = requestUrl.origin === 'https://fonts.googleapis.com' || requestUrl.origin === 'https://fonts.gstatic.com';

    // Ignora requisições de outros domínios ou do painel admin/api
    if ((!isSameOrigin && !isGoogleFonts) || requestUrl.pathname.startsWith('/api/') || event.request.method !== 'GET') {
        return;
    }

    const cacheKey = isSameOrigin ? requestUrl.pathname : event.request.url;
    const matchOptions = isSameOrigin ? { ignoreSearch: true } : {};

    // Para HTML e JSON (conteúdo dinâmico que deve estar atualizado): Network First
    if (event.request.headers.get('accept').includes('text/html') || requestUrl.pathname.endsWith('.json')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const resClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        // Remove query strings (como o ?t= do cache-buster) ao salvar arquivos locais
                        cache.put(cacheKey, resClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Se falhar a rede (offline), tenta pegar do cache
                    return caches.match(event.request, matchOptions).then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Se não tem no cache e for HTML, mostra a offline.html
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                    });
                })
        );
    } else {
        // Para arquivos estáticos (Imagens, CSS, JS): Stale-While-Revalidate
        event.respondWith(
            caches.match(event.request, matchOptions).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(cacheKey, networkResponse.clone());
                    });
                    return networkResponse;
                }).catch(() => {
                    // Falha silenciosa para assets em offline
                });
                return cachedResponse || fetchPromise;
            })
        );
    }
});
