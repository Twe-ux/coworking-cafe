import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

/**
 * GET /api/debug/token
 * Debug endpoint pour voir le contenu du token JWT
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      success: true,
      debug: {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
        userName: session?.user?.name || null,
        userRole: session?.user?.role || null,
        userRoleType: typeof session?.user?.role,
        fullSession: session,
      },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: errorMessage,
    })
  }
}
