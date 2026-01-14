import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    username?: string;
    role: {
      id: string;
      slug: 'dev' | 'admin' | 'staff' | 'client';
      name: string;
      level: number;
    };
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      username?: string;
      role: {
        id: string;
        slug: 'dev' | 'admin' | 'staff' | 'client';
        name: string;
        level: number;
      };
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    username?: string;
    role: {
      id: string;
      slug: 'dev' | 'admin' | 'staff' | 'client';
      name: string;
      level: number;
    };
  }
}
