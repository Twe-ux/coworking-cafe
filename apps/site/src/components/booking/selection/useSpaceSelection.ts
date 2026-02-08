// ============================================================================
// USE SPACE SELECTION HOOK
// ============================================================================
// Hook pour gérer la récupération et conversion des prix des espaces
// Created: 2026-02-08
// ============================================================================

import { useEffect, useState } from "react";
import type {
  DisplaySpace,
  SpaceConfig,
  SPACE_TYPE_TO_SLUG,
  SPACE_DISPLAY_DATA,
} from "./types";
import {
  SPACE_TYPE_TO_SLUG as SLUG_MAP,
  SPACE_DISPLAY_DATA as DISPLAY_DATA,
} from "./types";

/**
 * Use Space Selection Hook
 * Gère le fetch des espaces et la conversion TTC/HT
 */
export function useSpaceSelection() {
  const [spaces, setSpaces] = useState<DisplaySpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTTC, setShowTTC] = useState(true);

  // Function to convert price string from TTC to HT or vice versa
  // Hourly = 10% VAT, Daily = 20% VAT
  const convertPrice = (priceString: string, toTTC: boolean): string => {
    if (priceString === "Sur devis") return priceString;

    // Extract the numeric price
    const match = priceString.match(/(\d+(?:\.\d+)?)€/);
    if (!match) return priceString;

    const price = parseFloat(match[1]);

    // Determine VAT rate based on whether it's hourly or daily
    const isHourly = priceString.includes("/h");
    const vatRate = isHourly ? 1.1 : 1.2; // 10% for hourly, 20% for daily

    const convertedPrice = toTTC ? price : (price / vatRate).toFixed(2);

    // Replace the price in the original string
    return priceString.replace(/\d+(?:\.\d+)?€/, `${convertedPrice}€`);
  };

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await fetch("/api/space-configurations");
        const data = await response.json();

        if (data.success) {
          const displaySpaces = data.data.map((config: SpaceConfig) => {
            const displayData = DISPLAY_DATA[config.spaceType] || {};
            const urlSlug = SLUG_MAP[config.spaceType] || config.slug;

            // Determine price display
            let hourlyPrice = "Sur devis";
            let dailyPrice = "Sur devis";
            let capacityText = "";

            if (!config.requiresQuote) {
              // Hourly price (store TTC values)
              if (config.pricing.hourly > 0) {
                hourlyPrice = `${config.pricing.hourly}€/h`;
              }

              // Daily price (store TTC values)
              if (config.pricing.daily > 0) {
                dailyPrice = `${config.pricing.daily}€/jour`;
              }
            }

            // Format capacity for bottom display
            if (config.minCapacity === config.maxCapacity) {
              capacityText = `${config.minCapacity} personne${
                config.minCapacity > 1 ? "s" : ""
              }`;
            } else if (config.maxCapacity > 50) {
              capacityText = `Jusqu'à ${config.maxCapacity} personnes`;
            } else {
              capacityText = `${config.minCapacity}-${config.maxCapacity} personnes`;
            }

            return {
              id: urlSlug,
              title: displayData.title || config.name,
              subtitle: displayData.subtitle || "",
              description: config.description || displayData.description || "",
              icon: displayData.icon || "bi-building",
              image: config.imageUrl || `/images/spaces/${config.slug}.jpg`,
              capacity: capacityText,
              features: config.features || [],
              priceFrom: hourlyPrice, // Kept for compatibility
              hourlyPrice,
              dailyPrice,
              requiresQuote: config.requiresQuote,
            };
          });

          setSpaces(displaySpaces);
        }
      } catch (error) {
        // Silent error - composant affichera liste vide
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, []);

  return {
    spaces,
    loading,
    showTTC,
    setShowTTC,
    convertPrice,
  };
}
