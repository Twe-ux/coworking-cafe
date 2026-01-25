// Service Worker pour PWA CoworKing Café Admin
// Gère les push notifications et la Badge API

const CACHE_NAME = 'cwc-admin-v6';
const urlsToCache = [
  '/admin',
  '/admin/messages/contact',
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
  // Ne mettre en cache que les requêtes GET
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

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
  console.log('[Service Worker] Push event received');
  console.log('[Service Worker] Push data:', event.data ? event.data.text() : 'no data');

  const defaultData = {
    title: 'Nouveau message',
    body: 'Vous avez reçu un nouveau message de contact',
    icon: '/web-app-manifest-512x512.png',
    badge: '/web-app-manifest-192x192.png',
    tag: 'contact-message',
    requireInteraction: false,
  };

  let data = defaultData;

  try {
    if (event.data) {
      data = event.data.json();
      console.log('[Service Worker] Parsed push data:', data);
    }
  } catch (e) {
    console.error('[Service Worker] Failed to parse push data:', e);
  }

  const notificationOptions = {
    body: data.body,
    icon: data.icon || defaultData.icon,
    badge: data.badge || defaultData.badge,
    tag: data.tag || defaultData.tag,
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/admin/messages/contact',
      messageId: data.messageId,
    },
    // Actions peuvent ne pas être supportées sur tous les navigateurs
    ...(typeof data.actions !== 'undefined' ? { actions: data.actions } : {}),
  };

  console.log('[Service Worker] Showing notification with options:', notificationOptions);

  const promiseChain = self.registration.showNotification(data.title, notificationOptions)
    .then(() => {
      console.log('[Service Worker] Notification shown successfully');

      // Mettre à jour le badge avec le nombre de messages non lus
      if (data.unreadCount !== undefined) {
        console.log('[Service Worker] Updating badge to:', data.unreadCount);
        if (navigator.setAppBadge) {
          return navigator.setAppBadge(data.unreadCount);
        }
      }
    })
    .catch((error) => {
      console.error('[Service Worker] Failed to show notification:', error);
    });

  event.waitUntil(promiseChain);
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  console.log('[Service Worker] Notification data:', event.notification.data);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Récupérer l'URL de destination
  const targetPath = event.notification.data?.url || '/admin/messages/contact';
  console.log('[Service Worker] Target path:', targetPath);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        console.log('[Service Worker] Found windows:', windowClients.length);

        // Si une fenêtre existe, la focus et envoie un message pour naviguer
        if (windowClients.length > 0) {
          const client = windowClients[0];
          console.log('[Service Worker] Focusing existing window:', client.url);

          // Focus la fenêtre
          return client.focus().then(() => {
            console.log('[Service Worker] Window focused, waiting for app to be ready...');

            // Attendre un court délai pour que l'app soit complètement hydratée
            // Ceci résout le problème du "premier clic" après réouverture de l'app
            return new Promise((resolve) => {
              setTimeout(() => {
                console.log('[Service Worker] Sending navigation message to client:', targetPath);

                // Envoyer un message à l'app pour qu'elle navigue elle-même
                client.postMessage({
                  type: 'NAVIGATE',
                  url: targetPath
                });

                resolve();
              }, 300); // 300ms suffisent pour l'hydratation React
            });
          });
        }

        // Sinon, ouvrir une nouvelle fenêtre avec l'URL complète
        if (clients.openWindow) {
          const fullUrl = self.registration.scope + targetPath.replace(/^\//, '');
          console.log('[Service Worker] Opening new window:', fullUrl);
          return clients.openWindow(fullUrl);
        }
      })
      .catch((error) => {
        console.error('[Service Worker] Error handling notification click:', error);
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
