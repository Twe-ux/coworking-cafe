"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEmployeesData } from "@/hooks/hr/useEmployeesData";
import { EmployeeList } from "@/components/hr/employees";
import type { Employee } from "@/types/hr";
import { toast } from "sonner";

/**
 * Page HR Management - Admin/Dev only
 * Onglets : Employés, Planning, Pointage
 */
export default function HRManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role;

  const {
    employees,
    loading,
    error,
    fetchEmployees,
    archiveEmployee,
  } = useEmployeesData();

  // États pour les modals (à implémenter)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Charger les employés au montage
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Rediriger staff vers leur vue dédiée
  useEffect(() => {
    if (userRole === "staff") {
      router.push("/staff/schedule");
    }
  }, [userRole, router]);

  // Afficher les erreurs
  useEffect(() => {
    if (error) {
      toast.error("Erreur", {
        description: error,
      });
    }
  }, [error]);

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

  // Handlers
  const handleCreateNew = () => {
    router.push("/hr/employees/new");
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    toast.info("À venir", {
      description: "Le formulaire d'édition sera disponible prochainement",
    });
  };

  const handleViewContract = (employee: Employee) => {
    toast.info("À venir", {
      description: "La visualisation du contrat sera disponible prochainement",
    });
  };

  const handleEndContract = async (employee: Employee) => {
    if (
      confirm(
        `Voulez-vous vraiment archiver ${employee.firstName} ${employee.lastName} ?\n\nCette action désactivera l'employé.`
      )
    ) {
      const result = await archiveEmployee(employee._id);
      if (result.success) {
        toast.success("Succès", {
          description: "Employé archivé avec succès",
        });
      }
    }
  };

  const handleDelete = async (employee: Employee) => {
    if (
      confirm(
        `Voulez-vous vraiment archiver ${employee.firstName} ${employee.lastName} ?`
      )
    ) {
      const result = await archiveEmployee(employee._id);
      if (result.success) {
        toast.success("Succès", {
          description: "Employé archivé avec succès",
        });
      }
    }
  };

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
          <EmployeeList
            employees={employees}
            loading={loading}
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onViewContract={handleViewContract}
            onEndContract={handleEndContract}
            onDelete={handleDelete}
          />
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
