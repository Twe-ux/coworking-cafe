/**
 * Types pour les sessions NextAuth
 */

export interface SessionUser {
  id: string
  email: string
  role: string
  name?: string
}
