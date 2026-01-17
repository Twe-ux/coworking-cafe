import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DrinksPageClient } from "./DrinksPageClient";

export const metadata = {
  title: "Menu - Boissons | Admin",
  description: "Gestion du menu boissons",
};

/**
 * Page de gestion du menu boissons
 * Accessible uniquement aux dev et admin
 */
export default async function DrinksPage() {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Vérifier les permissions (dev ou admin uniquement)
  if (!["dev", "admin"].includes(session.user.role?.name)) {
    redirect("/403");
  }

  return <DrinksPageClient />;
}
