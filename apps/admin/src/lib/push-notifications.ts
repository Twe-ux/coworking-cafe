import webPush from "web-push";
import { PushSubscription } from "@/models/pushSubscription";

/**
 * Configuration de web-push avec les clés VAPID
 * Les clés doivent être générées avec: npx web-push generate-vapid-keys
 * Et stockées dans .env.local
 */
function initializeWebPush() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject =
    process.env.VAPID_SUBJECT || "mailto:admin@coworkingcafe.com";

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn(
      "[Push] VAPID keys not configured. Generate them with: npx web-push generate-vapid-keys",
    );
    return false;
  }

  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  return true;
}

/**
 * Types de notifications supportés
 */
export type NotificationType =
  | "contact"
  | "messenger"
  | "support"
  | "system"
  | "booking"
  | "justification";

/**
 * Configuration des types de notifications
 */
export const NOTIFICATION_CONFIGS = {
  contact: {
    icon: "/web-app-manifest-512x512.png",
    badge: "/web-app-manifest-192x192.png",
    tag: "contact-message",
    url: "/admin/messages/contact",
  },
  messenger: {
    icon: "/web-app-manifest-512x512.png",
    badge: "/web-app-manifest-192x192.png",
    tag: "messenger-message",
    url: "/admin/messages/messenger",
  },
  support: {
    icon: "/web-app-manifest-512x512.png",
    badge: "/web-app-manifest-192x192.png",
    tag: "support-message",
    url: "/admin/messages/support",
  },
  system: {
    icon: "/web-app-manifest-512x512.png",
    badge: "/web-app-manifest-192x192.png",
    tag: "system-notification",
    url: "/admin",
  },
  booking: {
    icon: "/web-app-manifest-512x512.png",
    badge: "/web-app-manifest-192x192.png",
    tag: "booking-notification",
    url: "/admin/booking/reservations",
  },
  justification: {
    icon: "/web-app-manifest-512x512.png",
    badge: "/web-app-manifest-192x192.png",
    tag: "justification-notification",
    url: "/admin/hr/clocking-admin",
  },
} as const;

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
  type?: NotificationType;
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
      console.warn("[Push] Skipping push notification (VAPID not configured)");
      return {
        success: false,
        sent: 0,
        failed: 0,
        errors: ["VAPID not configured"],
      };
    }

    // Récupérer toutes les subscriptions
    const subscriptions = await PushSubscription.find({});

    if (subscriptions.length === 0) {
      console.log("[Push] No subscriptions found");
      return { success: true, sent: 0, failed: 0, errors: [] };
    }

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      icon: data.icon || "/web-app-manifest-192x192.png",
      badge: data.badge || "/favicon-96x96.png",
      tag: data.tag || "notification",
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
            payload,
          );

          sent++;
          console.log("[Push] Notification sent to:", sub.endpoint);
        } catch (error) {
          failed++;

          // Si l'erreur est 410 (Gone), supprimer la subscription invalide
          if (
            error &&
            typeof error === "object" &&
            "statusCode" in error &&
            error.statusCode === 410
          ) {
            console.log("[Push] Subscription expired, deleting:", sub.endpoint);
            await PushSubscription.deleteOne({ endpoint: sub.endpoint });
          } else {
            console.error("[Push] Error sending to:", sub.endpoint, error);
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            errors.push(`${sub.endpoint}: ${errorMessage}`);
          }
        }
      }),
    );

    console.log(`[Push] Sent: ${sent}, Failed: ${failed}`);

    return {
      success: sent > 0,
      sent,
      failed,
      errors,
    };
  } catch (error) {
    console.error("[Push] sendPushNotification error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      sent: 0,
      failed: 0,
      errors: [errorMessage],
    };
  }
}

/**
 * Envoie une notification générique basée sur le type
 */
async function sendTypedNotification(
  type: NotificationType,
  data: {
    body: string;
    messageId: string;
    unreadCount: number;
    requireInteraction?: boolean;
  },
): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}> {
  const config = NOTIFICATION_CONFIGS[type];

  console.log(`[Push] Sending ${type} notification:`, {
    messageId: data.messageId,
    body: data.body,
    unreadCount: data.unreadCount,
  });

  return await sendPushNotification({
    title: "",
    body: data.body,
    icon: config.icon,
    badge: config.badge,
    tag: config.tag,
    url: config.url,
    requireInteraction: data.requireInteraction ?? true,
    messageId: data.messageId,
    unreadCount: data.unreadCount,
    type,
  });
}

