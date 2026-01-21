import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import { UserModel } from '@/models/user'
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

    // Chercher l'utilisateur avec ce PIN
    const user = await UserModel.findOne({ pin }).lean()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'PIN incorrect',
        },
        { status: 401 }
      )
    }

    // Retourner les données utilisateur (sans le PIN)
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
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
