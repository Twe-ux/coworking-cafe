import { Skeleton } from '@/components/ui/skeleton'

/**
 * Composant standardisé pour les états de chargement
 *
 * Remplace les spinners custom par des Skeleton components
 * pour une UX cohérente dans toute l'app.
 *
 * @param variant - Type de layout à afficher
 * @param count - Nombre d'éléments à afficher (pour grids)
 */
interface LoadingSkeletonProps {
  variant?: 'page' | 'card' | 'table' | 'list'
  count?: number
}

export function LoadingSkeleton({ variant = 'page', count = 4 }: LoadingSkeletonProps) {
  switch (variant) {
    case 'page':
      // Layout page complet (header + grid)
      return (
        <div className="space-y-6 p-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(count)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      )

    case 'card':
      // Pour liste de cards
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {[...Array(count)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      )

    case 'table':
      // Pour tables
      return (
        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-full" />
          {[...Array(count)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )

    case 'list':
      // Pour listes simples
      return (
        <div className="space-y-3 p-6">
          {[...Array(count)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )

    default:
      return null
  }
}
