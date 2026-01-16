import Link from 'next/link'
import { LogIn, UserX, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Page 401 - Unauthorized
 *
 * Affichée quand l'utilisateur n'est pas authentifié
 * Design fun avec thème connexion
 */
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Animation utilisateur */}
        <div className="mb-8 relative">
          <div className="inline-block">
            <UserX className="w-32 h-32 text-blue-600 animate-pulse" strokeWidth={1.5} />
          </div>
          <div className="absolute top-0 right-0 -mr-4 -mt-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl animate-bounce">
              !
            </div>
          </div>
        </div>

        {/* Titre avec emoji */}
        <h1 className="text-9xl font-black text-blue-600 mb-4">
          401
        </h1>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Connexion Requise 🔐
        </h2>

        <p className="text-lg text-gray-600 mb-4 max-w-md mx-auto">
          Vous devez être connecté pour accéder à cette partie du coworking !
        </p>

        <p className="text-base text-gray-500 mb-8 max-w-md mx-auto italic">
          Comme dans un vrai coworking, il faut d'abord montrer votre badge
          avant d'entrer dans l'espace de travail 🏢
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/login">
              <LogIn className="w-5 h-5" />
              Se connecter
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <Home className="w-5 h-5" />
              Page d'accueil
            </Link>
          </Button>
        </div>

        {/* Info box */}
        <div className="mt-12 p-6 bg-white/50 rounded-lg border border-blue-200 max-w-md mx-auto">
          <h3 className="font-semibold text-gray-800 mb-2">
            📋 Première visite ?
          </h3>
          <p className="text-sm text-gray-600">
            Utilisez vos identifiants pour accéder au dashboard admin.
            Si vous n'avez pas encore de compte, contactez l'administrateur du système.
          </p>
        </div>

        {/* Message fun */}
        <div className="mt-8 text-xs text-gray-400">
          💡 Astuce : Un bon café aide toujours à se souvenir de son mot de passe ! ☕
        </div>
      </div>
    </div>
  )
}
