import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import { User } from '@coworking-cafe/database'
import logger from '@/lib/logger'

interface PINVerifyRequest {
  pin: string
}

interface PINVerifyResponse {
  success: boolean
  user?: {
    id: string
    name: string
    email: string
    role: 'dev' | 'admin' | 'staff'
  }
  error?: string
}

/**
 * POST /api/auth/pin
 * Vérifie le PIN et retourne les données utilisateur
 */
export async function POST(request: NextRequest): Promise<NextResponse<PINVerifyResponse>> {
  try {
    await connectMongoose()

    const body: PINVerifyRequest = await request.json()
    const { pin } = body

    if (!pin || pin.length < 4 || pin.length > 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'PIN invalide',
        },
        { status: 400 }
      )
    }

    // Chercher l'utilisateur avec ce PIN et populate le role
    const user = await User.findOne({ pin })
      .populate('role')
      .lean()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'PIN incorrect',
        },
        { status: 401 }
      )
    }

    // Vérifier que le role est bien populé et valide
    const role = user.role as any
    if (!role?.slug || !['dev', 'admin', 'staff'].includes(role.slug)) {
      logger.error('Invalid role for PIN user', { email: user.email, role: role?.slug })
      return NextResponse.json(
        {
          success: false,
          error: 'Accès non autorisé',
        },
        { status: 403 }
      )
    }

    // Retourner les données utilisateur (sans le PIN)
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.givenName || user.username || user.email.split('@')[0],
        email: user.email,
        role: role.slug as 'dev' | 'admin' | 'staff',
      },
    })
  } catch (error) {
    logger.error('PIN verification API error', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
      },
      { status: 500 }
    )
  }
}
