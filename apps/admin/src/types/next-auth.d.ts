import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extend the built-in User type
   * Used in authorize() callback and returned to callbacks
   */
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
  }

  /**
   * Extend the built-in Session type
   * This is what getServerSession() returns
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the built-in JWT type
   * Used in jwt() and session() callbacks
   */
  interface JWT {
    id: string;
    name?: string;
    role: string;
  }
}
