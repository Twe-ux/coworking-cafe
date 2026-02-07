import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { ContactPageClient } from "./ContactPageClient";
import type { SessionUser } from "@/types/session";

/**
 * Page de gestion des messages de contact
 * Accessible uniquement aux dev/admin
 */
export default async function ContactPage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    !["dev", "admin"].includes((session.user as SessionUser).role)
  ) {
    redirect("/403");
  }

  return <ContactPageClient />;
}
