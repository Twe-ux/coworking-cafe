import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if path is public (staff routes)
    const isPublicPath =
      path === '/' ||
      path === '/login' ||
      path.startsWith('/clocking') ||
      path.startsWith('/my-schedule') ||
      path.startsWith('/menu');

    if (isPublicPath) {
      return NextResponse.next();
    }

    // Check if user has valid role for protected routes (admin routes)
    if (!token?.role || !['dev', 'admin', 'staff'].includes(token.role)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Check if path is public (staff routes)
        const isPublicPath =
          path === '/' ||
          path.startsWith('/clocking') ||
          path.startsWith('/my-schedule') ||
          path.startsWith('/menu');

        if (isPublicPath) return true;

        // Require auth for admin routes
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon|logo|images|icons|manifest|apple-touch-icon|web-app-manifest|sw.js|login).*)',
  ],
};
