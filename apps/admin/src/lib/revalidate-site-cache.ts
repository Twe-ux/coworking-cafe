/**
 * Helper pour invalider le cache du site après modification dans l'admin
 *
 * Appelle l'API /api/revalidate du site pour forcer le rafraîchissement
 * des données côté site public
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

interface RevalidateOptions {
  tags: string[];
}

export async function revalidateSiteCache(options: RevalidateOptions): Promise<void> {
  try {
    const response = await fetch(`${SITE_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(REVALIDATE_SECRET && { "x-revalidate-secret": REVALIDATE_SECRET }),
      },
      body: JSON.stringify({ tags: options.tags }),
    });

    if (!response.ok) {
      console.error("Failed to revalidate site cache:", await response.text());
    } else {
      console.log("Site cache revalidated:", options.tags);
    }
  } catch (error) {
    console.error("Error revalidating site cache:", error);
    // Ne pas throw - l'invalidation du cache ne doit pas bloquer l'opération
  }
}

/**
 * Invalider le cache menu pour un type spécifique
 */
export async function revalidateMenuCache(type: "drink" | "food" | "grocery" | "goodies"): Promise<void> {
  await revalidateSiteCache({
    tags: ["menu", `menu-${type}`],
  });
}

/**
 * Invalider tout le cache menu (tous les types)
 */
export async function revalidateAllMenuCache(): Promise<void> {
  await revalidateSiteCache({
    tags: ["menu", "menu-drink", "menu-food", "menu-grocery", "menu-goodies"],
  });
}
