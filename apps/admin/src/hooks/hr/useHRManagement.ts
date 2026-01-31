import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDrafts } from "./useDrafts";
import { useEmployeesData } from "./useEmployeesData";
import type { Employee } from "@/types/hr";

/**
 * Hook pour gérer la logique de la page HR Management
 *
 * Contient:
 * - Gestion des employés (CRUD)
 * - Gestion des brouillons
 * - Gestion des modals (end contract, contract generation)
 * - Navigation entre onglets
 * - Redirections selon rôle
 */
export function useHRManagement() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userRole = session?.user?.role;
  const activeTab = searchParams.get("tab") || "employees";

  // Données employés
  const {
    employees: allEmployees,
    loading,
    error,
    fetchEmployees,
    archiveEmployee,
  } = useEmployeesData();

  // Données brouillons
  const {
    drafts,
    loading: draftsLoading,
    refetch: refetchDrafts,
  } = useDrafts();

  // États pour les modals
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [endContractModalOpen, setEndContractModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [contractEmployee, setContractEmployee] = useState<Employee | null>(null);

  // Filtrer pour exclure l'employé dev
  const isDevEmployee = (emp: Employee) => {
    return (
      emp.email.toLowerCase().includes("dev@") ||
      emp.email === "dev@coworkingcafe.com"
    );
  };

  // Tous les employés (exclure dev uniquement)
  const employees = allEmployees.filter((emp) => !isDevEmployee(emp));

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

  // === HANDLERS ===

  /**
   * Créer un nouvel employé
   * Nettoie le brouillon existant avant de rediriger
   */
  const handleCreateNew = async () => {
    // Nettoyer localStorage et brouillon BD
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

    router.push("/admin/hr/employees/new");
  };

  /**
   * Éditer un employé existant
   */
  const handleEdit = (employee: Employee) => {
    router.push(`/admin/hr/employees/${employee._id}/edit`);
  };

  /**
   * Voir/Générer le contrat d'un employé
   */
  const handleViewContract = async (employee: Employee) => {
    try {
      // Charger l'employé complet avec tous les détails
      const response = await fetch(`/api/hr/employees/${employee._id}`);
      const result = await response.json();

      if (result.success && result.data) {
        setContractEmployee(result.data);
        setContractModalOpen(true);
      } else {
        toast.error("Erreur", {
          description: "Impossible de charger les détails de l'employé",
        });
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue",
      });
    }
  };

  /**
   * Ouvrir la modal de fin de contrat
   */
  const handleEndContract = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEndContractModalOpen(true);
  };

  /**
   * Confirmer la fin de contrat
   */
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
        setEndContractModalOpen(false);
        setSelectedEmployee(null);
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

  /**
   * Archiver un employé
   */
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

  /**
   * Supprimer un brouillon
   */
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

  /**
   * Changer d'onglet (employees / availability)
   */
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`/admin/hr/employees?${params.toString()}`);
  };

  /**
   * Fermer la modal de fin de contrat
   */
  const handleCloseEndContractModal = () => {
    setEndContractModalOpen(false);
    setSelectedEmployee(null);
  };

  return {
    // Data
    session,
    activeTab,
    employees,
    drafts,
    loading,
    draftsLoading,

    // Modal states
    selectedEmployee,
    endContractModalOpen,
    contractModalOpen,
    contractEmployee,

    // Actions - Employee
    handleCreateNew,
    handleEdit,
    handleViewContract,
    handleEndContract,
    handleDelete,

    // Actions - Draft
    handleDeleteDraft,

    // Actions - Modal
    handleEndContractConfirm,
    handleCloseEndContractModal,
    setContractModalOpen,

    // Actions - Navigation
    handleTabChange,
  };
}
