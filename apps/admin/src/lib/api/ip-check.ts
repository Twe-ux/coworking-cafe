import { NextRequest, NextResponse } from 'next/server';

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
 * Vérifier l'accès IP pour une API
 * Retourne null si accès autorisé, NextResponse si refusé
 */
export function checkAPIIPAccess(request: NextRequest): NextResponse | null {
  // Récupérer IPs autorisées depuis env
  const allowedIPsString = process.env.ALLOWED_STAFF_IPS || '';

  // Si vide, désactiver la protection IP (mode dev ou config non définie)
  if (!allowedIPsString) {
    console.warn('[API IP CHECK] ALLOWED_STAFF_IPS non défini - Protection IP désactivée');
    return null; // Accès autorisé
  }

  const allowedIPs = allowedIPsString.split(',').map((ip) => ip.trim()).filter(Boolean);

  // Récupérer IP du client
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = forwardedFor?.split(',')[0].trim() || realIP || 'unknown';

  // Vérifier si IP autorisée
  if (isIPAllowed(clientIP, allowedIPs)) {
    console.log(`[API IP CHECK] ✅ IP autorisée: ${clientIP}`);
    return null; // Accès autorisé
  }

  // IP non autorisée
  console.warn(`[API IP CHECK] ❌ IP refusée: ${clientIP} (IPs autorisées: ${allowedIPs.join(', ')})`);

  return NextResponse.json(
    { success: false, error: 'Accès refusé - IP non autorisée' },
    { status: 403 }
  );
}
