"use client";

import { ContractGenerationModal } from "@/components/hr/contract/ContractGenerationModal";
import { StyledAlert } from "@/components/ui/styled-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOnboardingContext } from "@/contexts/OnboardingContext";
import type { Employee } from "@/types/hr";
import type { AdministrativeInfo } from "@/types/onboarding";
import { EMPLOYEE_COLORS } from "@/types/onboarding";
import { Check, FileText, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const MAX_DPAE_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function Step4Administrative() {
  const { data, saveStep4, loading, error, mode, employeeId } = useOnboardingContext();
  const router = useRouter();
  const [createdEmployee, setCreatedEmployee] = useState<Employee | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [usedColors, setUsedColors] = useState<string[]>([]);

  // DPAE PDF upload state
  const [dpaeFile, setDpaeFile] = useState<File | null>(null);
  const [dpaeFileBase64, setDpaeFileBase64] = useState<string | null>(null);
  const [dpaeFileError, setDpaeFileError] = useState<string | null>(null);
  const dpaeFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<AdministrativeInfo>({
    defaultValues: data.step4 || {
      clockingCode: "",
      color: EMPLOYEE_COLORS[0].value,
      dpaeCompleted: false,
      dpaeCompletedAt: "",
      dpaePdfFilename: "",
      dpaePdfBase64: "",
      medicalVisitCompleted: false,
      mutuelleCompleted: false,
      mutuelleWanted: undefined, // undefined = non renseigné
      bankDetailsProvided: false,
      registerCompleted: false,
      contractSent: false,
    },
  });

  // Update form when data.step4 becomes available (edit mode or draft loading)
  // Only reset once when data arrives, not on every change
  useEffect(() => {
    if (data.step4) {
      reset(data.step4);
    }
  }, [data.step4, reset]);

  // Fetch used colors from existing employees
  useEffect(() => {
    const fetchUsedColors = async () => {
      try {
        const response = await fetch("/api/hr/employees?status=active");
        const result = await response.json();
        if (result.success && result.data) {
          const colors = result.data
            .filter((emp: Employee) => emp._id !== employeeId) // Exclure l'employé en cours d'édition
            .map((emp: Employee) => emp.color)
            .filter(Boolean); // Filtrer les valeurs nulles/undefined
          setUsedColors(colors);

          // En mode création, sélectionner automatiquement la première couleur disponible
          if (mode === "create" && !data.step4?.color) {
            const firstAvailableColor = EMPLOYEE_COLORS.find(
              (colorOption) => !colors.includes(colorOption.value)
            );
            if (firstAvailableColor) {
              setValue("color", firstAvailableColor.value);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching used colors:", error);
      }
    };

    fetchUsedColors();
  }, [employeeId, mode, data.step4?.color, setValue]);

  const selectedColor = watch("color");
  const dpaeCompleted = watch("dpaeCompleted");
  const dpaeCompletedAt = watch("dpaeCompletedAt");
  const medicalVisitCompleted = watch("medicalVisitCompleted");
  const mutuelleCompleted = watch("mutuelleCompleted");
  const mutuelleWanted = watch("mutuelleWanted");
  const bankDetailsProvided = watch("bankDetailsProvided");
  const registerCompleted = watch("registerCompleted");

  // DPAE file handlers
  const resetDpaeFileState = useCallback(() => {
    setDpaeFile(null);
    setDpaeFileBase64(null);
    setDpaeFileError(null);
    setValue("dpaePdfFilename", "");
    setValue("dpaePdfBase64", "");
    if (dpaeFileInputRef.current) {
      dpaeFileInputRef.current.value = "";
    }
  }, [setValue]);

  const handleDpaeFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setDpaeFileError(null);

      if (!file) {
        resetDpaeFileState();
        return;
      }

      if (file.type !== "application/pdf") {
        setDpaeFileError("Seuls les fichiers PDF sont acceptés");
        resetDpaeFileState();
        return;
      }

      if (file.size > MAX_DPAE_FILE_SIZE) {
        setDpaeFileError("Le fichier ne doit pas dépasser 5 Mo");
        resetDpaeFileState();
        return;
      }

      setDpaeFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        setDpaeFileBase64(base64);
        setValue("dpaePdfFilename", file.name);
        setValue("dpaePdfBase64", base64);
      };
      reader.onerror = () => {
        setDpaeFileError("Erreur lors de la lecture du fichier");
        resetDpaeFileState();
      };
      reader.readAsDataURL(file);
    },
    [resetDpaeFileState, setValue]
  );

  // Le bouton est activé uniquement si toutes les checkboxes sont cochées
  // ET que la date DPAE est renseignée
  // ET que le fichier DPAE est uploadé
  // ET que le choix mutuelle est fait (checkbox cochée + OUI/NON sélectionné)
  const dpaePdfUploaded = watch("dpaePdfBase64");
  const allAdminTasksCompleted =
    dpaeCompleted &&
    dpaeCompletedAt &&
    dpaePdfUploaded && // Fichier DPAE obligatoire
    medicalVisitCompleted &&
    mutuelleCompleted &&
    mutuelleWanted !== undefined &&
    bankDetailsProvided &&
    registerCompleted;

  const onSubmit = async (formData: AdministrativeInfo) => {
    const employee = await saveStep4(formData);
    if (employee) {
      if (mode === "edit") {
        // En mode édition, rediriger vers /hr
        toast.success("Employé modifié avec succès");
        router.push("/admin/hr/employees");
      } else {
        // En mode création, ouvrir la modal de génération du contrat
        setCreatedEmployee(employee);
        setShowContractModal(true);
      }
    }
  };

  const handleContractModalClose = (open: boolean) => {
    setShowContractModal(open);
    // Rediriger vers la liste des employés quand on ferme la modal
    if (!open && mode === "create") {
      toast.success("Employé créé avec succès");
      router.push("/admin/hr/employees");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <StyledAlert variant="destructive">
          {error}
        </StyledAlert>
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
            <div className="grid grid-cols-4 gap-2">
              {EMPLOYEE_COLORS.map((colorOption) => {
                const isSelected = selectedColor === colorOption.value;
                const isUsed = usedColors.includes(colorOption.value);

                return (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() =>
                      !isUsed && setValue("color", colorOption.value)
                    }
                    disabled={isUsed}
                    className={`h-12 rounded-md border-2 transition-all relative group ${
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2 border-primary cursor-pointer"
                        : isUsed
                          ? "border-gray-300 opacity-40 cursor-default"
                          : "border-gray-300 hover:border-gray-400 cursor-pointer"
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                    title={
                      isUsed
                        ? `${colorOption.name} (déjà utilisée)`
                        : colorOption.name
                    }
                  >
                    {isSelected && (
                      <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow-lg" />
                    )}
                    {isUsed && !isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-0.5 bg-gray-600 rotate-45" />
                      </div>
                    )}
                    <span className="sr-only">{colorOption.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Sélectionnez une couleur pour identifier l'employé dans le
              planning. Les couleurs grisées sont déjà utilisées.
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
                      // Réinitialiser la date et le fichier si décochée
                      if (!checked) {
                        setValue("dpaeCompletedAt", "");
                        resetDpaeFileState();
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
                <div className="w-48">
                  <Controller
                    name="dpaeCompletedAt"
                    control={control}
                    rules={{
                      required: dpaeCompleted
                        ? "La date de DPAE est requise"
                        : false,
                    }}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        disabled={!dpaeCompleted}
                        placeholder="JJ/MM/AAAA"
                      />
                    )}
                  />
                  {errors.dpaeCompletedAt && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.dpaeCompletedAt.message}
                    </p>
                  )}
                </div>

                {/* PDF Upload - shown when DPAE is checked */}
                {dpaeCompleted && (
                  <div className="ml-7 space-y-2">
                    <Label className="text-sm font-medium">
                      Document DPAE (PDF) <span className="text-destructive">*</span>
                    </Label>
                    {dpaeFile || watch("dpaePdfFilename") ? (
                      <div className="flex items-center gap-3 rounded-md border border-gray-300 p-3">
                        <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {dpaeFile?.name || watch("dpaePdfFilename")}
                          </p>
                          {dpaeFile && (
                            <p className="text-xs text-muted-foreground">
                              {(dpaeFile.size / 1024).toFixed(0)} Ko
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={resetDpaeFileState}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => dpaeFileInputRef.current?.click()}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600"
                      >
                        <Upload className="h-4 w-4" />
                        Cliquer pour sélectionner le PDF de la DPAE
                      </button>
                    )}
                    <input
                      ref={dpaeFileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleDpaeFileChange}
                      className="hidden"
                    />
                    {dpaeFileError && (
                      <p className="text-sm text-destructive">{dpaeFileError}</p>
                    )}
                  </div>
                )}

                <a href="https://www.due.urssaf.fr/declarant/index.jsf">
                  Site Déclaration DPAE
                </a>
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

              {/* Mutuelle - Checkbox + Radio buttons */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mutuelleCompleted"
                      checked={watch("mutuelleCompleted")}
                      onCheckedChange={(checked) => {
                        setValue("mutuelleCompleted", checked as boolean);
                        // Réinitialiser le choix si décochée
                        if (!checked) {
                          setValue("mutuelleWanted", undefined);
                        }
                      }}
                    />
                    <Label
                      htmlFor="mutuelleCompleted"
                      className="font-normal cursor-pointer whitespace-nowrap"
                    >
                      Choix mutuelle effectué
                    </Label>
                  </div>
                  <Controller
                    name="mutuelleWanted"
                    control={control}
                    rules={{
                      validate: (value) =>
                        !mutuelleCompleted ||
                        value !== undefined ||
                        "Veuillez sélectionner une option",
                    }}
                    render={({ field }) => (
                      <RadioGroup
                        value={
                          field.value === undefined
                            ? undefined
                            : field.value
                              ? "yes"
                              : "no"
                        }
                        onValueChange={(value: string) => {
                          // Cocher automatiquement la checkbox quand on sélectionne OUI/NON
                          if (!mutuelleCompleted) {
                            setValue("mutuelleCompleted", true);
                          }
                          field.onChange(value === "yes");
                        }}
                        className="flex flex-row gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="mutuelle-no" />
                          <Label
                            htmlFor="mutuelle-no"
                            className="font-normal cursor-pointer"
                          >
                            Non
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="mutuelle-yes" />
                          <Label
                            htmlFor="mutuelle-yes"
                            className="font-normal cursor-pointer"
                          >
                            Oui
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>
                {errors.mutuelleWanted && (
                  <p className="text-sm text-destructive">
                    {errors.mutuelleWanted.message}
                  </p>
                )}
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
          <StyledAlert variant="info">
            {!dpaePdfUploaded
              ? "Veuillez uploader le document DPAE (PDF obligatoire) avant de créer l'employé."
              : "Veuillez cocher toutes les étapes du suivi administratif avant de créer l'employé."}
          </StyledAlert>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={loading || !allAdminTasksCompleted}
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading
              ? mode === "edit"
                ? "Modification en cours..."
                : "Création en cours..."
              : mode === "edit"
                ? "Modifier l'employé"
                : "Créer l'employé"}
          </Button>
        </div>
      </div>

      {createdEmployee && (
        <ContractGenerationModal
          open={showContractModal}
          onOpenChange={handleContractModalClose}
          employee={createdEmployee}
        />
      )}
    </form>
  );
}
