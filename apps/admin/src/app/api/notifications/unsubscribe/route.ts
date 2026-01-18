import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PushSubscription } from '@/models/pushSubscription';

/**
 * POST /api/notifications/unsubscribe
 * Supprime une push subscription
 */
export async function POST(request: NextRequest) {
  try {
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
