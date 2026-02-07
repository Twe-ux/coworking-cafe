import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { connectMongoose } from '@/lib/mongodb';
import Unavailability from '@/models/unavailability';
import type { SessionUser } from '@/types/session';

/**
 * GET /api/unavailability/pending - Get count of pending requests
 */

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userRole = (session.user as SessionUser).role;
    if (!userRole || !['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

    await connectMongoose();

    const count = await Unavailability.countDocuments({ status: 'pending' });

    return NextResponse.json({
      success: true,
      data: {
        count,
      },
    });
  } catch (error: unknown) {
    console.error('❌ Erreur API GET unavailability/pending:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du comptage des demandes en attente',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
