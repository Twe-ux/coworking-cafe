import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase, User as UserModel } from "@coworking-cafe/database"
import type { UserDocument } from "@coworking-cafe/database"

type UserWithPassword = UserDocument & {
  comparePassword(candidatePassword: string): Promise<boolean>
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          await connectToDatabase()
          const user = (await UserModel.findOne({
            email: credentials.email.toLowerCase(),
          }).select("+password")) as UserWithPassword | null
          if (!user || user.deletedAt) return null
          const isValid = await user.comparePassword(credentials.password)
          if (!isValid) return null
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.givenName ?? null,
          }
        } catch (error) {
          console.error("[NextAuth] authorize error:", error instanceof Error ? error.message : String(error))
          return null
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
