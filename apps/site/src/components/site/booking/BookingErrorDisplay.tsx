// ============================================================================
// BookingErrorDisplay Component
// ============================================================================
// Composant pour afficher les erreurs et messages dans le processus de booking
// ============================================================================

/**
 * Props du composant BookingErrorDisplay
 */
interface BookingErrorDisplayProps {
  error?: string;
  type?: "danger" | "warning" | "info";
  onDismiss?: () => void;
  className?: string;
}

/**
 * Composant d'affichage d'erreur pour le booking
 * Supporte différents types (danger, warning, info) et peut être fermé
 *
 * @param error - Message d'erreur à afficher
 * @param type - Type d'alerte (danger par défaut)
 * @param onDismiss - Callback appelé quand l'utilisateur ferme l'alerte
 * @param className - Classes CSS additionnelles
 *
 * @example
 * ```tsx
 * <BookingErrorDisplay
 *   error="La date sélectionnée n'est pas disponible"
 *   type="danger"
 *   onDismiss={() => setError("")}
 * />
 * ```
 */
export function BookingErrorDisplay({
  error,
  type = "danger",
  onDismiss,
  className = "",
}: BookingErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className={`alert alert-${type} ${onDismiss ? "alert-dismissible fade show" : ""} text-center ${className}`} role="alert">
      <i className={`bi ${getIconForType(type)} me-2`} />
      {error}
      {onDismiss && (
        <button
          type="button"
          className="btn-close"
          onClick={onDismiss}
          aria-label="Fermer"
        />
      )}
    </div>
  );
}

/**
 * Retourne l'icône Bootstrap appropriée selon le type d'alerte
 */
function getIconForType(type: "danger" | "warning" | "info"): string {
  switch (type) {
    case "danger":
      return "bi-exclamation-triangle-fill";
    case "warning":
      return "bi-exclamation-circle-fill";
    case "info":
      return "bi-info-circle-fill";
    default:
      return "bi-info-circle-fill";
  }
}
