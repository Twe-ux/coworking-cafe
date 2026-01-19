import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { DevToolsClient } from "./DevToolsClient";

export const metadata = {
  title: "Dev Tools | Admin",
  description: "Outils de développement et de débogage",
};

export default async function DevToolsPage() {
  const session = await getServerSession(authOptions);

  // Seulement accessible aux dev
  if (!session?.user || session.user.role !== "dev") {
    redirect("/forbidden");
  }

  return <DevToolsClient />;
}
