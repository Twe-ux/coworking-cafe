"use client";

import {
  AddressSection,
  CompensationSection,
  ContractSection,
  FormActions,
  PersonalInfoSection,
} from "@/components/dashboard/staff/create/staff-form-components";
import { useStaffForm } from "@/hooks/use-staff-form";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function CreateStaffRefactored() {
  const {
    // État
    formData,
    validationErrors,
    loading,
    success,
    error,

    // Actions
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    resetForm,
    navigateToList,
  } = useStaffForm();

  // Gestion des effets de bord
  useEffect(() => {
    if (success) {
      toast.success("Personnel créé avec succès !");
      navigateToList();
    }
  }, [success, navigateToList]);

  useEffect(() => {
    if (error) {
      toast.error(error || "Une erreur est survenue lors de la création");
    }
  }, [error]);

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nouveau membre du personnel
          </h1>
          <p className="text-muted-foreground">
            Remplissez les informations pour créer un nouveau membre du
            personnel
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Informations personnelles */}
        <PersonalInfoSection
          formData={formData}
          errors={validationErrors}
          onInputChange={handleInputChange}
        />

        {/* Section Adresse */}
        <AddressSection
          formData={formData}
          errors={validationErrors}
          onInputChange={handleInputChange}
        />

        {/* Section Contrat */}
        <ContractSection
          formData={formData}
          errors={validationErrors}
          onSelectChange={handleSelectChange}
        />

        {/* Section Rémunération et dates */}
        <CompensationSection
          formData={formData}
          errors={validationErrors}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
        />

        {/* Actions du formulaire */}
        <FormActions
          onSubmit={handleSubmit}
          onCancel={navigateToList}
          onReset={resetForm}
          loading={loading}
          submitLabel="Créer le personnel"
          cancelLabel="Retour à la liste"
          resetLabel="Réinitialiser"
        />
      </form>
    </div>
  );
}
