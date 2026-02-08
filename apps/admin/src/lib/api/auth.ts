import { getServerSession, type Session } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { NextResponse } from 'next/server'

/**
 * Type de retour pour requireAuth - Union discriminée
 * Utilise `any` pour response afin d'être compatible avec tous les types de retour d'API
 */
type AuthResult =
  | {
      authorized: false
      response: NextResponse<any>
    }
  | {
      authorized: true
      session: Session
      userRole: string
    }

/**
 * Vérifie l'authentification et les permissions
 * @param requiredRoles - Liste des rôles autorisés
 * @returns AuthResult - Objet avec authorized et response (si non autorisé) ou session/userRole (si autorisé)
 */
export async function requireAuth(requiredRoles: string[] = ['dev', 'admin']): Promise<AuthResult> {
  const session = await getServerSession(authOptions)

  console.log('🔐 [requireAuth] Session:', session ? {
    userId: session.user?.id,
    userRole: session.user?.role,
    userEmail: session.user?.email
  } : 'NO SESSION');
  console.log('🔐 [requireAuth] Required roles:', requiredRoles);

  if (!session?.user?.id) {
    console.log('❌ [requireAuth] No session or user ID');
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      ) as NextResponse<any>
    }
  }

  const userRole = session.user.role
  console.log('🔐 [requireAuth] User role:', userRole);

  if (!requiredRoles.includes(userRole)) {
    console.log('❌ [requireAuth] Role not in required roles');
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      ) as NextResponse<any>
    }
  }

  console.log('✅ [requireAuth] Authorized');
  return { authorized: true, session, userRole }
}
