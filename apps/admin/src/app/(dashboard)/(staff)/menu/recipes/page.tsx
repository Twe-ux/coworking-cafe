import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { RecipesPageClient } from "./RecipesPageClient";

export const metadata = {
  title: "Recettes | Staff",
  description: "Recettes et instructions de préparation du menu",
};

/**
 * Page de consultation des recettes
 * Accessible aux dev, admin et staff
 */
export default async function RecipesPage() {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Vérifier les permissions (dev, admin ou staff)
  if (!["dev", "admin", "staff"].includes(session.user.role?.name)) {
    redirect("/403");
  }

  return <RecipesPageClient />;
}
