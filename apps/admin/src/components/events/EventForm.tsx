"use client";

import { useState, useEffect, useMemo } from "react";
import type { EventStatus } from "@coworking-cafe/database";
import { EventFormFields } from "./EventFormFields";
import { EventFormDetails } from "./EventFormDetails";

export interface EventFormData {
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  category: string[];
  imgSrc: string;
  imgAlt: string;
  location?: string;
  registrationType: "internal" | "external";
  externalLink?: string;
  maxParticipants?: number;
  priceType?: "free" | "organizer" | "fixed";
  price?: number;
  organizer?: string;
  contactEmail?: string;
  status: EventStatus;
  addToAgenda?: boolean;
}

export type EventFormChangeHandler = (
  field: keyof EventFormData,
  value: string | number | string[] | boolean | undefined
) => void;

interface EventFormProps {
  initialData?: EventFormData;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const DEFAULT_FORM_DATA: EventFormData = {
  title: "",
  slug: "",
  description: "",
  shortDescription: "",
  date: "",
  startTime: "",
  endTime: "",
  category: [],
  imgSrc: "",
  imgAlt: "",
  location: "",
  registrationType: "external",
  externalLink: "",
  maxParticipants: undefined,
  priceType: "free",
  price: undefined,
  organizer: "",
  contactEmail: "",
  status: "draft",
  addToAgenda: true,
};

export function EventForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>(
    initialData
      ? { ...initialData, addToAgenda: initialData.addToAgenda ?? true } // Ensure addToAgenda is always defined
      : DEFAULT_FORM_DATA
  );
  const [newCategory, setNewCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Determine if we should auto-generate slug (creation or duplication mode)
  const shouldAutoGenerateSlug = useMemo(() => {
    // If no initialData or initialData has empty slug = creation or duplication
    return !initialData?.slug;
  }, [initialData]);

  // Auto-generate slug from title + date (only if not manually edited)
  useEffect(() => {
    if (shouldAutoGenerateSlug && formData.title && !slugManuallyEdited) {
      const titleSlug = formData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Add date to slug if available (format: titre-YYYY-MM-DD)
      const generatedSlug = formData.date
        ? `${titleSlug}-${formData.date}`
        : titleSlug;

      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [shouldAutoGenerateSlug, formData.title, formData.date, slugManuallyEdited]);

  const handleChange: EventFormChangeHandler = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Mark slug as manually edited if user changes it
    if (field === "slug") {
      setSlugManuallyEdited(true);
    }

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddCategory = (categoryToAdd?: string) => {
    const cat = categoryToAdd || newCategory;
    if (cat && !formData.category.includes(cat)) {
      handleChange("category", [...formData.category, cat]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (cat: string) => {
    handleChange("category", formData.category.filter((c) => c !== cat));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = "Titre requis";
    if (!formData.slug) newErrors.slug = "Slug requis";
    if (!formData.description) newErrors.description = "Description requise";
    if (!formData.date) newErrors.date = "Date requise";
    if (formData.category.length === 0) newErrors.category = "Au moins une catégorie requise";
    if (!formData.imgSrc) newErrors.imgSrc = "Image requise";
    if (!formData.imgAlt) newErrors.imgAlt = "Alt text requis";

    if (formData.registrationType === "external" && !formData.externalLink) {
      newErrors.externalLink = "Lien externe requis pour inscription externe";
    }

    if (formData.registrationType === "internal" && !formData.maxParticipants) {
      newErrors.maxParticipants = "Nombre max de participants requis pour inscription interne";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EventFormFields
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        newCategory={newCategory}
        onNewCategoryChange={setNewCategory}
        onAddCategory={handleAddCategory}
        onRemoveCategory={handleRemoveCategory}
      />
      <EventFormDetails
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
      />
    </form>
  );
}
