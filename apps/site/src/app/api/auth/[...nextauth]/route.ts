import NextAuth from "next-auth";
import { options } from "../../../../lib/auth-options";

// Force dynamic rendering - don't pre-render at build time
export const dynamic = "force-dynamic";

const handler = NextAuth(options);

export { handler as GET, handler as POST };
