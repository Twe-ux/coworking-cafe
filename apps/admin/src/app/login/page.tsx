import { PINLoginForm } from "@/components/pin-login-form";
import { headers } from "next/headers";
import { getClientIP, isIPAllowed } from "@/lib/security/ip-whitelist";

/**
 * Page de connexion avec vérification IP
 *
 * Comportement:
 * - ALLOWED_STAFF_IPS non défini → Email SEULEMENT (sécurité par défaut)
 * - ALLOWED_STAFF_IPS défini + IP autorisée → Email + PIN (toggle)
 * - ALLOWED_STAFF_IPS défini + IP NON autorisée → Email SEULEMENT
 */
export default async function LoginPage() {
  // Récupérer l'IP du client depuis les headers
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  const clientIP = forwardedFor?.split(',')[0].trim() || realIP || 'unknown';

  // Vérifier si la whitelist est configurée
  const allowedIPsString = process.env.ALLOWED_STAFF_IPS;

  // PIN mode visible UNIQUEMENT si :
  // 1. ALLOWED_STAFF_IPS est défini (pas vide)
  // 2. ET l'IP du client est dans la whitelist
  const allowPinMode =
    !!allowedIPsString &&
    allowedIPsString.trim() !== '' &&
    isIPAllowed(clientIP);

  console.log(`[LOGIN PAGE] IP: ${clientIP} | Whitelist configured: ${!!allowedIPsString} | PIN mode allowed: ${allowPinMode}`);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <PINLoginForm allowPinMode={allowPinMode} />
      </div>
    </div>
  );
}
