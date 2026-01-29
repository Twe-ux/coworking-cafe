import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache, CACHE_TAGS } from '../../../../lib/cache-helpers';

/**
 * POST /api/cache/revalidate
 * Invalider le cache manuellement
 *
 * Body: { tag: string }
 *
 * Exemples:
 * - { tag: "menu" } - Invalide tout le cache menu
 * - { tag: "global-hours" } - Invalide les horaires
 *
 * Note: Cette route est publique pour permettre à l'admin (apps/admin) d'invalider le cache du site
 */

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag } = body;

    if (!tag || typeof tag !== 'string') {
      return NextResponse.json(
        { error: 'Tag invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le tag est valide
    const validTags = Object.values(CACHE_TAGS);
    if (!validTags.includes(tag as any)) {
      return NextResponse.json(
        {
          error: 'Tag inconnu',
          validTags: validTags
        },
        { status: 400 }
      );
    }

    // Invalider le cache
    invalidateCache(tag);

    return NextResponse.json({
      success: true,
      message: `Cache invalidé pour le tag: ${tag}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'invalidation du cache' },
      { status: 500 }
    );
  }
}
