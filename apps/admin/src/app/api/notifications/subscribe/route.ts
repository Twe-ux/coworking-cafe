import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PushSubscription } from '@/models/pushSubscription';

/**
 * POST /api/notifications/subscribe
 * Enregistre une push subscription
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const { endpoint, keys } = body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        { success: false, error: 'Données de subscription invalides' },
        { status: 400 }
      );
    }

    // Vérifier si la subscription existe déjà
    let subscription = await PushSubscription.findOne({ endpoint });

    if (subscription) {
      // Mettre à jour la subscription existante
      subscription.keys = keys;
      subscription.userAgent = request.headers.get('user-agent') || undefined;
      await subscription.save();

      console.log('[Notifications] Subscription updated:', endpoint);
    } else {
      // Créer une nouvelle subscription
      subscription = await PushSubscription.create({
        endpoint,
        keys,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      console.log('[Notifications] Subscription created:', endpoint);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription enregistrée avec succès',
    });
  } catch (error) {
    console.error('[Notifications] Subscribe error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'enregistrement de la subscription',
      },
      { status: 500 }
    );
  }
}
