"use client";

import { useCallback } from "react";
import { StaffFormData } from "../components/dashboard/staff/list/create/staff-form-sections";

// Types pour la validation
export type ValidationRule<T> = (value: T) => string | null;
export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

// Règles de validation courantes
export const commonValidations = {
  required: (value: any): string | null => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return "Ce champ est requis";
    }
    return null;
  },

  email: (value: string): string | null => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : "Adresse email invalide";
  },

  phone: (value: string): string | null => {
    if (!value) return null;
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(value.replace(/\s/g, ""))
      ? null
      : "Numéro de téléphone invalide";
  },

  minLength:
    (min: number) =>
    (value: string): string | null => {
      if (!value) return null;
      return value.length >= min ? null : `Minimum ${min} caractères requis`;
    },

  maxLength:
    (max: number) =>
    (value: string): string | null => {
      if (!value) return null;
      return value.length <= max ? null : `Maximum ${max} caractères autorisés`;
    },

  numeric: (value: string): string | null => {
    if (!value) return null;
    return !isNaN(Number(value)) ? null : "Doit être un nombre valide";
  },

  positiveNumber: (value: string): string | null => {
    if (!value) return null;
    const num = Number(value);
    return !isNaN(num) && num > 0 ? null : "Doit être un nombre positif";
  },

  zipCode: (value: string): string | null => {
    if (!value) return null;
    const zipRegex = /^\d{5}$/;
    return zipRegex.test(value) ? null : "Code postal invalide (5 chiffres)";
  },

  securityNumber: (value: string): string | null => {
    if (!value) return null;
    const cleanValue = value.replace(/\s/g, "");
    return cleanValue.length === 15
      ? null
      : "Numéro de sécurité sociale invalide";
  },

  password4Digits: (value: string): string | null => {
    if (!value) return null;
    return /^\d{4}$/.test(value)
      ? null
      : "Le mot de passe doit contenir exactement 4 chiffres";
  },
};

// Règles de validation pour le formulaire de staff
export const staffValidationRules: ValidationRules<StaffFormData> = {
  firstName: (value) => commonValidations.required(value),
  lastName: (value) => commonValidations.required(value),
  email: (value) => {
    const requiredError = commonValidations.required(value);
    if (requiredError) return requiredError;
    return commonValidations.email(value);
  },
  phone: (value) => {
    const requiredError = commonValidations.required(value);
    if (requiredError) return requiredError;
    return commonValidations.phone(value);
  },
  framework: (value) => commonValidations.required(value),
  times: (value) => commonValidations.required(value),
  hourlyRate: (value) => {
    const requiredError = commonValidations.required(value);
    if (requiredError) return requiredError;
    return commonValidations.positiveNumber(value);
  },
  mdp: (value) => {
    const requiredError = commonValidations.required(value);
    if (requiredError) return requiredError;
    return commonValidations.password4Digits(value);
  },
  zipcode: (value) => (value ? commonValidations.zipCode(value) : null),
  numberSecu: (value) =>
    value ? commonValidations.securityNumber(value) : null,
};

// Hook de validation générique
export function useValidation<T extends Record<string, any>>(
  rules: ValidationRules<T>,
) {
  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): string | null => {
      const rule = rules[field];
      return rule ? rule(value) : null;
    },
    [rules],
  );

  const validateAll = useCallback(
    (
      data: T,
    ): {
      isValid: boolean;
      errors: Partial<Record<keyof T, string>>;
    } => {
      const errors: Partial<Record<keyof T, string>> = {};

      for (const field in rules) {
        const error = validateField(field, data[field]);
        if (error) {
          errors[field] = error;
        }
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    },
    [validateField, rules],
  );

  const validateFields = useCallback(
    (
      data: T,
      fieldsToValidate: (keyof T)[],
    ): {
      isValid: boolean;
      errors: Partial<Record<keyof T, string>>;
    } => {
      const errors: Partial<Record<keyof T, string>> = {};

      for (const field of fieldsToValidate) {
        if (rules[field]) {
          const error = validateField(field, data[field]);
          if (error) {
            errors[field] = error;
          }
        }
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    },
    [validateField, rules],
  );

  return {
    validateField,
    validateAll,
    validateFields,
  };
}

// Hook spécialisé pour la validation du staff
export function useStaffValidation() {
  return useValidation(staffValidationRules);
}

// Utilitaires de validation pour les formulaires spécifiques
export const formValidationUtils = {
  // Validation en temps réel
  validateOnChange: <T extends Record<string, any>>(
    data: T,
    field: keyof T,
    value: T[keyof T],
    rules: ValidationRules<T>,
  ) => {
    const rule = rules[field];
    return rule ? rule(value) : null;
  },

  // Validation avant soumission
  validateBeforeSubmit: <T extends Record<string, any>>(
    data: T,
    rules: ValidationRules<T>,
  ) => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field in rules) {
      const rule = rules[field];
      if (rule) {
        const error = rule(data[field]);
        if (error) {
          errors[field] = error;
          isValid = false;
        }
      }
    }

    return { isValid, errors };
  },

  // Validation de groupes de champs
  validateGroup: <T extends Record<string, any>>(
    data: T,
    fields: (keyof T)[],
    rules: ValidationRules<T>,
  ) => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field of fields) {
      const rule = rules[field];
      if (rule) {
        const error = rule(data[field]);
        if (error) {
          errors[field] = error;
          isValid = false;
        }
      }
    }

    return { isValid, errors };
  },
};
