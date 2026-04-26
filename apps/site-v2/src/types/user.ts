// Internal auth types
export interface AuthUser {
  id: string
  email: string
  name?: string | null
  givenName?: string
}

// NextAuth module augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
  }
}
