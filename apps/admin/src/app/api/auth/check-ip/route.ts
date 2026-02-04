import { NextRequest, NextResponse } from 'next/server';

/**
 * Vérifier si une IP est dans la liste autorisée
 */
function isIPAllowed(clientIP: string, allowedIPs: string[]): boolean {
  // IPs locales toujours autorisées en dev
  const localIPs = ['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1'];
  if (localIPs.includes(clientIP)) {
    return true;
  }

  // Vérifier chaque IP autorisée
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
 * GET /api/auth/check-ip - Vérifier si l'IP actuelle est autorisée
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer IPs autorisées depuis env
    const allowedIPsString = process.env.ALLOWED_STAFF_IPS || '';

    // Si vide, considérer que toutes les IPs sont autorisées (mode dev)
    if (!allowedIPsString) {
      return NextResponse.json({
        success: true,
        isAllowed: true,
        clientIP: 'localhost',
        message: 'Mode dev - Protection IP désactivée',
      });
    }

    const allowedIPs = allowedIPsString
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean);

    // Récupérer IP du client
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = forwardedFor?.split(',')[0].trim() || realIP || 'unknown';

    // Vérifier si IP autorisée
    const isAllowed = isIPAllowed(clientIP, allowedIPs);

    return NextResponse.json({
      success: true,
      isAllowed,
      clientIP,
    });
  } catch (error) {
    console.error('Error checking IP:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la vérification de l\'IP',
      },
      { status: 500 }
    );
  }
}
