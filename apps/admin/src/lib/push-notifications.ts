import webPush from 'web-push';
import { PushSubscription } from '@/models/pushSubscription';

/**
 * Configuration de web-push avec les clés VAPID
 * Les clés doivent être générées avec: npx web-push generate-vapid-keys
 * Et stockées dans .env.local
 */
function initializeWebPush() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@coworkingcafe.com';

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('[Push] VAPID keys not configured. Generate them with: npx web-push generate-vapid-keys');
    return false;
  }

  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  return true;
}

/**
 * Interface pour les données de notification
 */
export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  requireInteraction?: boolean;
  messageId?: string;
  unreadCount?: number;
}

/**
 * Envoie une notification push à tous les appareils abonnés
 */
export async function sendPushNotification(data: NotificationData): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}> {
  try {
    const initialized = initializeWebPush();

    if (!initialized) {
      console.warn('[Push] Skipping push notification (VAPID not configured)');
      return { success: false, sent: 0, failed: 0, errors: ['VAPID not configured'] };
    }

    // Récupérer toutes les subscriptions
    const subscriptions = await PushSubscription.find({});

    if (subscriptions.length === 0) {
      console.log('[Push] No subscriptions found');
      return { success: true, sent: 0, failed: 0, errors: [] };
    }

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      icon: data.icon || '/web-app-manifest-192x192.png',
      badge: data.badge || '/favicon-96x96.png',
      tag: data.tag || 'notification',
      url: data.url,
      requireInteraction: data.requireInteraction || false,
      messageId: data.messageId,
      unreadCount: data.unreadCount,
    });

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Envoyer la notification à chaque subscription
    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
            },
            payload
          );

          sent++;
          console.log('[Push] Notification sent to:', sub.endpoint);
        } catch (error) {
          failed++;

          // Si l'erreur est 410 (Gone), supprimer la subscription invalide
          if (error.statusCode === 410) {
            console.log('[Push] Subscription expired, deleting:', sub.endpoint);
            await PushSubscription.deleteOne({ endpoint: sub.endpoint });
          } else {
            console.error('[Push] Error sending to:', sub.endpoint, error);
            errors.push(`${sub.endpoint}: ${error.message}`);
          }
        }
      })
    );

    console.log(`[Push] Sent: ${sent}, Failed: ${failed}`);

    return {
      success: sent > 0,
      sent,
      failed,
      errors,
    };
  } catch (error) {
    console.error('[Push] sendPushNotification error:', error);
    return {
      success: false,
      sent: 0,
      failed: 0,
      errors: [error.message],
    };
  }
}

/**
 * Envoie une notification pour un nouveau message de contact
 */
export async function sendNewContactNotification(contactData: {
  id: string;
  name: string;
  subject: string;
  unreadCount: number;
}): Promise<void> {
  await sendPushNotification({
    title: 'Nouveau message de contact',
    body: `${contactData.name}: ${contactData.subject}`,
    icon: '/web-app-manifest-192x192.png',
    badge: '/favicon-96x96.png',
    tag: 'contact-message',
    url: '/admin/support/contact',
    requireInteraction: true,
    messageId: contactData.id,
    unreadCount: contactData.unreadCount,
  });
}
