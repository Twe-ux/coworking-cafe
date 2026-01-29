import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { connectDB } from '@/lib/db';
import { PushSubscription } from '@/models/pushSubscription';

/**
 * POST /api/notifications/subscribe
 * Enregistre une push subscription
 * Sécurité: Requiert une session authentifiée (dev, admin, staff)
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    // Vérification d'authentification
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérification des permissions
    const userRole = (session?.user as { role?: string })?.role;
    if (!userRole || !['dev', 'admin', 'staff'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

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
