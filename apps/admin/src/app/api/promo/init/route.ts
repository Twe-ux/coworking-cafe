import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { PromoConfig as PromoConfigModel } from '@coworking-cafe/database'
import { formatPromoConfigResponse } from '@/lib/utils/promo-formatter'
import type { PromoConfig, ApiResponse } from '@/types/promo'

/**
 * POST /api/promo/init - Initialiser la configuration promo (première fois)
 * Auth: dev, admin uniquement
 *
 * Crée un document PromoConfig vide si aucun n'existe
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PromoConfig>>> {
  // 1. Auth (admin/dev seulement)
  const authResult = await requireAuth(['dev', 'admin'])
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<PromoConfig>>
  }

  // 2. DB Connection
  await connectMongoose()

  // 3. Logic
  try {
    // Vérifier si une config existe déjà
    const existingConfig = await PromoConfigModel.findOne()

    if (existingConfig) {
      return errorResponse(
        'Configuration déjà initialisée',
        'Une configuration promo existe déjà en base',
        409
      )
    }

    // Créer une configuration vide
    const promoConfig = new PromoConfigModel({
      current: {
        code: 'BIENVENUE2026',
        token: crypto.randomUUID(),
        description: 'Code promo de démonstration',
        discountType: 'percentage',
        discountValue: 10,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
        maxUses: 100,
        currentUses: 0,
        isActive: true,
        createdAt: new Date(),
      },
      history: [],
      stats: {
        totalViews: 0,
        totalCopies: 0,
        viewsToday: 0,
        copiesToday: 0,
      },
      scanStats: {
        totalScans: 0,
        totalReveals: 0,
        totalCopies: 0,
        conversionRateReveal: 0,
        conversionRateCopy: 0,
        scansByDay: new Map(),
        scansByHour: new Map(),
        averageTimeToReveal: 0,
      },
      marketing: {
        title: 'Code Promo Exclusif',
        message: 'Profitez de notre offre spéciale !',
        ctaText: 'Révéler le code',
      },
      events: [],
    })

    await promoConfig.save()

    const formattedConfig = formatPromoConfigResponse(promoConfig)

    return successResponse(
      formattedConfig,
      'Configuration promo initialisée avec succès',
      201
    )
  } catch (error) {
    console.error('POST /api/promo/init error:', error)
    return errorResponse(
      'Erreur lors de l\'initialisation',
      error instanceof Error ? error.message : 'Erreur inconnue'
    )
  }
}
