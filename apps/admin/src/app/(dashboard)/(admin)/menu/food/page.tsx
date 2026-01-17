import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { FoodPageClient } from "./FoodPageClient";

export const metadata = {
  title: "Menu - Nourriture | Admin",
  description: "Gestion du menu nourriture",
};

/**
 * Page de gestion du menu nourriture
 * Accessible uniquement aux dev et admin
 */
export default async function FoodPage() {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Vérifier les permissions (dev ou admin uniquement)
  if (!["dev", "admin"].includes(session.user.role?.name)) {
    redirect("/403");
  }

  return <FoodPageClient />;
}
