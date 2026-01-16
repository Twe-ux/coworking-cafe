import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { NextResponse } from 'next/server'

export async function requireAuth(requiredRoles: string[] = ['dev', 'admin']) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }
  }

  const userRole = (session?.user as any)?.role
  if (!requiredRoles.includes(userRole)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }
  }

  return { authorized: true, session, userRole }
}
