import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const handler = NextAuth(authOptions);

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export { handler as GET, handler as POST };
