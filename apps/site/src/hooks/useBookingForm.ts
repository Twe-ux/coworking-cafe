/**
 * useBookingForm Hook - apps/site
 * Hook pour gérer le formulaire de réservation
 */

import { useState } from 'react';
import { apiClient, handleApiError } from '@/lib/utils/api-client';
import type { BookingFormData, ValidationErrors, CalculatePriceResponse } from '@/types';

interface UseBookingFormReturn {
  formData: BookingFormData;
  errors: ValidationErrors;
  loading: boolean;
  handleChange: (field: keyof BookingFormData, value: string | number) => void;
  validateForm: () => boolean;
  handleSubmit: () => Promise<{ success: boolean; data?: CalculatePriceResponse }>;
  resetForm: () => void;
}

const initialFormData: BookingFormData = {
  spaceId: '',
  date: '',
  startTime: '',
  endTime: '',
  numberOfPeople: 1,
  promoCode: '',
  specialRequests: '',
};

export function useBookingForm(): UseBookingFormReturn {
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  /**
   * Mettre à jour un champ du formulaire
   */
  const handleChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Nettoyer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Valider le formulaire
   */
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validation espace
    if (!formData.spaceId) {
      newErrors.spaceId = 'Veuillez sélectionner un espace';
    }

    // Validation date
    if (!formData.date) {
      newErrors.date = 'Veuillez sélectionner une date';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = 'La date ne peut pas être dans le passé';
      }
    }

    // Validation heure de début
    if (!formData.startTime) {
      newErrors.startTime = 'Veuillez sélectionner une heure de début';
    }

    // Validation heure de fin
    if (!formData.endTime) {
      newErrors.endTime = 'Veuillez sélectionner une heure de fin';
    }

    // Validation cohérence des heures
    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = "L'heure de fin doit être après l'heure de début";
      }

      // Vérifier durée minimale (ex: 1 heure)
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      if (durationHours < 1) {
        newErrors.endTime = 'La durée minimale est de 1 heure';
      }

      if (durationHours > 12) {
        newErrors.endTime = 'La durée maximale est de 12 heures';
      }
    }

    // Validation nombre de personnes
    if (formData.numberOfPeople < 1) {
      newErrors.numberOfPeople = 'Au moins 1 personne est requise';
    } else if (formData.numberOfPeople > 50) {
      newErrors.numberOfPeople = 'Maximum 50 personnes';
    }

    // Validation code promo (optionnel, format simple)
    if (formData.promoCode && formData.promoCode.length > 0) {
      if (formData.promoCode.length < 3) {
        newErrors.promoCode = 'Le code promo doit contenir au moins 3 caractères';
      }
      if (!/^[A-Z0-9]+$/i.test(formData.promoCode)) {
        newErrors.promoCode = 'Le code promo ne doit contenir que des lettres et des chiffres';
      }
    }

    // Validation requêtes spéciales (optionnel)
    if (formData.specialRequests && formData.specialRequests.length > 500) {
      newErrors.specialRequests = 'Les requêtes spéciales ne peuvent pas dépasser 500 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Soumettre le formulaire (calcul prix + disponibilité)
   */
  const handleSubmit = async (): Promise<{
    success: boolean;
    data?: CalculatePriceResponse;
  }> => {
    // Valider avant de soumettre
    if (!validateForm()) {
      return { success: false };
    }

    setLoading(true);

    try {
      const response = await apiClient.post<CalculatePriceResponse>(
        '/booking/calculate',
        formData
      );

      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        setErrors({ general: response.error || 'Erreur lors du calcul' });
        return { success: false };
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setErrors({ general: errorMessage });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Réinitialiser le formulaire
   */
  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    validateForm,
    handleSubmit,
    resetForm,
  };
}
