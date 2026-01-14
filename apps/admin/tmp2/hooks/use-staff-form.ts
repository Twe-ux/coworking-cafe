import type { AppDispatch } from "@/store";
import { createStaff } from "@/store/staff/api";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Types pour le formulaire de création de personnel
export interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  numberSecu: string;
  adresse: string;
  zipcode: string;
  city: string;
  framework: string;
  times: string;
  hourlyRate: string;
  startDate: string;
  endDate: string;
  isActif: boolean;
  mdp: string;
}

// Constantes pour les options de sélection
export const CONTRACT_TYPES = [
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "Freelance", label: "Freelance" },
  { value: "Stage", label: "Stage" },
] as const;

export const CONTRACT_TIMES = [
  { value: "12h", label: "12H" },
  { value: "15h", label: "15H" },
  { value: "18h", label: "18H" },
  { value: "21h", label: "21H" },
  { value: "24h", label: "24H" },
  { value: "35h", label: "35H" },
] as const;

// Données initiales du formulaire
export const initialStaffFormData: StaffFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  numberSecu: "",
  adresse: "",
  zipcode: "",
  city: "",
  framework: "",
  times: "",
  hourlyRate: "",
  startDate: "",
  endDate: "",
  isActif: true,
  mdp: "",
};

// Hook pour la gestion du formulaire de personnel
export function useStaffForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector((state: any) => state.staff);

  const [formData, setFormData] = useState<StaffFormData>(initialStaffFormData);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Gestion des changements de champs texte
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));

      // Effacer l'erreur de validation si le champ est modifié
      if (validationErrors[id]) {
        setValidationErrors((prev) => ({ ...prev, [id]: "" }));
      }
    },
    [validationErrors],
  );

  // Gestion des sélections et switches
  const handleSelectChange = useCallback(
    (id: string, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [id]: value }));

      // Effacer l'erreur de validation
      if (validationErrors[id]) {
        setValidationErrors((prev) => ({ ...prev, [id]: "" }));
      }
    },
    [validationErrors],
  );

  // Validation du formulaire
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Validations obligatoires
    if (!formData.firstName.trim()) {
      errors.firstName = "Le prénom est obligatoire";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Le nom est obligatoire";
    }
    if (!formData.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Le téléphone est obligatoire";
    }
    if (!formData.framework) {
      errors.framework = "Le type de contrat est obligatoire";
    }
    if (!formData.times) {
      errors.times = "Le temps de travail est obligatoire";
    }
    if (!formData.hourlyRate) {
      errors.hourlyRate = "Le taux horaire est obligatoire";
    } else if (
      isNaN(Number(formData.hourlyRate)) ||
      Number(formData.hourlyRate) <= 0
    ) {
      errors.hourlyRate = "Le taux horaire doit être un nombre positif";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Soumission du formulaire
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      // Transformation des données pour l'API
      const staffData = {
        ...formData,
        hourlyRate: Number(formData.hourlyRate),
        mdp: Number(formData.mdp) || 0,
        startDate: formData.startDate
          ? new Date(formData.startDate)
          : new Date(),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        contract: formData.framework, // Mappage du champ framework vers contract
        isActive: formData.isActif, // Mappage de isActif vers isActive
      };

      dispatch(createStaff(staffData));
    },
    [formData, validateForm, dispatch],
  );

  // Réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setFormData(initialStaffFormData);
    setValidationErrors({});
  }, []);

  // Navigation vers la liste
  const navigateToList = useCallback(() => {
    router.push("/admin/staff/list");
  }, [router]);

  return {
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

    // Utilitaires
    validateForm,
    isValid: Object.keys(validationErrors).length === 0,
  };
}

// Types d'export pour les composants externes
export type ContractType = (typeof CONTRACT_TYPES)[number]["value"];
export type ContractTime = (typeof CONTRACT_TIMES)[number]["value"];
