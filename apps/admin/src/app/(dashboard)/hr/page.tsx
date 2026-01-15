"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, Clock, FileText, CalendarCheck2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEmployeesData } from "@/hooks/hr/useEmployeesData";
import { useDrafts } from "@/hooks/hr/useDrafts";
import { EmployeeList } from "@/components/hr/employees";
import { DraftCard } from "@/components/hr/employees/DraftCard";
import { EndContractModal } from "@/components/hr/modals/EndContractModal";
import { ContractGenerationModal } from "@/components/hr/contract/ContractGenerationModal";
import { AvailabilityCalendarTab } from "@/components/hr/availability/AvailabilityCalendarTab";
import type { Employee } from "@/types/hr";
import { toast } from "sonner";

/**
 * Page HR Management - Admin/Dev only
 * Onglets : Employés, Disponibilités, Planning, Pointage
 */
export default function HRManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role;

  const { employees, loading, error, fetchEmployees, archiveEmployee } =
    useEmployeesData();

  const {
    drafts,
    loading: draftsLoading,
    refetch: refetchDrafts,
  } = useDrafts();

  // États pour les modals
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [endContractModalOpen, setEndContractModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [contractEmployee, setContractEmployee] = useState<Employee | null>(
    null
  );

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
  const handleCreateNew = async () => {
    // Nettoyer localStorage et brouillon BD avant de créer un nouvel employé
    if (typeof window !== "undefined") {
      localStorage.removeItem("onboarding-draft");
      localStorage.removeItem("onboarding-draft-step");
    }

    try {
      await fetch("/api/hr/employees/draft", {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Erreur suppression brouillon:", err);
    }

    router.push("/hr/employees/new");
  };

  const handleEdit = (employee: Employee) => {
    router.push(`/hr/employees/${employee._id}/edit`);
  };

  const handleViewContract = (employee: Employee) => {
    setContractEmployee(employee);
    setContractModalOpen(true);
  };

  const handleEndContract = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEndContractModalOpen(true);
  };

  const handleEndContractConfirm = async (endDate: string, reason: string) => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(
        `/api/hr/employees/${selectedEmployee._id}/end-contract`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endDate, endContractReason: reason }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Succès", {
          description: "Contrat terminé avec succès",
        });
        fetchEmployees();
      } else {
        toast.error("Erreur", {
          description: data.error || "Impossible de terminer le contrat",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue",
      });
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

  const handleDeleteDraft = async (draftId: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce brouillon ?")) {
      try {
        await fetch("/api/hr/employees/draft", {
          method: "DELETE",
        });
        toast.success("Succès", {
          description: "Brouillon supprimé",
        });
        refetchDrafts();
      } catch (err) {
        toast.error("Erreur", {
          description: "Impossible de supprimer le brouillon",
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
            Gérez les employés, disponibilités, plannings et pointages
          </p>
        </div>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employés
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <CalendarCheck2 className="h-4 w-4" />
            Disponibilités
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          {/* Section Brouillons */}
          {drafts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Brouillons en cours ({drafts.length})
                </h2>
              </div>
              <div className="grid gap-3">
                {drafts.map((draft) => (
                  <DraftCard
                    key={draft._id}
                    draft={draft}
                    onDelete={() => handleDeleteDraft(draft._id)}
                  />
                ))}
              </div>
              <div className="border-t pt-6" />
            </div>
          )}

          {/* Liste des employés */}
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

        <TabsContent value="availability" className="space-y-4">
          <AvailabilityCalendarTab />
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

      <EndContractModal
        employee={selectedEmployee}
        open={endContractModalOpen}
        onClose={() => {
          setEndContractModalOpen(false);
          setSelectedEmployee(null);
        }}
        onConfirm={handleEndContractConfirm}
      />

      {contractEmployee && (
        <ContractGenerationModal
          employee={contractEmployee}
          open={contractModalOpen}
          onOpenChange={setContractModalOpen}
        />
      )}
    </div>
  );
}