/**
 * Envoie une notification pour un nouveau message de contact
 */
export async function sendNewContactNotification(contactData: {
  id: string;
  name: string;
  subject: string;
  message: string;
  unreadCount: number;
}): Promise<void> {
  const body = `${contactData.name} - ${contactData.subject}: ${contactData.message}`;
  const truncatedBody =
    body.length > 120 ? body.substring(0, 117) + "..." : body;

  const result = await sendTypedNotification("contact", {
    body: truncatedBody,
    messageId: contactData.id,
    unreadCount: contactData.unreadCount,
  });

  console.log("[Push] Contact notification result:", result);
}

/**
 * Envoie une notification pour un nouveau message messenger
 */
export async function sendNewMessengerNotification(messengerData: {
  id: string;
  senderName: string;
  message: string;
  unreadCount: number;
}): Promise<void> {
  const body = `Message de ${messengerData.senderName}: ${messengerData.message}`;
  const truncatedBody =
    body.length > 120 ? body.substring(0, 117) + "..." : body;

  const result = await sendTypedNotification("messenger", {
    body: truncatedBody,
    messageId: messengerData.id,
    unreadCount: messengerData.unreadCount,
  });

  console.log("[Push] Messenger notification result:", result);
}

/**
 * Envoie une notification pour une demande de support
 */
export async function sendNewSupportNotification(supportData: {
  id: string;
  userName: string;
  subject: string;
  message: string;
  unreadCount: number;
}): Promise<void> {
  const body = `Support - ${supportData.userName}: ${supportData.subject}`;
  const truncatedBody =
    body.length > 120 ? body.substring(0, 117) + "..." : body;

  const result = await sendTypedNotification("support", {
    body: truncatedBody,
    messageId: supportData.id,
    unreadCount: supportData.unreadCount,
  });

  console.log("[Push] Support notification result:", result);
}

/**
 * Envoie une notification système
 */
export async function sendSystemNotification(systemData: {
  id: string;
  title: string;
  message: string;
}): Promise<void> {
  const body = `${systemData.title} - ${systemData.message}`;
  const truncatedBody =
    body.length > 120 ? body.substring(0, 117) + "..." : body;

  const result = await sendTypedNotification("system", {
    body: truncatedBody,
    messageId: systemData.id,
    unreadCount: 0,
    requireInteraction: false,
  });

  console.log("[Push] System notification result:", result);
}

/**
 * Envoie une notification pour une nouvelle réservation en attente
 */
export async function sendNewBookingNotification(bookingData: {
  id: string;
  clientName: string;
  spaceName: string;
  date: string;
  time: string;
  pendingCount: number;
}): Promise<void> {
  const body = `Nouvelle réservation - ${bookingData.clientName}, ${bookingData.spaceName} le ${bookingData.date} à ${bookingData.time}`;
  const truncatedBody =
    body.length > 120 ? body.substring(0, 117) + "..." : body;

  const result = await sendTypedNotification("booking", {
    body: truncatedBody,
    messageId: bookingData.id,
    unreadCount: bookingData.pendingCount,
    requireInteraction: true,
  });

  console.log("[Push] Booking notification result:", result);
}

/**
 * Envoie une notification pour un nouveau pointage hors planning avec justification
 */
export async function sendNewJustificationNotification(data: {
  id: string;
  employeeName: string;
  clockTime: string;
  type: "clock-in" | "clock-out";
  pendingCount: number;
}): Promise<void> {
  const direction = data.type === "clock-in" ? "Arrivée" : "Départ";
  const body = `Pointage hors planning - ${data.employeeName}, ${direction} à ${data.clockTime}`;
  const truncatedBody =
    body.length > 120 ? body.substring(0, 117) + "..." : body;

  const result = await sendTypedNotification("justification", {
    body: truncatedBody,
    messageId: data.id,
    unreadCount: data.pendingCount,
    requireInteraction: true,
  });

  console.log("[Push] Justification notification result:", result);
}
