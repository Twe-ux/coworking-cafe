import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SupportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role;
  if (!["dev", "admin", "staff"].includes(userRole || "")) {
    redirect("/403");
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HelpCircle className="w-8 h-8" />
          Support Client
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestion des tickets de support et demandes d'assistance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module en Développement</CardTitle>
          <CardDescription>
            Le système de tickets de support sera bientôt disponible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ce module permettra de :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Créer et gérer des tickets de support</li>
            <li>Suivre l'état des demandes d'assistance</li>
            <li>Attribuer des tickets aux membres de l'équipe</li>
            <li>Historique complet des échanges</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
