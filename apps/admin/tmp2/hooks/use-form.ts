"use client";

import { useCallback, useState } from "react";

// Type générique pour les formulaires
export type FormField =
  | string
  | number
  | boolean
  | Array<any>
  | Record<string, any>;

export type FormData = Record<string, FormField>;

export type FormValidation<T extends FormData> = {
  [K in keyof T]?: (value: T[K]) => string | null;
};

export type UseFormOptions<T extends FormData> = {
  initialValues: T;
  validation?: FormValidation<T>;
  onSubmit?: (values: T) => void | Promise<void>;
};

export function useForm<T extends FormData>({
  initialValues,
  validation,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setFormValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mettre à jour une valeur
  const setValue = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));

      // Valider le champ si une validation est définie
      if (validation?.[field]) {
        const error = validation[field]!(value);
        setErrors((prev) => ({ ...prev, [field]: error || undefined }));
      }
    },
    [validation],
  );

  // Mettre à jour plusieurs valeurs
  const setValues = useCallback((newValues: Partial<T>) => {
    setFormValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Marquer un champ comme touché
  const setFieldTouched = useCallback(
    (field: keyof T, touched: boolean = true) => {
      setTouched((prev) => ({ ...prev, [field]: touched }));
    },
    [],
  );

  // Réinitialiser le formulaire
  const reset = useCallback(() => {
    setFormValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Valider tous les champs
  const validate = useCallback(() => {
    if (!validation) return true;

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field in validation) {
      const validator = validation[field];
      if (validator) {
        const error = validator(values[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validation]);

  // Gestionnaire de soumission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      setIsSubmitting(true);

      try {
        const isValid = validate();
        if (isValid && onSubmit) {
          await onSubmit(values);
        }
      } catch (error) {
        console.error("Erreur lors de la soumission:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit],
  );

  // Gestionnaire de changement générique
  const handleChange = useCallback(
    (field: keyof T) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) => {
        const { type, value } = e.target;
        let processedValue: any = value;

        // Traitement spécifique selon le type d'input
        if (type === "number") {
          processedValue = value === "" ? "" : Number(value);
        } else if (type === "checkbox") {
          processedValue = (e.target as HTMLInputElement).checked;
        }

        setValue(field, processedValue);
        setFieldTouched(field);
      },
    [setValue, setFieldTouched],
  );

  // Getter pour les props d'un champ
  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: values[field] ?? "",
      onChange: handleChange(field),
      onBlur: () => setFieldTouched(field),
      error: touched[field] ? errors[field] : undefined,
    }),
    [values, errors, touched, handleChange, setFieldTouched],
  );

  // État du formulaire
  const formState = {
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0,
    isSubmitting,
  };

  return {
    values,
    errors,
    touched,
    formState,
    setValue,
    setValues,
    setFieldTouched,
    reset,
    validate,
    handleSubmit,
    handleChange,
    getFieldProps,
  };
}

// Hook spécialisé pour les listes dynamiques (comme prestaB2B, dépenses)
export function useDynamicList<T>(initialItem: T, minItems: number = 1) {
  const [items, setItems] = useState<T[]>([initialItem]);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, initialItem]);
  }, [initialItem]);

  const removeItem = useCallback(
    (index: number) => {
      setItems((prev) => {
        if (prev.length <= minItems) return prev;
        return prev.filter((_, i) => i !== index);
      });
    },
    [minItems],
  );

  const updateItem = useCallback((index: number, updates: Partial<T>) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], ...updates };
      return newItems;
    });
  }, []);

  const setItemField = useCallback(
    (index: number, field: keyof T, value: T[keyof T]) => {
      updateItem(index, { [field]: value } as Partial<T>);
    },
    [updateItem],
  );

  const reset = useCallback(() => {
    setItems([initialItem]);
  }, [initialItem]);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    setItemField,
    reset,
    canRemove: items.length > minItems,
  };
}
