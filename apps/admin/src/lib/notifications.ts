// Utilitaires pour gérer les push notifications PWA

/**
 * Enregistre le service worker et retourne l'enregistrement
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[Notifications] Service Worker registered:', registration);

      // Attendre que le SW soit actif
      await navigator.serviceWorker.ready;

      return registration;
    } catch (error) {
      console.error('[Notifications] Service Worker registration failed:', error);
      return null;
    }
  }

  console.warn('[Notifications] Service Workers not supported');
  return null;
}

/**
 * Demande la permission pour les notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[Notifications] Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Génère une clé VAPID publique (à stocker dans .env.local)
 * Utilise web-push pour générer les clés
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Souscrit aux push notifications
 */
export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    // Clé VAPID publique (à générer avec web-push et stocker dans .env)
    // Pour l'instant, on utilise une clé temporaire
    // TODO: Générer une vraie clé VAPID et la stocker dans NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

    if (!vapidPublicKey) {
      console.warn('[Notifications] VAPID public key not configured');
      // Pour le développement, on continue sans VAPID (limité)
    }

    const applicationServerKey = vapidPublicKey
      ? urlBase64ToUint8Array(vapidPublicKey)
      : undefined;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    console.log('[Notifications] Push subscription:', subscription);

    // Enregistrer la subscription sur le serveur
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error('[Notifications] Push subscription failed:', error);
    return null;
  }
}

/**
 * Se désabonne des push notifications
 */
export async function unsubscribeFromPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      // Supprimer la subscription du serveur
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      console.log('[Notifications] Unsubscribed from push notifications');
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Notifications] Unsubscribe failed:', error);
    return false;
  }
}

/**
 * Détecte si l'app est en mode standalone (installée sur l'écran d'accueil)
 */
function isStandalone(): boolean {
  // iOS
  if ('standalone' in window.navigator) {
    return (window.navigator as any).standalone === true;
  }

  // Android et autres
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  return false;
}

/**
 * Détecte si on est sur iOS
 */
function isIOS(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

/**
 * Met à jour le badge de l'app avec le nombre de messages non lus
 */
export async function updateAppBadge(count: number): Promise<void> {
  const standalone = isStandalone();
  const ios = isIOS();

  console.log('[Notifications] Update badge requested:', {
    count,
    standalone,
    ios,
    badgeAPISupported: 'setAppBadge' in navigator,
  });

  // Badge API (supportée sur Chrome, Edge, Safari 16.4+)
  if ('setAppBadge' in navigator) {
    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
        console.log('[Notifications] ✅ Badge updated via Badge API:', count);
      } else {
        await navigator.clearAppBadge();
        console.log('[Notifications] ✅ Badge cleared via Badge API');
      }
      return;
    } catch (error) {
      console.error('[Notifications] ❌ Badge API failed:', error);

      // Sur iOS, l'erreur est souvent "NotAllowedError" si pas en standalone
      if (ios && !standalone) {
        console.warn('[Notifications] 💡 iOS: L\'app doit être installée sur l\'écran d\'accueil pour que le badge fonctionne');
      }
    }
  } else {
    console.warn('[Notifications] ⚠️ Badge API not supported on this browser');

    if (ios) {
      console.warn('[Notifications] 💡 iOS: Nécessite iOS 16.4+ et app installée');
    }
  }

  // Fallback: Envoyer un message au service worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    console.log('[Notifications] Trying fallback via Service Worker...');
    navigator.serviceWorker.controller.postMessage({
      type: 'UPDATE_BADGE',
      count,
    });
  }
}

/**
 * Vérifie si les notifications sont supportées et activées
 */
export function areNotificationsSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
}

/**
 * Vérifie si les notifications sont activées
 */
export function areNotificationsEnabled(): boolean {
  return Notification.permission === 'granted';
}

/**
 * Initialise le système de notifications (à appeler au chargement de l'app)
 */
export async function initializeNotifications(): Promise<{
  supported: boolean;
  enabled: boolean;
  registration: ServiceWorkerRegistration | null;
  subscription: PushSubscription | null;
}> {
  const supported = areNotificationsSupported();

  if (!supported) {
    return { supported: false, enabled: false, registration: null, subscription: null };
  }

  const registration = await registerServiceWorker();

  if (!registration) {
    return { supported: true, enabled: false, registration: null, subscription: null };
  }

  const enabled = areNotificationsEnabled();

  if (!enabled) {
    return { supported: true, enabled: false, registration, subscription: null };
  }

  // Vérifier si déjà abonné
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    // S'abonner automatiquement si permission déjà accordée
    const newSubscription = await subscribeToPushNotifications(registration);
    return { supported: true, enabled: true, registration, subscription: newSubscription };
  }

  return { supported: true, enabled: true, registration, subscription };
}
