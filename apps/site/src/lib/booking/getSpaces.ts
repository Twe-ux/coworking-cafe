/**
 * Server-side function to fetch space configurations for booking page
 * Uses ISR (Incremental Static Regeneration) with 1-hour revalidation
 */

import { connectDB } from "@/lib/mongodb";
import { SpaceConfiguration } from "@coworking-cafe/database";
import type { DisplaySpace } from "@/components/booking/selection/types";
import {
  SPACE_TYPE_TO_SLUG as SLUG_MAP,
  SPACE_DISPLAY_DATA as DISPLAY_DATA,
} from "@/components/booking/selection/types";

/**
 * Fetch all space configurations from database
 * Server Component only - runs on server at build time + revalidation
 *
 * @returns Array of DisplaySpace objects for rendering
 */
export async function getSpaces(): Promise<DisplaySpace[]> {
  try {
    await connectDB();

    const configs = await SpaceConfiguration.find({}).lean();

    const displaySpaces: DisplaySpace[] = configs.map((config: any) => {
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
        capacityText = `${config.minCapacity} personne${config.minCapacity > 1 ? "s" : ""}`;
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

    return displaySpaces;
  } catch (error) {
    console.error("[getSpaces] Failed to fetch space configurations:", error);
    // Return empty array on error - page will still render
    return [];
  }
}
