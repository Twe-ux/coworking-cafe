import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { PromoConfig as PromoConfigModel } from '@coworking-cafe/database'
import type { MarketingContent, ApiResponse } from '@/types/promo'

/**
 * POST /api/promo/marketing - Update marketing content
 * Auth: dev, admin (écriture)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MarketingContent>>> {
  // 1. Auth (écriture = admin/dev seulement)
  const authResult = await requireAuth(['dev', 'admin'])
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<MarketingContent>>
  }

  // 2. DB Connection
  await connectMongoose()

  // 3. Parse body
  try {
    const body: Partial<MarketingContent> = await request.json()

    // 4. Validation
    if (!body.title && !body.message && !body.ctaText && body.imageUrl === undefined) {
      return errorResponse(
        'Données manquantes',
        'Au moins un champ doit être fourni: title, message, ctaText, imageUrl',
        400
      )
    }

    // 5. Business logic
    const promoConfig = await PromoConfigModel.findOne()

    if (!promoConfig) {
      return errorResponse('Configuration promo non trouvée', 'Aucune config en base', 404)
    }

    // Update uniquement les champs fournis
    if (body.title !== undefined) {
      promoConfig.marketing.title = body.title
    }
    if (body.message !== undefined) {
      promoConfig.marketing.message = body.message
    }
    if (body.ctaText !== undefined) {
      promoConfig.marketing.ctaText = body.ctaText
    }
    if (body.imageUrl !== undefined) {
      promoConfig.marketing.imageUrl = body.imageUrl
    }

    await promoConfig.save()

    // Formater la réponse
    const updatedMarketing: MarketingContent = {
      title: promoConfig.marketing.title,
      message: promoConfig.marketing.message,
      imageUrl: promoConfig.marketing.imageUrl,
      ctaText: promoConfig.marketing.ctaText,
    }

    return successResponse(updatedMarketing, 'Contenu marketing mis à jour avec succès')
  } catch (error) {
    console.error('POST /api/promo/marketing error:', error)
    return errorResponse(
      'Erreur lors de la mise à jour du contenu marketing',
      error instanceof Error ? error.message : 'Erreur inconnue'
    )
  }
}
