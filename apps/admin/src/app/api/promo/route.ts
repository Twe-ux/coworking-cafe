import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { PromoConfig as PromoConfigModel } from '@coworking-cafe/database'
import { formatPromoConfigResponse } from '@/lib/utils/promo-formatter'
import type { PromoConfig, ApiResponse, CreatePromoCodeRequest } from '@/types/promo'

/**
 * GET /api/promo - Récupérer la configuration promo complète
 * Auth: dev, admin, staff (lecture)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PromoConfig>>> {
  // 1. Auth
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<PromoConfig>>
  }

  // 2. DB Connection
  await connectMongoose()

  // 3. Logic
  try {
    // Récupérer la config (il n'y en a qu'une seule)
    const promoConfig = await PromoConfigModel.findOne().lean()

    if (!promoConfig) {
      return errorResponse('Configuration promo non trouvée', 'Aucune config en base', 404)
    }

    const formattedConfig = formatPromoConfigResponse(promoConfig as any)

    return successResponse(formattedConfig, 'Configuration promo récupérée avec succès')
  } catch (error) {
    console.error('GET /api/promo error:', error)
    return errorResponse(
      'Erreur lors de la récupération de la configuration promo',
      error instanceof Error ? error.message : 'Erreur inconnue'
    )
  }
}

/**
 * POST /api/promo - Créer un nouveau code promo
 * Auth: dev, admin (écriture)
 * Action: Archive l'ancien code et crée un nouveau code actif
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PromoConfig>>> {
  // 1. Auth (écriture = admin/dev seulement)
  const authResult = await requireAuth(['dev', 'admin'])
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<PromoConfig>>
  }

  // 2. DB Connection
  await connectMongoose()

  // 3. Parse body
  try {
    const body: CreatePromoCodeRequest = await request.json()

    // 4. Validation
    const requiredFields: (keyof CreatePromoCodeRequest)[] = [
      'code',
      'token',
      'description',
      'discountType',
      'validFrom',
      'validUntil',
    ]

    // Vérifier les champs obligatoires (undefined ou null, pas falsy)
    const missingFields = requiredFields.filter((field) => body[field] == null || body[field] === '')

    // Vérifier les nombres séparément (peuvent être 0)
    if (body.discountValue == null) missingFields.push('discountValue')
    if (body.maxUses == null) missingFields.push('maxUses')

    if (missingFields.length > 0) {
      return errorResponse(
        'Données manquantes',
        `Champs requis: ${missingFields.join(', ')}`,
        400
      )
    }

    // Validation des dates
    const validFrom = new Date(body.validFrom)
    const validUntil = new Date(body.validUntil)

    if (isNaN(validFrom.getTime()) || isNaN(validUntil.getTime())) {
      return errorResponse('Dates invalides', 'Format attendu: YYYY-MM-DD', 400)
    }

    if (validFrom >= validUntil) {
      return errorResponse(
        'Dates invalides',
        'La date de début doit être avant la date de fin',
        400
      )
    }

    // Validation du discountValue
    if (body.discountValue <= 0) {
      return errorResponse('Valeur invalide', 'La remise doit être positive', 400)
    }

    // Validation du discountType
    if (
      body.discountType === 'percentage' &&
      (body.discountValue < 0 || body.discountValue > 100)
    ) {
      return errorResponse(
        'Pourcentage invalide',
        'Le pourcentage doit être entre 0 et 100',
        400
      )
    }

    // 5. Business logic
    // Récupérer la config existante
    let promoConfig = await PromoConfigModel.findOne()

    if (!promoConfig) {
      // Créer une nouvelle config si elle n'existe pas
      promoConfig = new PromoConfigModel({
        current: {
          code: body.code,
          token: body.token,
          description: body.description,
          discountType: body.discountType,
          discountValue: body.discountValue,
          validFrom,
          validUntil,
          maxUses: body.maxUses,
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
    } else {
      // Archiver le code actuel
      await promoConfig.archiveCurrentCode()

      // Définir le nouveau code
      promoConfig.current = {
        code: body.code,
        token: body.token,
        description: body.description,
        discountType: body.discountType,
        discountValue: body.discountValue,
        validFrom,
        validUntil,
        maxUses: body.maxUses,
        currentUses: 0,
        isActive: true,
        createdAt: new Date(),
      }
    }

    await promoConfig.save()

    const formattedConfig = formatPromoConfigResponse(promoConfig)

    return successResponse(formattedConfig, 'Code promo créé avec succès', 201)
  } catch (error) {
    console.error('POST /api/promo error:', error)

    // Gestion des erreurs de duplication
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return errorResponse(
        'Code promo dupliqué',
        'Un code promo avec ce token existe déjà',
        409
      )
    }

    return errorResponse(
      'Erreur lors de la création du code promo',
      error instanceof Error ? error.message : 'Erreur inconnue'
    )
  }
}
