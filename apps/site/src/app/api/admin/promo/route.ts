import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/lib/auth-options';
import { promoService } from '@/lib/promo-service';

export const dynamic = 'force-dynamic';

// Récupérer toutes les données promo pour le dashboard
export async function GET() {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Allow staff (level 50+), admin (level 80+), dev (level 100)
    if (session.user.role.level < 50) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const config = await promoService.getConfig();
    const weeklyStats = await promoService.getWeeklyStats();
    const topHours = await promoService.getTopHours();

    return NextResponse.json({
      current: config.current,
      history: config.history,
      stats: config.stats,
      scan_stats: config.scan_stats,
      marketing: config.marketing,
      weekly_stats: weeklyStats,
      top_hours: topHours
    }, { status: 200 });
  } catch (error) {    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Créer un nouveau code promo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Allow staff (level 50+), admin (level 80+), dev (level 100)
    if (session.user.role.level < 50) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      description,
      discount_type,
      discount_value,
      valid_from,
      valid_until,
      max_uses,
      is_active
    } = body;

    // Validation
    if (!code || !description || !discount_type || discount_value === undefined) {
      return NextResponse.json(
        { error: 'Code, description, type et valeur de réduction sont requis' },
        { status: 400 }
      );
    }

    const newPromo = await promoService.createPromo({
      code,
      description,
      discount_type,
      discount_value,
      valid_from: valid_from || new Date().toISOString(),
      valid_until: valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      max_uses: max_uses || 0,
      is_active: is_active !== false
    });

    return NextResponse.json({
      message: 'Code promo créé avec succès',
      promo: newPromo
    }, { status: 201 });
  } catch (error) {    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
