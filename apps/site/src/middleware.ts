import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",

  // Static pages - legal and info
  "/CGU",
  "/confidentiality",
  "/mentions-legales",
  "/contact",

  // Promotional pages
  "/scan",
  "/promo",

  // Site pages
  "/concept",
  "/take-away",
  "/history",
  "/manifest",
  "/spaces",
  "/pricing",
  "/members-program",
  "/student-offers",

  "/boissons",
  // "/menu/boissons",
  // "/menu/food",

  "/blog",

  "/robots.txt",
  "/sitemap.xml",
];

// Public route patterns (dynamic routes)
const publicRoutePatterns = [
  /^\/promo\/[^\/]+$/, // /promo/[token]
  /^\/booking(\/.*)?$/, // /booking and all sub-routes
];

// Auth routes
const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Protected routes that require authentication but are accessible to all authenticated users
const protectedRoutes = ["/horaires"];

// Admin dashboard routes
const adminDashboardPattern = /^\/dashboard(\/.*)?$/;

// Client dashboard pattern (matches /{username}, /{username}/profile, etc.)
const clientDashboardPattern =
  /^\/[^\/]+(?:\/(?:profile|reservations|settings))?(?:\/.*)?$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get the session token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "next-auth.session-token.site", // Match the custom cookie name from auth-options
  });

  const isAuthenticated = !!token;
  const userRole = token?.role?.slug as
    | "dev"
    | "admin"
    | "staff"
    | "client"
    | undefined;
  const userId = token?.id as string | undefined;
  const username = token?.username as string | undefined;

  // 1. Public routes - allow everyone
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/promo/") ||
    publicRoutePatterns.some((pattern) => pattern.test(pathname));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 2. Protected routes - require authentication but accessible to all authenticated users
  if (
    protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(
          `/auth/login?callbackUrl=${encodeURIComponent(pathname)}`,
          req.url
        )
      );
    }
    return NextResponse.next();
  }

  // 3. Auth routes (login, register, etc.)
  if (authRoutes.includes(pathname)) {
    if (isAuthenticated) {
      // Redirect authenticated users based on their role
      if (userRole === "client" && userId) {
        return NextResponse.redirect(new URL(`/${userId}`, req.url));
      } else if (
        userRole === "dev" ||
        userRole === "admin" ||
        userRole === "staff"
      ) {
        // Redirect to admin app (external)
        return NextResponse.redirect(new URL("http://localhost:3001", req.url));
      }
    }
    // Not authenticated, allow access to auth pages
    return NextResponse.next();
  }

  // 4. Admin dashboard routes
  if (adminDashboardPattern.test(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(
          `/auth/login?callbackUrl=${encodeURIComponent(pathname)}`,
          req.url
        )
      );
    }

    // Check if user has admin/staff/dev role
    if (userRole === "client") {
      if (userId) {
        return NextResponse.redirect(new URL(`/${userId}`, req.url));
      }
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  }

  // 5. Client dashboard routes (/{username}/...)
  // Skip if it's a public route pattern (like /promo/[token])
  const isPublicPattern = publicRoutePatterns.some((pattern) =>
    pattern.test(pathname)
  );

  if (
    clientDashboardPattern.test(pathname) &&
    !publicRoutes.includes(pathname) &&
    !isPublicPattern &&
    isAuthenticated // Only treat as client dashboard if authenticated
  ) {
    // Extract user identifier from path (could be username or ID)
    const pathUserId = pathname.split("/")[1];

    // If it's a client, verify they can only access their own dashboard
    if (userRole === "client") {
      // Allow access if path matches either username or userId
      if (pathUserId !== username && pathUserId !== userId) {
        return NextResponse.redirect(new URL(`/${userId}`, req.url));
      }
    }

    // Admin/Staff/Dev can access any client dashboard
    return NextResponse.next();
  }

  // 6. Unknown routes - redirect to home for unauthenticated users
  // If we reach here, it's likely an unknown route
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 7. Default: allow access for authenticated users
  return NextResponse.next();
}

// Match ALL routes except static files (testing)
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (static images from public folder)
     * - icons (static icons from public folder)
     * - sw.js (service worker)
     * - manifest.webmanifest (PWA manifest)
     * - *.png, *.svg, *.ico (static assets)
     */
    "/((?!api|_next/static|_next/image|favicon|images|icons|sw\\.js|manifest\\.webmanifest|.*\\.(?:png|svg|ico)).*)",
  ],
};
