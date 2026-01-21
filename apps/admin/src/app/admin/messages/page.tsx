import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { MessagesIndexClient } from "./MessagesIndexClient";

export default async function MessagesIndexPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role;
  if (!["dev", "admin", "staff"].includes(userRole || "")) {
    redirect("/403");
  }

  return <MessagesIndexClient />;
}
