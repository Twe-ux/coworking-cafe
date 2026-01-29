import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { connectDB } from '@/lib/db';
import { PushSubscription } from '@/models/pushSubscription';

/**
 * POST /api/notifications/unsubscribe
 * Supprime une push subscription
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
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint manquant' },
        { status: 400 }
      );
    }

    // Supprimer la subscription
    await PushSubscription.deleteOne({ endpoint });

    console.log('[Notifications] Subscription deleted:', endpoint);

    return NextResponse.json({
      success: true,
      message: 'Subscription supprimée avec succès',
    });
  } catch (error) {
    console.error('[Notifications] Unsubscribe error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression de la subscription',
      },
      { status: 500 }
    );
  }
}
