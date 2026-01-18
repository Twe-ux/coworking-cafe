import { RecipesPageClient } from "./RecipesPageClient";

export const metadata = {
  title: "Recettes | Staff",
  description: "Recettes et instructions de préparation du menu",
};

/**
 * Page de consultation des recettes
 * Public - Accessible sans authentification (page staff)
 */
export default function RecipesPage() {
  return <RecipesPageClient />;
}
