// ============================================================================
// useSpaceConfiguration Hook
// ============================================================================
// Hook personnalisé pour gérer le fetch de la configuration d'espace
// et des horaires globaux
// ============================================================================

import { useState, useEffect } from "react";
import type { SpaceConfiguration, GlobalHours } from "@/types/booking";

/**
 * Props du hook useSpaceConfiguration
 */
interface UseSpaceConfigurationProps {
  spaceType: string; // Type d'espace (valeur DB: open-space, salle-verriere, etc.)
}

/**
 * Return type du hook useSpaceConfiguration
 */
interface UseSpaceConfigurationReturn {
  spaceConfig: SpaceConfiguration | null;
  globalHours: GlobalHours | null;
  loading: boolean;
  error: string;
  requiresQuote: boolean; // True si l'espace nécessite un devis
}

/**
 * Hook personnalisé pour récupérer la configuration d'un espace
 * et les horaires globaux du coworking
 *
 * @param spaceType - Type d'espace (valeur DB)
 * @returns Configuration, horaires, loading et erreur
 *
 * @example
 * ```tsx
 * const { spaceConfig, globalHours, loading, error } = useSpaceConfiguration({
 *   spaceType: "salle-verriere"
 * });
 * ```
 */
export function useSpaceConfiguration({
  spaceType,
}: UseSpaceConfigurationProps): UseSpaceConfigurationReturn {
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfiguration | null>(null);
  const [globalHours, setGlobalHours] = useState<GlobalHours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch global hours (une seule fois au mount)
  useEffect(() => {
    const fetchGlobalHours = async () => {
      try {
        const response = await fetch("/api/global-hours");
        const data = await response.json();

        if (data.success && data.data) {
          setGlobalHours(data.data);
        } else {
          console.warn("Failed to load global hours:", data.error);
        }
      } catch (err) {
        console.error("Error fetching global hours:", err);
        // On ne set pas d'erreur bloquante pour les horaires
        // car ce n'est pas critique pour la réservation
      }
    };

    fetchGlobalHours();
  }, []); // Pas de dépendance, fetch une seule fois

  // Fetch space configuration (à chaque changement de spaceType)
  useEffect(() => {
    if (!spaceType) {
      setError("Type d'espace non spécifié");
      setLoading(false);
      return;
    }

    const fetchSpaceConfig = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/space-configurations/${spaceType}`);
        const data = await response.json();

        if (data.success && data.data) {
          setSpaceConfig(data.data);
        } else {
          setError(data.error || "Configuration de l'espace non disponible");
        }
      } catch (err) {
        console.error("Error fetching space configuration:", err);
        setError("Erreur lors du chargement de la configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchSpaceConfig();
  }, [spaceType]);

  return {
    spaceConfig,
    globalHours,
    loading,
    error,
    requiresQuote: spaceConfig?.requiresQuote || false,
  };
}
