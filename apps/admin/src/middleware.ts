import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Vérifier si une IP est dans la liste autorisée
 * Supporte:
 * - IPs individuelles: 192.168.1.100
 * - Ranges CIDR: 192.168.1.0/24
 * - IPs locales: 127.0.0.1, ::1, localhost
 */
function isIPAllowed(clientIP: string, allowedIPs: string[]): boolean {
  // IPs locales toujours autorisées en dev
  const localIPs = ['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1'];
  if (localIPs.includes(clientIP)) {
    return true;
  }

  // Vérifier chaque IP/range autorisée
  for (const allowed of allowedIPs) {
    // IP exacte
    if (allowed === clientIP) {
      return true;
    }

    // CIDR range (ex: 192.168.1.0/24)
    if (allowed.includes('/')) {
      if (isIPInCIDR(clientIP, allowed)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Vérifier si une IP est dans un range CIDR
 * Ex: isIPInCIDR('192.168.1.50', '192.168.1.0/24') → true
 */
function isIPInCIDR(ip: string, cidr: string): boolean {
  try {
    const [range, bits] = cidr.split('/');
    const mask = ~(2 ** (32 - parseInt(bits)) - 1);

    const ipInt = ipToInt(ip);
    const rangeInt = ipToInt(range);

    return (ipInt & mask) === (rangeInt & mask);
  } catch {
    return false;
  }
}

/**
 * Convertir IP string en nombre
 */
function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
}

/**
 * Vérifier la protection IP pour les routes /(dashboard)
 */
async function checkIPAccess(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;

  // Routes /(dashboard) qui nécessitent vérification IP
  // Note: /(dashboard) est un route group, donc les URLs sont directes
  const isDashboardRoute =
    pathname === '/' ||
    pathname.startsWith('/planning') ||
    pathname.startsWith('/agenda') ||
    pathname.startsWith('/produits');

  // Si pas dans /(dashboard), pas de vérification IP
  if (!isDashboardRoute) {
    return null; // Continuer sans bloquer
  }

  // Exception: Admins/Dev peuvent accéder aux routes /(dashboard) sans vérification IP
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: 'next-auth.session-token.admin',
    });

    if (token?.role && ['dev', 'admin'].includes(token.role as string)) {
      console.log(`[IP CHECK] ✅ Admin/Dev bypass IP check: ${token.email} → ${pathname}`);
      return null; // Admins/Dev bypass IP check
    }
  } catch (error) {
    // Si erreur lors de la récupération du token, continuer avec vérification IP normale
    console.log('[IP CHECK] Unable to check token, continuing with IP verification');
  }

  // Récupérer IPs autorisées depuis env
  const allowedIPsString = process.env.ALLOWED_STAFF_IPS || '';

  // Si vide, désactiver la protection IP (mode dev ou config non définie)
  if (!allowedIPsString) {
    console.warn('[IP CHECK] ALLOWED_STAFF_IPS non défini - Protection IP désactivée pour /(dashboard)');
    return null; // Continuer sans bloquer
  }

  const allowedIPs = allowedIPsString.split(',').map((ip) => ip.trim()).filter(Boolean);

  // Récupérer IP du client
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const clientIP = forwardedFor?.split(',')[0].trim() || realIP || 'unknown';

  // Vérifier si IP autorisée
  if (isIPAllowed(clientIP, allowedIPs)) {
    console.log(`[IP CHECK] ✅ IP autorisée: ${clientIP} → ${pathname}`);
    return null; // Continuer sans bloquer
  }

  // IP non autorisée → Comportement différent selon PWA vs Web
  console.warn(`[IP CHECK] ❌ IP refusée: ${clientIP} → ${pathname} (IPs autorisées: ${allowedIPs.join(', ')})`);

  // Détecter si la requête vient d'une PWA
  const isPWA = req.headers.get('x-pwa-mode') === 'true';

  if (isPWA) {
    // PWA → Redirect vers /admin pour permettre login
    console.log('[IP CHECK] 📱 Mode PWA détecté → Redirect vers /admin');
    return NextResponse.redirect(new URL('/admin', req.url));
  } else {
    // Web → Bloquer avec 403 (sécurité par obscurité)
    console.log('[IP CHECK] 🌐 Mode Web → 403');
    return NextResponse.redirect(new URL('/403', req.url));
  }
}

/**
 * Middleware NextAuth avec vérification IP pour /(dashboard)
 */
export default withAuth(
  async function middleware(req) {
    const path = req.nextUrl.pathname;

    // 1️⃣ VÉRIFICATION IP pour /(dashboard)
    // Bloquer accès si IP non autorisée (sauf admins/dev)
    const ipCheckResult = await checkIPAccess(req);
    if (ipCheckResult) {
      return ipCheckResult; // Redirect vers /403
    }

    // 2️⃣ VÉRIFICATION AUTH pour /admin
    // Routes /admin nécessitent auth dev/admin (pas de vérification IP)
    const isAdminRoute = path.startsWith('/admin');

    if (isAdminRoute) {
      // Récupérer le token avec le bon nom de cookie
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: 'next-auth.session-token.admin',
      });

      // Vérifier rôle pour routes admin
      if (!token?.role || !['dev', 'admin'].includes(token.role as string)) {
        console.log('[MIDDLEWARE] Access denied to /admin:', {
          hasToken: !!token,
          role: token?.role,
          roleType: typeof token?.role,
        });
        return NextResponse.redirect(new URL('/login', req.url));
      }

      console.log('[MIDDLEWARE] Access granted to /admin:', {
        email: token.email,
        role: token.role,
      });
    }

    // 3️⃣ Routes /(dashboard) sont publiques (pas d'auth NextAuth requise)
    // Mais protégées par IP (vérifié ci-dessus)

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Routes /(dashboard) : pas d'auth requise (seulement IP)
        const isDashboardRoute =
          path === '/' ||
          path.startsWith('/planning') ||
          path.startsWith('/agenda') ||
          path.startsWith('/produits');

        if (isDashboardRoute) {
          return true; // Pas d'auth NextAuth requise
        }

        // Routes /admin : auth requise
        const isAdminRoute = path.startsWith('/admin');
        if (isAdminRoute) {
          return !!token; // Auth requise
        }

        // Autres routes (login, etc.)
        return true;
      },
    },
    pages: {
      signIn: '/login',
    },
    cookies: {
      sessionToken: {
        name: 'next-auth.session-token.admin',
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon|logo|images|icons|manifest|apple-touch-icon|web-app-manifest|sw.js).*)',
  ],
};
