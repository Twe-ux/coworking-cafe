'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Page Error - Erreur générale
 *
 * Affichée quand une erreur inattendue se produit
 * Design fun avec thème café renversé
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log l'erreur pour le debugging
    console.error('Error page:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Animation de café renversé */}
        <div className="mb-8 relative">
          <div className="inline-block">
            <AlertTriangle className="w-32 h-32 text-purple-600 animate-pulse" strokeWidth={1.5} />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Titre avec emoji */}
        <h1 className="text-7xl font-black text-purple-600 mb-4">
          Oups !
        </h1>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Une erreur s'est produite ☕💥
        </h2>

        <p className="text-lg text-gray-600 mb-4 max-w-md mx-auto">
          On dirait qu'on a renversé le café sur le serveur...
          Pas de panique, ça arrive même aux meilleurs ! 😅
        </p>

        {/* Message d'erreur (dev mode) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-white/50 rounded-lg border border-purple-200 text-left max-w-md mx-auto">
            <p className="text-xs font-mono text-gray-700 break-all">
              <strong>Erreur :</strong> {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-gray-500 mt-2">
                <strong>Digest :</strong> {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button onClick={reset} size="lg" className="gap-2">
            <RefreshCcw className="w-5 h-5" />
            Réessayer
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>

        {/* Messages fun */}
        <div className="mt-12 space-y-4">
          <div className="text-sm text-gray-500 italic">
            💡 "Il n'y a pas de bugs, seulement des fonctionnalités inattendues !"
            <br />
            <span className="text-xs">- Développeur anonyme après son 5ème café</span>
          </div>

          <div className="text-xs text-gray-400">
            Si le problème persiste, contactez l'équipe technique avec une tasse de café en main ☕
          </div>
        </div>
      </div>
    </div>
  )
}
