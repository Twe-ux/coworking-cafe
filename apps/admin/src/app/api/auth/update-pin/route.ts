import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import { UserModel } from '@/models/user'
import logger from '@/lib/logger'

interface UpdatePINRequest {
  newPIN: string
}

interface UpdatePINResponse {
  success: boolean
  error?: string
}

/**
 * POST /api/auth/update-pin
 * Met à jour le PIN de l'utilisateur connecté
 */
export async function POST(request: NextRequest): Promise<NextResponse<UpdatePINResponse>> {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Non authentifié',
        },
        { status: 401 }
      )
    }

    await connectMongoose()

    const body: UpdatePINRequest = await request.json()
    const { newPIN } = body

    // Validation du PIN
    if (!newPIN || !/^\d{6}$/.test(newPIN)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le PIN doit contenir exactement 6 chiffres',
        },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur par email
    const user = await UserModel.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Utilisateur non trouvé',
        },
        { status: 404 }
      )
    }

    // Mettre à jour le PIN
    user.pin = newPIN
    await user.save()

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    logger.error('Update PIN API error', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
      },
      { status: 500 }
    )
  }
}
