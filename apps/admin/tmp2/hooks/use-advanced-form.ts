"use client";

import { FieldType } from "@/hooks/use-generic-form";
import { useCallback, useState } from "react";

// Extension des types de champs de base
export type AdvancedFieldType =
  | FieldType
  | "array"
  | "object"
  | "dynamic-list"
  | "file-upload"
  | "color-picker"
  | "range"
  | "multi-select"
  | "checkbox"
  | "password";

// Interface de base étendue avec plus d'options
export interface ExtendedBaseFieldConfig {
  id: string;
  label?: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  conditional?: {
    field: string;
    value: any;
    operator?: "equals" | "not-equals" | "contains" | "greater" | "less";
  };
}

// Configurations spécifiques étendues
export interface ExtendedTextFieldConfig extends ExtendedBaseFieldConfig {
  type: "text" | "email" | "password" | "number";
  min?: number;
  max?: number;
  step?: number;
}

export interface ExtendedTextareaFieldConfig extends ExtendedBaseFieldConfig {
  type: "textarea";
  rows?: number;
}

export interface ExtendedSelectFieldConfig extends ExtendedBaseFieldConfig {
  type: "select";
  options: { value: string; label: string }[];
}

export interface ExtendedSwitchFieldConfig extends ExtendedBaseFieldConfig {
  type: "switch";
}

export interface CheckboxFieldConfig extends ExtendedBaseFieldConfig {
  type: "checkbox";
}

export interface RangeFieldConfig extends ExtendedBaseFieldConfig {
  type: "range";
  min: number;
  max: number;
  step?: number;
}

export interface ColorPickerFieldConfig extends ExtendedBaseFieldConfig {
  type: "color-picker";
}

// Configuration pour les champs de type array
export interface ArrayFieldConfig extends ExtendedBaseFieldConfig {
  type: "array";
  itemConfig: AdvancedFieldConfig;
  minItems?: number;
  maxItems?: number;
  addButtonLabel?: string;
  removeButtonLabel?: string;
}

// Configuration pour les champs d'objet
export interface ObjectFieldConfig extends ExtendedBaseFieldConfig {
  type: "object";
  fields: AdvancedFieldConfig[];
  layout?: "horizontal" | "vertical" | "grid";
  columns?: 1 | 2 | 3;
}

// Configuration pour les listes dynamiques
export interface DynamicListFieldConfig extends ExtendedBaseFieldConfig {
  type: "dynamic-list";
  itemFields: {
    [key: string]: Omit<AdvancedFieldConfig, "id"> & {
      min?: number;
      max?: number;
      step?: number;
      rows?: number;
      options?: { value: string; label: string }[];
    };
  };
  minItems?: number;
  maxItems?: number;
  defaultItem?: Record<string, any>;
  showIndexes?: boolean;
}

// Configuration pour l'upload de fichiers
export interface FileUploadFieldConfig extends ExtendedBaseFieldConfig {
  type: "file-upload";
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // en MB
  preview?: boolean;
}

// Configuration pour multi-select
export interface MultiSelectFieldConfig extends ExtendedBaseFieldConfig {
  type: "multi-select";
  options: { value: string; label: string }[];
  searchable?: boolean;
  maxSelections?: number;
}

// Union des configurations avancées
export type AdvancedFieldConfig =
  | ExtendedTextFieldConfig
  | ExtendedTextareaFieldConfig
  | ExtendedSelectFieldConfig
  | ExtendedSwitchFieldConfig
  | CheckboxFieldConfig
  | RangeFieldConfig
  | ColorPickerFieldConfig
  | ArrayFieldConfig
  | ObjectFieldConfig
  | DynamicListFieldConfig
  | FileUploadFieldConfig
  | MultiSelectFieldConfig;

// Section de formulaire avancée
export interface AdvancedFormSection {
  title?: string;
  description?: string;
  fields: AdvancedFieldConfig[];
  layout?: "horizontal" | "vertical" | "grid";
  columns?: 1 | 2 | 3;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  conditional?: {
    field: string;
    value: any;
    operator?: "equals" | "not-equals" | "contains" | "greater" | "less";
  };
}

// Configuration de formulaire avancée
export interface AdvancedFormConfig<T = Record<string, any>> {
  sections: AdvancedFormSection[];
  initialValues: T;
  onSubmit: (data: T) => Promise<void> | void;
  submitLabel?: string;
  wizardMode?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number; // en ms
  validateOnChange?: boolean;
  showProgress?: boolean;
}

