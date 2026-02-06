import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * GET /api/debug/middleware-token
 * Debug endpoint pour voir le token JWT tel que vu par le middleware
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer le token JWT de la même façon que le middleware
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: 'next-auth.session-token.admin', // Utiliser le même nom que dans auth-options.ts
    })

    return NextResponse.json({
      success: true,
      debug: {
        hasToken: !!token,
        tokenRole: token?.role || null,
        tokenRoleType: typeof token?.role,
        tokenId: token?.sub || null,
        tokenEmail: token?.email || null,
        tokenName: token?.name || null,
        fullToken: token,
        expectedRoles: ['dev', 'admin'],
        isRoleValid: token?.role ? ['dev', 'admin'].includes(token.role as string) : false,
      },
    })
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
}
