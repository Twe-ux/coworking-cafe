import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Types } from "mongoose";
import {
  findUserByEmail,
  verifyPassword,
  getRedirectPathByRole,
  initializeRoles,
} from "./auth-helpers";
import { User } from "@coworking-cafe/database";
import { connectToDatabase } from "@coworking-cafe/database";
import type { RoleDocument } from "@coworking-cafe/database/src/models/role/document";

interface PopulatedRole {
  _id: Types.ObjectId;
  slug: "dev" | "admin" | "staff" | "client";
  name: string;
  level: number;
}

// Track if roles have been initialized
let rolesInitialized = false;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe sont requis");
        }

        try {
          // Initialize roles on first authentication attempt
          if (!rolesInitialized) {
            try {
              await initializeRoles();
              rolesInitialized = true;
            } catch (error) {
              // Don't throw here - roles might already exist
              console.error("Error initializing roles:", error);
            }
          }

          // Find user with populated role
          const user = await findUserByEmail(credentials.email);

          if (!user) {
            throw new Error("Email ou mot de passe invalide");
          }

          // Verify password
          const isValidPassword = await verifyPassword(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            throw new Error("Email ou mot de passe invalide");
          }

          // Update last login
          await User.findByIdAndUpdate(user._id, {
            lastLoginAt: new Date(),
          });

          const role = user.role;

          // Return user data for session
          return {
            id: (user._id as Types.ObjectId).toString(),
            email: user.email,
            name: user.givenName || user.username || user.email,
            username: user.username,
            role: {
              id: role._id.toString(),
              slug: role.slug,
              name: role.name,
              level: role.level,
            },
          };
        } catch (error) {
          if (error instanceof Error) {
            if (
              error.message.includes("ECONNREFUSED") ||
              error.message.includes("querySrv")
            ) {
              throw new Error(
                "Erreur de connexion à la base de données. Veuillez réessayer."
              );
            }
            throw new Error(error.message);
          }

          throw new Error("Erreur lors de l'authentification");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = (
          user as typeof user & { username?: string }
        ).username;
        token.role = (
          user as typeof user & {
            role: {
              id: string;
              slug: "dev" | "admin" | "staff" | "client";
              name: string;
              level: number;
            };
          }
        ).role;
      }

      // Handle session update - reload user data from database
      if (trigger === "update") {
        if (token.id) {
          try {
            await connectToDatabase();
            const updatedUser = await User.findById(token.id)
              .populate<{ role: RoleDocument }>("role")
              .lean();

            if (updatedUser) {
              const role = updatedUser.role;
              token.id = (updatedUser._id as Types.ObjectId).toString();
              token.email = updatedUser.email;
              token.name =
                updatedUser.givenName ||
                updatedUser.username ||
                updatedUser.email;
              token.username = updatedUser.username;
              token.role = {
                id: role._id.toString(),
                slug: role.slug as "dev" | "admin" | "staff" | "client",
                name: role.name,
                level: role.level,
              };
            }
          } catch (error) {
            console.error("Error updating user session:", error);
          }
        }

        // Also merge any session data passed
        if (session) {
          token = { ...token, ...session };
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Add custom fields to session
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          username: token.username as string | undefined,
          role: token.role as {
            id: string;
            slug: "dev" | "admin" | "staff" | "client";
            name: string;
            level: number;
          },
        };
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Handle redirects after login
      if (url.startsWith("/")) {
        return url;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token.site",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
};
