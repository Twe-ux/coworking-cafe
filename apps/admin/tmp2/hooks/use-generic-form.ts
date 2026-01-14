"use client";

import { useCallback, useState } from "react";

// Types génériques pour les champs de formulaire
export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "select"
  | "switch"
  | "textarea";

export interface BaseFieldConfig {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  className?: string;
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: "select";
  options: { value: string; label: string }[];
}

export interface SwitchFieldConfig extends BaseFieldConfig {
  type: "switch";
  defaultValue?: boolean;
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: "text" | "email" | "tel" | "number" | "date" | "textarea";
  validation?: (value: any) => string | null;
}

export type FieldConfig =
  | SelectFieldConfig
  | SwitchFieldConfig
  | TextFieldConfig;

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FieldConfig[];
  columns?: 1 | 2 | 3;
}

export interface FormConfig<T = Record<string, any>> {
  sections: FormSection[];
  initialValues: T;
  onSubmit: (data: T) => Promise<void> | void;
  submitLabel?: string;
  resetLabel?: string;
  cancelLabel?: string;
}

// Validateurs prédéfinis
export const validators = {
  required: (label: string) => (value: any) =>
    !value || value.toString().trim() === ""
      ? `${label} est obligatoire`
      : null,

  email: (value: string) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? "Format d'email invalide"
      : null,

  minLength: (min: number) => (value: string) =>
    value.length < min ? `Minimum ${min} caractères requis` : null,

  number: (value: any) => (isNaN(Number(value)) ? "Doit être un nombre" : null),

  positive: (value: any) =>
    Number(value) <= 0 ? "Doit être un nombre positif" : null,
};

// Hook générique pour la gestion de formulaires
export function useGenericForm<T extends Record<string, any>>(
  config: FormConfig<T>,
) {
  const [formData, setFormData] = useState<T>(config.initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gestion des changements de champs
  const handleFieldChange = useCallback(
    (fieldId: string, value: any) => {
      setFormData((prev) => ({ ...prev, [fieldId]: value }));

      // Effacer l'erreur si le champ est modifié
      if (errors[fieldId]) {
        setErrors((prev) => ({ ...prev, [fieldId]: "" }));
      }
    },
    [errors],
  );

  // Validation du formulaire
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    config.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const value = formData[field.id];

        // Validation des champs obligatoires
        if (field.required && (!value || value.toString().trim() === "")) {
          newErrors[field.id] = `${field.label} est obligatoire`;
          return;
        }

        // Validation spécifique par type
        if (field.type === "email" && value) {
          const emailError = validators.email(value);
          if (emailError) newErrors[field.id] = emailError;
        }

        if (field.type === "number" && value) {
          const numberError = validators.number(value);
          if (numberError) newErrors[field.id] = numberError;
        }

        // Validation personnalisée
        if (field.type !== "switch" && field.type !== "select") {
          const textField = field as TextFieldConfig;
          if (textField.validation && value) {
            const error = textField.validation(value);
            if (error) newErrors[field.id] = error;
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, config.sections]);

  // Soumission du formulaire
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        await config.onSubmit(formData);
      } catch (error) {
        console.error("Erreur lors de la soumission:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, config.onSubmit],
  );

  // Réinitialisation du formulaire
  const resetForm = useCallback(() => {
    setFormData(config.initialValues);
    setErrors({});
  }, [config.initialValues]);

  return {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    resetForm,
    validateForm,
    isValid: Object.keys(errors).length === 0,
  };
}

// Utilitaires pour créer rapidement des configurations communes
export const FormConfigBuilder = {
  // Configuration pour les informations personnelles
  personalInfo: (prefix = ""): FormSection => ({
    id: `${prefix}personal-info`,
    title: "Informations personnelles",
    description: "Renseignez les informations de base",
    columns: 2,
    fields: [
      {
        id: "firstName",
        label: "Prénom",
        type: "text",
        required: true,
        placeholder: "Entrez le prénom",
      },
      {
        id: "lastName",
        label: "Nom",
        type: "text",
        required: true,
        placeholder: "Entrez le nom",
      },
      {
        id: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "exemple@email.com",
      },
      {
        id: "phone",
        label: "Téléphone",
        type: "tel",
        required: true,
        placeholder: "06 12 34 56 78",
      },
    ],
  }),

  // Configuration pour l'adresse
  address: (prefix = ""): FormSection => ({
    id: `${prefix}address`,
    title: "Adresse",
    description: "Informations de domicile",
    fields: [
      {
        id: "address",
        label: "Adresse",
        type: "text",
        placeholder: "12 rue de la Paix",
      },
      {
        id: "zipcode",
        label: "Code postal",
        type: "text",
        placeholder: "75001",
      },
      {
        id: "city",
        label: "Ville",
        type: "text",
        placeholder: "Paris",
      },
    ],
  }),

  // Configuration pour les contrats
  contract: (
    contractTypes: { value: string; label: string }[],
    times: { value: string; label: string }[],
  ): FormSection => ({
    id: "contract",
    title: "Informations contractuelles",
    description: "Détails du contrat de travail",
    columns: 2,
    fields: [
      {
        id: "framework",
        label: "Type de contrat",
        type: "select",
        required: true,
        options: contractTypes,
      },
      {
        id: "times",
        label: "Temps de travail",
        type: "select",
        required: true,
        options: times,
      },
    ],
  }),
};
