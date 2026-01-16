import Link from 'next/link'
import { Coffee, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Page 404 - Not Found
 *
 * Affichée quand une route n'existe pas
 * Design fun avec thème café/coworking
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Animation de tasse de café */}
        <div className="mb-8 relative">
          <div className="inline-block animate-bounce">
            <Coffee className="w-32 h-32 text-amber-600" strokeWidth={1.5} />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75" />
          </div>
        </div>

        {/* Titre avec emoji */}
        <h1 className="text-9xl font-black text-amber-600 mb-4">
          404
        </h1>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Oups ! Cette page n'existe pas ☕
        </h2>

        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          On dirait que vous cherchez un espace qui n'existe pas dans notre coworking...
          Peut-être qu'un café vous aidera à retrouver votre chemin ? 😊
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
            <Link href="/hr/employees">
              <Search className="w-5 h-5" />
              Voir les employés
            </Link>
          </Button>
        </div>

        {/* Message fun */}
        <div className="mt-12 text-sm text-gray-500 italic">
          💡 Astuce : Pendant que vous êtes ici, pourquoi ne pas prendre une vraie pause café ?
        </div>
      </div>
    </div>
  )
}
