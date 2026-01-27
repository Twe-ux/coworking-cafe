// Service Worker pour CoworKing Café PWA
// Cache les assets pour une utilisation offline

const CACHE_NAME = 'coworking-cafe-v2';
const urlsToCache = [
  '/booking',
  '/favicon.svg',
  '/favicon-96x96.png',
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Ne cache que les requêtes GET
  if (event.request.method !== 'GET') return;

  // Ne JAMAIS mettre en cache les routes auth et APIs
  const url = new URL(event.request.url);
  const noCachePaths = ['/api/auth', '/api/bookings', '/api/payments', '/dashboard'];
  if (noCachePaths.some(path => url.pathname.startsWith(path))) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourne depuis le cache si disponible, sinon fetch
        return response || fetch(event.request);
      })
  );
});
