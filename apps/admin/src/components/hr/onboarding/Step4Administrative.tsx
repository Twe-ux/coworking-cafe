"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboardingContext } from "@/contexts/OnboardingContext";
import type { AdministrativeInfo } from "@/types/onboarding";
import { EMPLOYEE_COLORS } from "@/types/onboarding";
import { Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { ContractGenerationModal } from "@/components/hr/contract/ContractGenerationModal";
import type { Employee } from "@/types/hr";
import { toast } from "sonner";

export function Step4Administrative() {
  const { data, saveStep4, loading, error, mode } = useOnboardingContext();
  const router = useRouter();
  const [createdEmployee, setCreatedEmployee] = useState<Employee | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdministrativeInfo>({
    defaultValues: data.step4 || {
      clockingCode: "",
      color: EMPLOYEE_COLORS[0].value,
      dpaeCompleted: false,
      dpaeCompletedAt: "",
      medicalVisitCompleted: false,
      mutuelleCompleted: false,
      bankDetailsProvided: false,
      registerCompleted: false,
      contractSent: false,
    },
  });

  const selectedColor = watch("color");
  const dpaeCompleted = watch("dpaeCompleted");
  const dpaeCompletedAt = watch("dpaeCompletedAt");
  const medicalVisitCompleted = watch("medicalVisitCompleted");
  const mutuelleCompleted = watch("mutuelleCompleted");
  const bankDetailsProvided = watch("bankDetailsProvided");
  const registerCompleted = watch("registerCompleted");

  // Le bouton est activé uniquement si toutes les checkboxes sont cochées
  // ET que la date DPAE est renseignée
  const allAdminTasksCompleted =
    dpaeCompleted &&
    dpaeCompletedAt &&
    medicalVisitCompleted &&
    mutuelleCompleted &&
    bankDetailsProvided &&
    registerCompleted;

  const onSubmit = async (formData: AdministrativeInfo) => {
    const employee = await saveStep4(formData);
    if (employee) {
      if (mode === 'edit') {
        // En mode édition, rediriger vers /hr
        toast.success('Employé modifié avec succès');
        router.push('/hr');
      } else {
        // En mode création, ouvrir la modal de génération du contrat
        setCreatedEmployee(employee);
        setShowContractModal(true);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations administratives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Code de pointage */}
          <div className="space-y-2">
            <Label htmlFor="clockingCode">
              Code de pointage (PIN) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clockingCode"
              type="text"
              maxLength={4}
              placeholder="1234"
              {...register("clockingCode", {
                required: "Le code de pointage est requis",
                pattern: {
                  value: /^\d{4}$/,
                  message: "Le code doit contenir 4 chiffres",
                },
              })}
            />
            {errors.clockingCode && (
              <p className="text-sm text-destructive">
                {errors.clockingCode.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              4 chiffres pour le système de pointage
            </p>
          </div>

          {/* Sélecteur de couleur */}
          <div className="space-y-2">
            <Label>
              Couleur (calendrier) <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {EMPLOYEE_COLORS.map((colorOption) => {
                const isSelected = selectedColor === colorOption.value;

                return (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setValue("color", colorOption.value)}
                    className={`h-12 rounded-md border-2 transition-all relative group ${
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2 border-primary"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.name}
                  >
                    {isSelected && (
                      <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow-lg" />
                    )}
                    <span className="sr-only">{colorOption.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Sélectionnez une couleur pour identifier l'employé dans le
              planning
            </p>
          </div>

          {/* Checkboxes de suivi administratif */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold">
              Suivi administratif
            </Label>
            <p className="text-xs text-muted-foreground">
              Cochez les étapes administratives déjà complétées en dehors de ce
              wizard
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dpaeCompleted"
                    checked={watch("dpaeCompleted")}
                    onCheckedChange={(checked) => {
                      setValue("dpaeCompleted", checked as boolean);
                      // Réinitialiser la date si décochée
                      if (!checked) {
                        setValue("dpaeCompletedAt", "");
                      }
                    }}
                  />
                  <Label
                    htmlFor="dpaeCompleted"
                    className="font-normal cursor-pointer whitespace-nowrap"
                  >
                    DPAE effectuée le
                  </Label>
                </div>
                <Input
                  type="date"
                  className="w-40"
                  disabled={!dpaeCompleted}
                  {...register("dpaeCompletedAt", {
                    required: dpaeCompleted
                      ? "La date de DPAE est requise"
                      : false,
                  })}
                />
                {errors.dpaeCompletedAt && (
                  <p className="text-sm text-destructive">
                    {errors.dpaeCompletedAt.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medicalVisitCompleted"
                  checked={watch("medicalVisitCompleted")}
                  onCheckedChange={(checked) =>
                    setValue("medicalVisitCompleted", checked as boolean)
                  }
                />
                <Label
                  htmlFor="medicalVisitCompleted"
                  className="font-normal cursor-pointer"
                >
                  Visite médicale effectuée
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mutuelleCompleted"
                  checked={watch("mutuelleCompleted")}
                  onCheckedChange={(checked) =>
                    setValue("mutuelleCompleted", checked as boolean)
                  }
                />
                <Label
                  htmlFor="mutuelleCompleted"
                  className="font-normal cursor-pointer"
                >
                  Mutuelle souscrite
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bankDetailsProvided"
                  checked={watch("bankDetailsProvided")}
                  onCheckedChange={(checked) =>
                    setValue("bankDetailsProvided", checked as boolean)
                  }
                />
                <Label
                  htmlFor="bankDetailsProvided"
                  className="font-normal cursor-pointer"
                >
                  RIB Enregistré
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="registerCompleted"
                  checked={watch("registerCompleted")}
                  onCheckedChange={(checked) =>
                    setValue("registerCompleted", checked as boolean)
                  }
                />
                <Label
                  htmlFor="registerCompleted"
                  className="font-normal cursor-pointer"
                >
                  Registre du personnel complété
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {!allAdminTasksCompleted && (
          <Alert>
            <AlertDescription>
              Veuillez cocher toutes les étapes du suivi administratif avant de
              créer l'employé.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={loading || !allAdminTasksCompleted}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading
              ? (mode === 'edit' ? "Modification en cours..." : "Création en cours...")
              : (mode === 'edit' ? "Modifier l'employé" : "Créer l'employé")
            }
          </Button>
        </div>
      </div>

      {createdEmployee && (
        <ContractGenerationModal
          open={showContractModal}
          onOpenChange={setShowContractModal}
          employee={createdEmployee}
        />
      )}
    </form>
  );
}