// Hook avancé pour la gestion de formulaires complexes
export function useAdvancedForm<T extends Record<string, any>>(
  config: AdvancedFormConfig<T>,
) {
  const [formData, setFormData] = useState<T>(config.initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

  // Gestion des changements avec support des chemins imbriqués
  const handleFieldChange = useCallback(
    (fieldPath: string, value: any) => {
      setFormData((prev) => {
        const newData = { ...prev };
        setNestedValue(newData, fieldPath, value);
        return newData;
      });

      // Auto-validation si activée
      if (config.validateOnChange) {
        validateField(fieldPath);
      }

      // Effacer l'erreur
      if (errors[fieldPath]) {
        setErrors((prev) => ({ ...prev, [fieldPath]: "" }));
      }
    },
    [errors, config.validateOnChange],
  );

  // Gestion des arrays dynamiques
  const handleArrayAdd = useCallback(
    (fieldPath: string, newItem: any) => {
      handleFieldChange(fieldPath, [
        ...(getNestedValue(formData, fieldPath) || []),
        newItem,
      ]);
    },
    [formData, handleFieldChange],
  );

  const handleArrayRemove = useCallback(
    (fieldPath: string, index: number) => {
      const currentArray = getNestedValue(formData, fieldPath) || [];
      const newArray = currentArray.filter((_: any, i: number) => i !== index);
      handleFieldChange(fieldPath, newArray);
    },
    [formData, handleFieldChange],
  );

  const handleArrayMove = useCallback(
    (fieldPath: string, fromIndex: number, toIndex: number) => {
      const currentArray = [...(getNestedValue(formData, fieldPath) || [])];
      const [movedItem] = currentArray.splice(fromIndex, 1);
      currentArray.splice(toIndex, 0, movedItem);
      handleFieldChange(fieldPath, currentArray);
    },
    [formData, handleFieldChange],
  );

  // Validation avancée
  const validateField = useCallback(
    (fieldPath: string): boolean => {
      const field = findFieldByPath(config.sections, fieldPath);
      if (!field) return true;

      const value = getNestedValue(formData, fieldPath);
      let error: string | null = null;

      // Validation des champs obligatoires
      if (
        field.required &&
        (!value || (Array.isArray(value) && value.length === 0))
      ) {
        error = `${field.label} est obligatoire`;
      }

      // Validation spécifique par type
      if (!error && value) {
        switch (field.type) {
          case "email":
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              error = "Format d'email invalide";
            }
            break;
          case "array":
            const arrayField = field as ArrayFieldConfig;
            if (arrayField.minItems && value.length < arrayField.minItems) {
              error = `Minimum ${arrayField.minItems} élément(s) requis`;
            }
            if (arrayField.maxItems && value.length > arrayField.maxItems) {
              error = `Maximum ${arrayField.maxItems} élément(s) autorisés`;
            }
            break;
          case "file-upload":
            const fileField = field as FileUploadFieldConfig;
            if (
              fileField.maxSize &&
              value.size > fileField.maxSize * 1024 * 1024
            ) {
              error = `Fichier trop volumineux (max ${fileField.maxSize}MB)`;
            }
            break;
        }
      }

      setErrors((prev) => ({ ...prev, [fieldPath]: error || "" }));
      return !error;
    },
    [formData, config.sections],
  );

  // Validation complète du formulaire
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const validateSection = (
      section: AdvancedFormSection,
      sectionPath = "",
    ) => {
      section.fields.forEach((field) => {
        const fieldPath = sectionPath ? `${sectionPath}.${field.id}` : field.id;
        if (!validateField(fieldPath)) {
          isValid = false;
        }
      });
    };

    config.sections.forEach((section) => validateSection(section));
    return isValid;
  }, [config.sections, validateField]);

  // Gestion wizard
  const canProceedToStep = useCallback(
    (step: number): boolean => {
      if (!config.wizardMode) return true;

      // Valider les sections précédentes
      for (let i = 0; i < step; i++) {
        const section = config.sections[i];
        if (section) {
          // Validation de section simplifiée
          const sectionValid = section.fields.every((field) =>
            validateField(field.id),
          );
          if (!sectionValid) return false;
        }
      }
      return true;
    },
    [config.wizardMode, config.sections, validateField],
  );

  const nextStep = useCallback(() => {
    if (
      currentStep < config.sections.length - 1 &&
      canProceedToStep(currentStep + 1)
    ) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      setVisitedSteps((prev) => new Set([...prev, nextStepIndex]));
    }
  }, [currentStep, config.sections.length, canProceedToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (
        step >= 0 &&
        step < config.sections.length &&
        canProceedToStep(step)
      ) {
        setCurrentStep(step);
        setVisitedSteps((prev) => new Set([...prev, step]));
      }
    },
    [config.sections.length, canProceedToStep],
  );

  // Soumission
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

  // Réinitialisation
  const resetForm = useCallback(() => {
    setFormData(config.initialValues);
    setErrors({});
    setCurrentStep(0);
    setVisitedSteps(new Set([0]));
  }, [config.initialValues]);

  // Auto-save
  const autoSave = useCallback(async () => {
    if (config.autoSave && validateForm()) {
      // Implémentation de l'auto-save
      console.log("Auto-saving form data...", formData);
    }
  }, [config.autoSave, formData, validateForm]);

  return {
    // État
    formData,
    errors,
    isSubmitting,
    currentStep,
    visitedSteps,

    // Actions de base
    handleFieldChange,
    handleSubmit,
    resetForm,
    validateForm,
    validateField,

    // Actions pour arrays
    handleArrayAdd,
    handleArrayRemove,
    handleArrayMove,

    // Actions wizard
    nextStep,
    prevStep,
    goToStep,
    canProceedToStep,

    // Utilitaires
    autoSave,
    isValid: Object.keys(errors).length === 0,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === config.sections.length - 1,
    progress: config.showProgress
      ? ((currentStep + 1) / config.sections.length) * 100
      : 0,
  };
}

// Utilitaires pour la gestion des valeurs imbriquées
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split(".");
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

function findFieldByPath(
  sections: AdvancedFormSection[],
  path: string,
): AdvancedFieldConfig | null {
  const pathParts = path.split(".");
  const fieldId = pathParts[0];

  for (const section of sections) {
    const field = section.fields.find((f) => f.id === fieldId);
    if (field) return field;
  }
  return null;
}

// Types exportés dans les interfaces ci-dessus
