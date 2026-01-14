"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OnboardingWizard } from "@/components/hr/onboarding/OnboardingWizard";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import type { Employee } from "@/types/hr";
import { toast } from "sonner";

/**
 * Page d'édition d'un employé existant
 * Réutilise le wizard d'onboarding en mode édition
 */
export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`/api/hr/employees/${employeeId}`);
        const data = await response.json();

        if (data.success) {
          setEmployee(data.data);
        } else {
          toast.error("Erreur", {
            description: data.error || "Impossible de charger l'employé",
          });
          router.push("/hr");
        }
      } catch (error) {
        toast.error("Erreur", {
          description: "Une erreur est survenue",
        });
        router.push("/hr");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Modifier un employé
        </h1>
        <p className="text-muted-foreground">
          {employee.firstName} {employee.lastName}
        </p>
      </div>

      <OnboardingProvider initialEmployee={employee}>
        <OnboardingWizard mode="edit" employeeId={employeeId} />
      </OnboardingProvider>
    </div>
  );
}
