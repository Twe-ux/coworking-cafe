import Link from 'next/link'
import { ShieldAlert, Home, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Page 403 - Forbidden
 *
 * Affichée quand l'utilisateur n'a pas les permissions nécessaires
 * Design fun avec thème sécurité/accès
 */
export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Animation de cadenas */}
        <div className="mb-8 relative">
          <div className="inline-block">
            <div className="relative">
              <ShieldAlert className="w-32 h-32 text-red-600 animate-pulse" strokeWidth={1.5} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Lock className="w-16 h-16 text-red-700 animate-bounce" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Titre avec emoji */}
        <h1 className="text-9xl font-black text-red-600 mb-4">
          403
        </h1>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Accès Refusé 🚫
        </h2>

        <p className="text-lg text-gray-600 mb-4 max-w-md mx-auto">
          Désolé, mais cette zone est réservée aux administrateurs du coworking.
        </p>

        <p className="text-base text-gray-500 mb-8 max-w-md mx-auto italic">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur ! 📧
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/my-schedule">
              Mon planning
            </Link>
          </Button>
        </div>

        {/* Message fun */}
        <div className="mt-12 p-4 bg-white/50 rounded-lg border border-red-200 max-w-md mx-auto">
          <p className="text-sm text-gray-600">
            <strong>💡 Le saviez-vous ?</strong>
            <br />
            Dans un coworking, tout le monde a sa place...
            mais certaines portes restent verrouillées pour une bonne raison ! 😉
          </p>
        </div>

        {/* Permissions nécessaires */}
        <div className="mt-8 text-xs text-gray-400">
          Cette page nécessite le rôle : <span className="font-mono bg-red-100 px-2 py-1 rounded text-red-700">admin</span> ou <span className="font-mono bg-red-100 px-2 py-1 rounded text-red-700">dev</span>
        </div>
      </div>
    </div>
  )
}
