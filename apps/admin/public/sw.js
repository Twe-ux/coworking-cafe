// Service Worker pour PWA CoworKing Café Admin
// Gère les push notifications et la Badge API

const CACHE_NAME = 'cwc-admin-v1';
const urlsToCache = [
  '/admin',
  '/admin/support/contact',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie de cache : Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone la réponse
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Gestion des Push Notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);

  const defaultData = {
    title: 'Nouveau message',
    body: 'Vous avez reçu un nouveau message de contact',
    icon: '/web-app-manifest-192x192.png',
    badge: '/favicon-96x96.png',
    tag: 'contact-message',
    requireInteraction: false,
  };

  const data = event.data ? event.data.json() : defaultData;

  const promiseChain = self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || defaultData.icon,
    badge: data.badge || defaultData.badge,
    tag: data.tag || defaultData.tag,
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/admin/support/contact',
      messageId: data.messageId,
    },
    actions: [
      {
        action: 'view',
        title: 'Voir',
      },
      {
        action: 'close',
        title: 'Fermer',
      },
    ],
  });

  // Mettre à jour le badge avec le nombre de messages non lus
  if (data.unreadCount !== undefined) {
    promiseChain.then(() => {
      if (navigator.setAppBadge) {
        navigator.setAppBadge(data.unreadCount);
      }
    });
  }

  event.waitUntil(promiseChain);
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Ouvrir l'URL de la notification
  const urlToOpen = event.notification.data?.url || '/admin/support/contact';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Vérifier si une fenêtre est déjà ouverte
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event);
});

// Message handler pour mettre à jour le badge depuis l'app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'UPDATE_BADGE') {
    const count = event.data.count || 0;

    if (navigator.setAppBadge) {
      if (count > 0) {
        navigator.setAppBadge(count);
      } else {
        navigator.clearAppBadge();
      }
    }
  }

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
