import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { B2BRevenuePageClient } from "./B2BRevenuePageClient";

export const metadata = {
  title: "CA B2B - Comptabilité",
  description: "Gestion du chiffre d'affaires B2B",
};

export default async function B2BRevenuePage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    !["dev", "admin"].includes((session.user as any).role)
  ) {
    redirect("/403");
  }

  return <B2BRevenuePageClient />;
}
