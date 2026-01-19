import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { ProduitsPageClient } from "./ProduitsPageClient";

export const metadata = {
  title: "Produits | Admin",
  description: "Gestion des produits - Catégories et items",
};

export default async function ProduitsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !["dev", "admin", "staff"].includes(session.user.role || "")) {
    redirect("/forbidden");
  }

  return <ProduitsPageClient />;
}
