import { NextAuthOptions } from 'next-auth';
import type { User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { connectMongoose } from '@/lib/mongodb';
import { User } from '@coworking-cafe/database';
import mongoose from 'mongoose';
import '@/models/employee';

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

interface AdminDocument {
  _id: ObjectId;
  email: string;
  password: string;
  givenName?: string;
  role: 'dev' | 'admin' | 'staff';
  dashboardPin?: string; // Hashed PIN for dashboard login
  employeeId?: ObjectId | null;
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
          console.log('🔐 Authorization attempt:', credentials?.email || 'PIN-only');

          if (!credentials?.password) {
            console.log('❌ Missing password/PIN');
            throw new Error('PIN ou mot de passe requis');
          }

          // Vérifier si c'est un PIN (6 chiffres uniquement)
          const isPIN = /^\d{6}$/.test(credentials.password);

          // ===== AUTHENTIFICATION PAR PIN 6 CHIFFRES (sans email) =====
          if (isPIN && !credentials.email) {
            console.log('🔑 PIN authentication (6 digits, no email)');

            // 1️⃣ Chercher d'abord dans la collection admins
            const { db } = await connectToDatabase();
            const adminsCollection = db.collection<AdminDocument>('admins');

            const admins = await adminsCollection.find({
              dashboardPin: { $exists: true }
            }).toArray();

            console.log(`🔍 Found ${admins.length} admins with PIN`);

            // Comparer le PIN avec le dashboardPin de chaque admin
            let matchedAdmin = null;
            for (const admin of admins) {
              if (admin.dashboardPin) {
                const isPinValid = await bcrypt.compare(credentials.password, admin.dashboardPin);
                if (isPinValid) {
                  matchedAdmin = admin;
                  break;
                }
              }
            }

            if (matchedAdmin) {
              console.log('✅ Admin found with PIN:', matchedAdmin.email);
              return {
                id: matchedAdmin._id.toString(),
                email: matchedAdmin.email,
                name: matchedAdmin.givenName || matchedAdmin.email.split('@')[0],
                role: matchedAdmin.role,
              } as NextAuthUser;
            }

            // 2️⃣ Si pas d'admin trouvé, chercher dans employees
            console.log('🔍 No admin found, checking employees...');
            await connectMongoose();

            const Employee = mongoose.model('Employee');

            // Chercher tous les employés qui pourraient avoir ce PIN
            const employees = await Employee.find({
              isActive: true,
              employeeRole: { $in: ['Manager', 'Assistant manager'] }, // Seuls ceux-ci ont dashboardPin
            }).lean();

            console.log(`🔍 Found ${employees.length} potential employees`);

            // Comparer le PIN avec le dashboardPinHash de chaque employé
            let matchedEmployee = null;
            for (const emp of employees) {
              if (emp.dashboardPinHash) {
                const isPinValid = await bcrypt.compare(credentials.password, emp.dashboardPinHash);
                if (isPinValid) {
                  matchedEmployee = emp;
                  break;
                }
              }
            }

            if (!matchedEmployee) {
              console.log('❌ No employee found with this PIN');
              throw new Error('PIN incorrect');
            }

            console.log('✅ Employee found:', matchedEmployee.email);

            // Déterminer le rôle système selon employeeRole
            let systemRole: 'dev' | 'admin' | 'staff' = 'staff';
            if (matchedEmployee.employeeRole === 'Manager') {
              systemRole = 'admin'; // Manager → admin access
            } else if (matchedEmployee.employeeRole === 'Assistant manager') {
              systemRole = 'admin'; // Assistant manager → admin access
            } else {
              systemRole = 'staff'; // Employé polyvalent → staff access
            }

            console.log('✅ Employee PIN authentication successful, role:', systemRole);

            return {
              id: (matchedEmployee._id as any).toString(),
              email: matchedEmployee.email,
              name: `${matchedEmployee.firstName} ${matchedEmployee.lastName}`,
              role: systemRole,
            } as NextAuthUser;
          }

          // ===== AUTHENTIFICATION EMAIL + PIN DÉSACTIVÉE =====
          // Mode désactivé pour sécurité : seule la collection "admins" est autorisée
          // Si besoin d'activer, déplacer ce bloc APRÈS la vérification "admins"
          // pour que "admins" soit prioritaire sur "users"
          /*
          if (isPIN && credentials.email) {
            console.log('🔑 User PIN authentication (6 digits with email)');
            await connectMongoose();

            // Chercher l'utilisateur par email
            const user = await User.findOne({ email: credentials.email.toLowerCase() })
              .populate('role')
              .lean();

            if (!user) {
              console.log('❌ User not found:', credentials.email);
              throw new Error('Email ou PIN incorrect');
            }

            console.log('✅ User found:', user.email);

            // Vérifier le PIN en comparant avec le hash du password
            const isPinValid = await bcrypt.compare(credentials.password, user.password);

            if (!isPinValid) {
              console.log('❌ PIN incorrect for user:', user.email);
              throw new Error('Email ou PIN incorrect');
            }

            console.log('✅ PIN correct');

            // Vérifier que le role est bien populé
            const role = user.role as any;
            if (!role?.slug || !['dev', 'admin', 'staff', 'client'].includes(role.slug)) {
              console.log('❌ Invalid role for user:', role?.slug);
              throw new Error('Accès non autorisé');
            }

            console.log('✅ Authentication successful, role:', role.slug);

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.givenName || user.username || user.email.split('@')[0],
              role: role.slug,
            } as NextAuthUser;
          }
          */

          // ===== AUTHENTIFICATION EMAIL + PASSWORD (admin app) =====
          if (!credentials.email) {
            console.log('❌ Email requis pour authentification par password');
            throw new Error('Email et mot de passe requis');
          }

          console.log('📡 Password authentication with email:', credentials.email);
          const { db } = await connectToDatabase();

          console.log('🔍 Looking for admin:', credentials.email);
          const adminsCollection = db.collection<AdminDocument>('admins');

          const admin = await adminsCollection.findOne({
            email: credentials.email.toLowerCase()
          });

          if (!admin) {
            console.log('❌ Admin not found');
            throw new Error('Email ou mot de passe incorrect');
          }

          console.log('✅ Admin found:', admin.email);

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );

          console.log('🔐 Password comparison result:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Invalid password');
            throw new Error('Email ou mot de passe incorrect');
          }

          console.log('✅ Password valid');

          // Vérifier le rôle (string direct)
          console.log('👤 Admin role:', admin.role);

          if (!['dev', 'admin', 'staff'].includes(admin.role)) {
            console.log('❌ Invalid role:', admin.role);
            throw new Error('Accès non autorisé');
          }

          console.log('✅ Role valid:', admin.role);

          // Retourner l'objet utilisateur avec les champs requis par NextAuth
          return {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.givenName || admin.email.split('@')[0],
            role: admin.role,
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
        // Extraire le slug du role (string) au lieu de l'objet complet
        // user.role peut être une string ou un objet { slug: 'admin', ... }
        const roleValue = typeof user.role === 'string'
          ? user.role
          : (user.role as any)?.slug || 'staff';

        token.role = roleValue;
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
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
