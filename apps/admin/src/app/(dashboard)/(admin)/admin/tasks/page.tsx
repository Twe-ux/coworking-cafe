import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { TasksPageClient } from "./TasksPageClient";

/**
 * Page de gestion des tâches
 * Accessible uniquement aux dev, admin et staff
 */
export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (!userRole || !["dev", "admin", "staff"].includes(userRole)) {
    redirect("/403");
  }

  return <TasksPageClient userRole={userRole} />;
}
