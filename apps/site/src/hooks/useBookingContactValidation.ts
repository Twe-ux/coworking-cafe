// ============================================================================
// useBookingContactValidation Hook
// ============================================================================
// Handles validation logic for booking contact form
// Extracted from useBookingForm for better separation of concerns
// ============================================================================

import { useState, useCallback, useMemo } from "react";
import type { ContactFormData, ValidationErrors } from "@/types/booking";

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseBookingContactValidationReturn {
  // Validation state
  errors: ValidationErrors;
  isFormValid: boolean;

  // Validation functions
  validateContactForm: () => boolean;
  validatePasswordMatch: () => boolean;
  validateField: <K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K]
  ) => string | undefined;
  clearErrors: () => void;
  clearFieldError: (field: keyof ValidationErrors) => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useBookingContactValidation(
  contactForm: ContactFormData
): UseBookingContactValidationReturn {
  // ========================================
  // State: Validation Errors
  // ========================================

  const [errors, setErrors] = useState<ValidationErrors>({});

  // ========================================
  // Validation Rules
  // ========================================

  const validateField = useCallback(
    <K extends keyof ContactFormData>(
      field: K,
      value: ContactFormData[K]
    ): string | undefined => {
      switch (field) {
        case "contactName":
          if (typeof value === "string" && !value.trim()) {
            return "Le nom est requis";
          }
          break;

        case "contactEmail":
          if (typeof value === "string") {
            if (!value.trim()) {
              return "L'email est requis";
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return "Email invalide";
            }
          }
          break;

        case "contactPhone":
          if (typeof value === "string" && !value.trim()) {
            return "Le téléphone est requis";
          }
          break;

        case "password":
          if (contactForm.createAccount) {
            if (typeof value === "string") {
              if (!value || value.length < 8) {
                return "Le mot de passe doit contenir au moins 8 caractères";
              }
            }
          }
          break;

        case "confirmPassword":
          if (contactForm.createAccount) {
            if (typeof value === "string" && value !== contactForm.password) {
              return "Les mots de passe ne correspondent pas";
            }
          }
          break;

        default:
          return undefined;
      }

      return undefined;
    },
    [contactForm.createAccount, contactForm.password]
  );

  // ========================================
  // Validate Contact Form (all fields)
  // ========================================

  const validateContactForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate required fields
    const nameError = validateField("contactName", contactForm.contactName);
    if (nameError) newErrors.contactName = nameError;

    const emailError = validateField("contactEmail", contactForm.contactEmail);
    if (emailError) newErrors.contactEmail = emailError;

    const phoneError = validateField("contactPhone", contactForm.contactPhone);
    if (phoneError) newErrors.contactPhone = phoneError;

    // Validate password if creating account
    if (contactForm.createAccount) {
      const passwordError = validateField("password", contactForm.password);
      if (passwordError) newErrors.password = passwordError;

      const confirmPasswordError = validateField(
        "confirmPassword",
        contactForm.confirmPassword
      );
      if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [contactForm, validateField]);

  // ========================================
  // Validate Password Match (specific)
  // ========================================

  const validatePasswordMatch = useCallback((): boolean => {
    if (
      contactForm.createAccount &&
      contactForm.password !== contactForm.confirmPassword
    ) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Les mots de passe ne correspondent pas",
      }));
      return false;
    }

    // Clear password errors if they match
    if (contactForm.password === contactForm.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: undefined,
      }));
    }

    return true;
  }, [contactForm]);

  // ========================================
  // Clear Errors
  // ========================================

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: keyof ValidationErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // ========================================
  // Computed: Form Validity
  // ========================================

  const isFormValid = useMemo((): boolean => {
    // Check required fields
    if (!contactForm.contactName.trim()) return false;
    if (!contactForm.contactEmail.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.contactEmail))
      return false;
    if (!contactForm.contactPhone.trim()) return false;

    // Check password if creating account
    if (contactForm.createAccount) {
      if (!contactForm.password || contactForm.password.length < 8) return false;
      if (contactForm.password !== contactForm.confirmPassword) return false;
    }

    return true;
  }, [contactForm]);

  // ========================================
  // Return Hook Interface
  // ========================================

  return {
    errors,
    isFormValid,
    validateContactForm,
    validatePasswordMatch,
    validateField,
    clearErrors,
    clearFieldError,
  };
}
