import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { sendPushNotification } from '@/lib/push-notifications';
import { PushSubscription } from '@/models/pushSubscription';
import { connectDB } from '@/lib/db';

/**
 * POST /api/notifications/test
 * Envoie une notification de test (dev/admin uniquement)
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    await connectDB();

    const body = await request.json();
    const { title, message } = body;

    // Compter les subscriptions actives
    const subscriptions = await PushSubscription.find({});

    console.log('[Notifications Test] Sending test notification to', subscriptions.length, 'subscriptions');

    // Envoyer la notification
    const result = await sendPushNotification({
      title: title || 'Test de notification',
      body: message || 'Ceci est une notification de test depuis le dashboard admin',
      icon: '/web-app-manifest-512x512.png',
      badge: '/web-app-manifest-192x192.png',
      tag: 'test-notification',
      url: '/admin/debug/notifications',
      requireInteraction: false,
      unreadCount: 1,
    });

    console.log('[Notifications Test] Result:', result);

    return NextResponse.json({
      success: true,
      result,
      subscriptionsCount: subscriptions.length,
    });
  } catch (error) {
    console.error('[Notifications Test] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/test
 * Récupère les informations de debug
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    await connectDB();

    const subscriptions = await PushSubscription.find({});

    return NextResponse.json({
      success: true,
      data: {
        subscriptionsCount: subscriptions.length,
        subscriptions: subscriptions.map(s => ({
          endpoint: s.endpoint.substring(0, 50) + '...',
          createdAt: s.createdAt,
        })),
        vapidConfigured: !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
        environment: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error('[Notifications Test] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
