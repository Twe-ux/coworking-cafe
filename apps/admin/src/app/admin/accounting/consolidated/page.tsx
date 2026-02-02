import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { ConsolidatedPageClient } from "./ConsolidatedPageClient";

export const metadata = {
  title: "Vue Consolidée - Comptabilité",
  description: "Chiffre d'affaires consolidé (Caisse + B2B)",
};

export default async function ConsolidatedPage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    !["dev", "admin"].includes((session.user as any).role)
  ) {
    redirect("/403");
  }

  return <ConsolidatedPageClient />;
}
