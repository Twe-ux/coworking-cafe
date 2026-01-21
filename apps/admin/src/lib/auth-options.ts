import { NextAuthOptions } from 'next-auth';
import type { User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { connectMongoose } from '@/lib/mongodb';
import { User } from '@coworking-cafe/database';

// Types pour les documents MongoDB
interface UserDocument {
  _id: ObjectId;
  email: string;
  password: string;
  givenName?: string;
  username?: string;
  role: ObjectId;
}

interface RoleDocument {
  _id: ObjectId;
  slug: string;
  name: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        try {
          console.log('🔐 Authorization attempt for:', credentials?.email);

          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials');
            throw new Error('Email et mot de passe requis');
          }

          // Vérifier si c'est un PIN (6 chiffres uniquement)
          const isPIN = /^\d{6}$/.test(credentials.password);

          if (isPIN) {
            console.log('🔑 PIN authentication detected');
            await connectMongoose();

            // Chercher l'utilisateur par PIN dans le nouveau model avec populate du role
            const userWithPin = await User.findOne({ pin: credentials.password })
              .populate('role')
              .lean();

            if (userWithPin) {
              console.log('✅ User found by PIN:', userWithPin.email);

              // Vérifier que le role est bien populé
              const role = userWithPin.role as any;
              if (!role?.slug || !['dev', 'admin', 'staff'].includes(role.slug)) {
                console.log('❌ Invalid role for PIN user:', role?.slug);
                throw new Error('Accès non autorisé');
              }

              return {
                id: userWithPin._id.toString(),
                email: userWithPin.email,
                name: userWithPin.givenName || userWithPin.username || userWithPin.email.split('@')[0],
                role: role.slug,
              } as NextAuthUser;
            }

            console.log('❌ No user found with this PIN');
            throw new Error('PIN incorrect');
          }

          console.log('📡 Connecting to database...');
          const { db } = await connectToDatabase();

          console.log('🔍 Looking for user:', credentials.email);
          const usersCollection = db.collection<UserDocument>('users');
          const rolesCollection = db.collection<RoleDocument>('roles');

          const user = await usersCollection.findOne({ email: credentials.email });

          if (!user) {
            console.log('❌ User not found');
            throw new Error('Email ou mot de passe incorrect');
          }

          console.log('✅ User found:', user.email);
          console.log('🔑 Password from form:', credentials.password);
          console.log('🔑 Password hash from DB:', user.password);

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('🔐 Password comparison result:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Invalid password');
            throw new Error('Email ou mot de passe incorrect');
          }

          console.log('✅ Password valid');

          // Populate role
          const role = await rolesCollection.findOne({ _id: user.role });
          if (!role) {
            console.log('❌ Role not found for user');
            throw new Error('Rôle utilisateur invalide');
          }

          console.log('👤 User role found:', role.slug);

          // Check if user has valid admin role
          if (!['dev', 'admin', 'staff'].includes(role.slug)) {
            console.log('❌ Invalid role:', role.slug);
            throw new Error('Accès non autorisé');
          }

          console.log('✅ Role valid:', role.slug);

          // Retourner l'objet utilisateur avec les champs requis par NextAuth
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.givenName || user.username || user.email.split('@')[0],
            role: role.slug,
          } as NextAuthUser;
        } catch (error) {
          console.error('❌ Authorization error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role ?? undefined;
        session.user.id = token.id ?? '';
        session.user.name = token.name ?? null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Préserver l'hôte d'origine pour supporter mobile/IP réseau
      // Extraire l'hôte de l'URL de callback
      try {
        const callbackUrl = new URL(url);
        const baseUrlObj = new URL(baseUrl);

        // Si l'URL commence par baseUrl, c'est une redirection interne
        if (url.startsWith(baseUrl)) {
          return url;
        }

        // Si l'URL a le même protocole et port que baseUrl
        // mais un hôte différent (ex: IP réseau vs localhost)
        // préserver l'hôte de l'URL de callback
        if (callbackUrl.protocol === baseUrlObj.protocol &&
            callbackUrl.port === baseUrlObj.port) {
          return callbackUrl.origin + '/admin';
        }
      } catch (e) {
        // Si parsing échoue, fallback sur baseUrl
      }

      // Sinon, rediriger vers la racine
      return baseUrl + '/admin';
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token.admin',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        // Autoriser les cookies non-sécurisés en développement HTTP
        // mais exiger HTTPS en production ou si configuré
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? process.env.NODE_ENV === 'production',
      },
    },
  },
};
