// Service Worker pour CoworKing Café PWA
const CACHE_NAME = "coworking-cafe-v4"; // ⬅️ BUMP : purge l'ancien cache (dont /booking périmé)
const urlsToCache = [
  // '/booking' RETIRÉ — la page a migré vers book.coworkingcafe.fr/reserver
  "/logo/favicon.svg",
  "/logo/favicon-96x96.png",
  "/logo/android-chrome-192x192.png",
  "/logo/android-chrome-512x512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting(); // ⬅️ prend la main tout de suite (pas d'attente de fermeture d'onglet)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : null)),
        ),
      )
      .then(() => self.clients.claim()), // ⬅️ contrôle les onglets ouverts immédiatement
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  // Toujours réseau (jamais de cache) → le 308 vers book.coworkingcafe.fr est honoré
  const noCachePaths = [
    "/api/auth",
    "/api/bookings",
    "/api/payments",
    "/dashboard",
    "/booking",
    "/auth",
  ];
  if (noCachePaths.some((path) => url.pathname.startsWith(path))) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});
