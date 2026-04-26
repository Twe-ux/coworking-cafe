"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import type { AuthUser } from "@/types/user"

export function useAuth() {
  const { data: session, status } = useSession()

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name,
      }
    : null

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    signIn,
    signOut,
  }
}

export { signIn, signOut }
