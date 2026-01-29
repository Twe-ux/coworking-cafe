import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

/**
 * Check if IP is local/allowed
 */
function isLocalIP(ip: string | null): boolean {
  if (!ip) return false

  // Liste des IPs locales autorisées
  const allowedIPs = [
    '127.0.0.1',
    '::1',
    'localhost',
    '::ffff:127.0.0.1',
  ]

  // Ajouter vos IPs locales spécifiques ici
  const customAllowedIPs = process.env.ALLOWED_STAFF_IPS?.split(',') || []
  const allAllowedIPs = [...allowedIPs, ...customAllowedIPs]

  // Vérifier si l'IP est dans la liste des IPs autorisées
  if (allAllowedIPs.includes(ip)) return true

  // Vérifier les plages IP locales
  const localRanges = [
    /^127\./,                    // 127.0.0.0/8
    /^10\./,                     // 10.0.0.0/8
    /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
    /^192\.168\./,               // 192.168.0.0/16
    /^::1$/,                     // IPv6 loopback
    /^fe80:/,                    // IPv6 link-local
  ]

  return localRanges.some(range => range.test(ip))
}

/**
 * Layout pour les routes staff
 * ⚠️ ACCÈS RESTREINT : Uniquement depuis poste fixe (IP locale)
 */
export default async function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 🔒 SÉCURITÉ : Vérifier que la requête vient d'une IP locale
  const headersList = headers()
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIP = headersList.get('x-real-ip')
  const clientIP = forwardedFor?.split(',')[0] || realIP || 'unknown'

  // Bloquer si l'IP n'est pas locale
  if (!isLocalIP(clientIP)) {
    console.warn(`[SECURITY] Staff route access denied for IP: ${clientIP}`)
    redirect('/403') // Rediriger vers page interdite
  }

  // Récupérer la session (sans forcer l'auth)
  const session = await getServerSession(authOptions)

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="w-full overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 pl-20 mt-5 md:pl-20">
            <DynamicBreadcrumb />
          </div>
        </header>
        <main className="flex-1 w-full pt-4 pr-0 md:pr-8 md:pl-24">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
