import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Types } from "mongoose";
import {
  findUserByEmail,
  verifyPassword,
  getRedirectPathByRole,
  initializeRoles,
} from "./auth-helpers";
import { User } from "@coworking-cafe/database";
import dbConnect from "./mongodb";

interface PopulatedRole {
  _id: Types.ObjectId;
  slug: "dev" | "admin" | "staff" | "client";
  name: string;
  level: number;
}

// Track if roles have been initialized
let rolesInitialized = false;

export const options: NextAuthOptions = {
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
          throw new Error("Email and password are required");
        }
        try {
          // Initialize roles on first authentication attempt
          if (!rolesInitialized) {
            try {
              await initializeRoles();
              rolesInitialized = true;
            } catch (error) {
              // Don't throw here - roles might already exist
            }
          }

          // Find user with populated role
          const user = await findUserByEmail(credentials.email);

          if (!user) {
            throw new Error("Invalid email or password");
          }
          // Verify password
          const isValidPassword = await verifyPassword(
            credentials.password,
            user.password,
          );

          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }
          // Check if email is verified (optional)
          // if (!user.emailVerifiedAt) {
          //   throw new Error('Please verify your email first');
          // }

          // Update last login
          user.lastLoginAt = new Date();
          await user.save();

          const role = user.role as unknown as PopulatedRole;

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
          // Better error messages for debugging
          if (error instanceof Error) {
            if (
              error.message.includes("ECONNREFUSED") ||
              error.message.includes("querySrv")
            ) {
              throw new Error(
                "Database connection failed. Please try again later.",
              );
            }
            throw new Error(error.message);
          }

          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login", // Updated to new site auth path
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = (user as any).username;
        token.role = (user as any).role;
      }

      // Handle session update - reload user data from database
      if (trigger === "update") {
        if (token.id) {
          try {
            await dbConnect();
            // Use findById instead of findByEmail to handle email changes
            const updatedUser = await User.findById(token.id).populate("role");
            if (updatedUser) {
              const role = updatedUser.role as unknown as PopulatedRole;
              token.id = (updatedUser._id as Types.ObjectId).toString();
              token.email = updatedUser.email;
              token.name =
                updatedUser.givenName ||
                updatedUser.username ||
                updatedUser.email;
              token.username = updatedUser.username;
              token.role = {
                id: role._id.toString(),
                slug: role.slug,
                name: role.name,
                level: role.level,
              };
            }
          } catch (error) {
            // Error updating user session
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
          username: token.username as string,
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
        secure: false,
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
};
