import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import { ContactMail } from '@/models/contactMail';
import type { ContactMailStats } from '@/types/contactMail';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/messages/contact/stats
 * Récupère les statistiques des messages de contact
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; data?: ContactMailStats; error?: string }>> {
  // 1. Authentification
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) {
    return authResult.response as NextResponse<{
      success: boolean;
      data?: ContactMailStats;
      error?: string;
    }>;
  }

  // 2. Connexion DB
  await connectMongoose();

  try {
    // 3. Agréger les statistiques
    const stats = await ContactMail.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. Transformer en objet
    const result: ContactMailStats = {
      total: 0,
      unread: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };

    stats.forEach((stat) => {
      result[stat._id as keyof ContactMailStats] = stat.count;
      result.total += stat.count;
    });

    return successResponse(result, 'Statistiques récupérées avec succès');
  } catch (error) {
    console.error('GET /api/messages/contact/stats error:', error);
    return errorResponse(
      'Erreur lors de la récupération des statistiques',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}
