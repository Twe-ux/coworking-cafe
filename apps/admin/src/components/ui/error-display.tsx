import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

/**
 * Composant standardisé pour afficher les erreurs
 *
 * Remplace les affichages d'erreurs hétérogènes (text-red, console.log, etc.)
 * par un composant cohérent avec Alert de shadcn/ui.
 *
 * @param error - Message d'erreur à afficher
 * @param title - Titre optionnel (défaut: "Erreur")
 * @param onRetry - Fonction à appeler pour réessayer
 * @param variant - Type d'affichage (page complète, card, inline)
 */
interface ErrorDisplayProps {
  error: string | null
  title?: string
  onRetry?: () => void
  variant?: 'page' | 'card' | 'inline'
}

export function ErrorDisplay({
  error,
  title = 'Erreur',
  onRetry,
  variant = 'page',
}: ErrorDisplayProps) {
  // Si pas d'erreur, ne rien afficher
  if (!error) return null

  // Contenu de l'alerte
  const alertContent = (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">{error}</AlertDescription>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      )}
    </Alert>
  )

  // Variants d'affichage
  switch (variant) {
    case 'page':
      // Erreur pleine page avec padding
      return <div className="p-6">{alertContent}</div>

    case 'card':
      // Erreur dans un container
      return <div className="max-w-2xl mx-auto p-6">{alertContent}</div>

    case 'inline':
      // Erreur inline sans padding
      return alertContent

    default:
      return null
  }
}
