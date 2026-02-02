import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { StatsPageClient } from "./StatsPageClient";

export const metadata = {
  title: "Statistiques Comparatives - Comptabilité",
  description: "Comparer le chiffre d'affaires entre deux périodes",
};

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    !["dev", "admin"].includes((session.user as any).role)
  ) {
    redirect("/403");
  }

  return <StatsPageClient />;
}
