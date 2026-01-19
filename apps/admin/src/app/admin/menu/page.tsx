import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { MenuPageClient } from "./MenuPageClient";

export const metadata = {
  title: "Menu | Admin",
  description: "Gestion du menu - Catégories et items",
};

export default async function MenuPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !["dev", "admin", "staff"].includes(session.user.role || "")) {
    redirect("/forbidden");
  }

  return <MenuPageClient />;
}
