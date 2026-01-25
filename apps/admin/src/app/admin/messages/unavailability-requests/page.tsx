import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { UnavailabilityRequestsClient } from "./UnavailabilityRequestsClient";

export default async function UnavailabilityRequestsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role;
  if (!["dev", "admin"].includes(userRole || "")) {
    redirect("/403");
  }

  return <UnavailabilityRequestsClient />;
}
