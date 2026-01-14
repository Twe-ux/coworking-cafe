"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Page HR Management - Admin/Dev only
 * Onglets : Employés, Planning, Pointage
 */
export default function HRManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role;

  // Rediriger staff vers leur vue dédiée
  useEffect(() => {
    if (userRole === "staff") {
      router.push("/staff/schedule");
    }
  }, [userRole, router]);

  // Loading state
  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion RH</h1>
          <p className="text-muted-foreground">
            Gérez les employés, plannings et pointages
          </p>
        </div>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employés
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Planning
          </TabsTrigger>
          <TabsTrigger value="clocking" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pointage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Module Employés en cours de migration...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Module Planning en cours de migration...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="clocking" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Module Pointage en cours de migration...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
