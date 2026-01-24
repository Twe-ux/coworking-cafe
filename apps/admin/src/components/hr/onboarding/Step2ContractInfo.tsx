"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboardingContext } from "@/contexts/OnboardingContext";
import type { ContractInfo } from "@/types/onboarding";
import { useForm } from "react-hook-form";

// Formater une date ISO en YYYY-MM-DD pour les inputs
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

export function Step2ContractInfo() {
  const { data, saveStep2 } = useOnboardingContext();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContractInfo>({
    defaultValues: data.step2
      ? {
          ...data.step2,
          hireDate: formatDateForInput(data.step2.hireDate),
          endDate: formatDateForInput(data.step2.endDate),
        }
      : {
          contractType: "CDI",
          contractualHours: 35,
          hireDate: "",
          hireTime: "",
          level: "",
          step: 1,
          hourlyRate: 12.08,
          employeeRole: "Employé polyvalent",
        },
  });

  const contractType = watch("contractType");

  const onSubmit = (formData: ContractInfo) => {
    saveStep2(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations contractuelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type de contrat */}
          <div className="space-y-2">
            <Label htmlFor="contractType">
              Type de contrat <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue("contractType", value as "CDI" | "CDD" | "Stage")
              }
              defaultValue={data.step2?.contractType || "CDI"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CDI">CDI</SelectItem>
                <SelectItem value="CDD">CDD</SelectItem>
                <SelectItem value="Stage">Stage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hireDate">
                Date d'embauche <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hireDate"
                type="date"
                {...register("hireDate", {
                  required: "La date d'embauche est requise",
                })}
              />
              {errors.hireDate && (
                <p className="text-sm text-destructive">
                  {errors.hireDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireTime">Heure d'embauche</Label>
              <Input id="hireTime" type="time" {...register("hireTime")} />
            </div>
          </div>

          {/* Date de fin pour CDD */}
          {contractType === "CDD" && (
            <div className="space-y-2">
              <Label htmlFor="endDate">
                Date de fin du CDD <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate", {
                  required:
                    contractType === "CDD"
                      ? "La date de fin est requise"
                      : false,
                })}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          )}

          {/* Heures contractuelles */}
          <div className="space-y-2">
            <Label htmlFor="contractualHours">
              Heures contractuelles (par semaine){" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contractualHours"
              type="number"
              min="0"
              step="0.5"
              {...register("contractualHours", {
                required: "Les heures contractuelles sont requises",
                min: { value: 0, message: "Le nombre doit être positif" },
              })}
            />
            {errors.contractualHours && (
              <p className="text-sm text-destructive">
                {errors.contractualHours.message}
              </p>
            )}
          </div>

          {/* Classification */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">
                Niveau <span className="text-destructive">*</span>
              </Label>
              <Input
                id="level"
                placeholder="Ex: A, B, C..."
                {...register("level", {
                  required: "Le niveau est requis",
                })}
              />
              {errors.level && (
                <p className="text-sm text-destructive">
                  {errors.level.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="step">
                Échelon <span className="text-destructive">*</span>
              </Label>
              <Input
                id="step"
                type="number"
                min="1"
                {...register("step", {
                  required: "L'échelon est requis",
                  min: { value: 1, message: "L'échelon doit être ≥ 1" },
                })}
              />
              {errors.step && (
                <p className="text-sm text-destructive">
                  {errors.step.message}
                </p>
              )}
            </div>
          </div>

          {/* Rémunération */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">
                Taux horaire brut (€/h){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                {...register("hourlyRate", {
                  required: "Le taux horaire est requis",
                  min: { value: 0, message: "Le taux doit être positif" },
                })}
              />
              {errors.hourlyRate && (
                <p className="text-sm text-destructive">
                  {errors.hourlyRate.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                SMIC 2026 : 12,08 €/h
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlySalary">Salaire mensuel brut (€)</Label>
              <Input
                id="monthlySalary"
                type="number"
                min="0"
                step="0.01"
                {...register("monthlySalary", {
                  min: { value: 0, message: "Le salaire doit être positif" },
                })}
              />
              <p className="text-xs text-muted-foreground">Optionnel</p>
            </div>
          </div>

          {/* Rôle employé */}
          <div className="space-y-2">
            <Label htmlFor="employeeRole">
              Rôle <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue(
                  "employeeRole",
                  value as
                    | "Manager"
                    | "Assistant manager"
                    | "Employé polyvalent",
                )
              }
              defaultValue={data.step2?.employeeRole || "Employé polyvalent"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Assistant manager">
                  Assistant manager
                </SelectItem>
                <SelectItem value="Employé polyvalent">
                  Employé polyvalent
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Suivant
        </Button>
      </div>
    </form>
  );
}
