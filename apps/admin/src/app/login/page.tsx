import { PINLoginForm } from "@/components/pin-login-form";
import { headers } from "next/headers";
import { getClientIP, isIPAllowed } from "@/lib/security/ip-whitelist";

/**
 * Page de connexion avec vérification IP
 *
 * Comportement:
 * - IP autorisée → Affiche Email + PIN (toggle)
 * - IP non autorisée → Affiche SEULEMENT Email (sécurité)
 */
export default async function LoginPage() {
  // Récupérer l'IP du client depuis les headers
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  const clientIP = forwardedFor?.split(',')[0].trim() || realIP || 'unknown';

  // Vérifier si l'IP est dans la whitelist
  const allowPinMode = isIPAllowed(clientIP);

  console.log(`[LOGIN PAGE] IP: ${clientIP} | PIN mode allowed: ${allowPinMode}`);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <PINLoginForm allowPinMode={allowPinMode} />
      </div>
    </div>
  );
}
