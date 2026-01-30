import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
function checkIPAccess(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;

  // Routes /(dashboard) qui nécessitent vérification IP
  // Note: /(dashboard) est un route group, donc les URLs sont directes
  const isDashboardRoute =
    pathname === '/' ||
    pathname.startsWith('/clocking') ||
    pathname.startsWith('/my-schedule') ||
    pathname.startsWith('/produits');

  // Si pas dans /(dashboard), pas de vérification IP
  if (!isDashboardRoute) {
    return null; // Continuer sans bloquer
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
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1️⃣ VÉRIFICATION IP pour /(dashboard)
    // Bloquer accès si IP non autorisée
    const ipCheckResult = checkIPAccess(req);
    if (ipCheckResult) {
      return ipCheckResult; // Redirect vers /403
    }

    // 2️⃣ VÉRIFICATION AUTH pour /admin
    // Routes /admin nécessitent auth dev/admin (pas de vérification IP)
    const isAdminRoute = path.startsWith('/admin');

    if (isAdminRoute) {
      // Vérifier rôle pour routes admin
      if (!token?.role || !['dev', 'admin'].includes(token.role)) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
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
          path.startsWith('/clocking') ||
          path.startsWith('/my-schedule') ||
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
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon|logo|images|icons|manifest|apple-touch-icon|web-app-manifest|sw.js).*)',
  ],
};
