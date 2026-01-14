import NextAuth, { NextAuthOptions } from 'next-auth';
import type { User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

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
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
