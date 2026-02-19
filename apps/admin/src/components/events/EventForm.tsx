"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { DEFAULT_EVENT_CATEGORIES, EVENT_LOCATIONS } from "@/constants/events";
import type { EventStatus } from "@coworking-cafe/database";

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
  price?: number;
  organizer?: string;
  contactEmail?: string;
  status: EventStatus;
}

interface EventFormProps {
  initialData?: EventFormData;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function EventForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>(
    initialData || {
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
      price: undefined,
      organizer: "",
      contactEmail: "",
      status: "draft",
    }
  );

  const [newCategory, setNewCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData && formData.title && !formData.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, formData.slug, initialData]);

  const handleChange = (
    field: keyof EventFormData,
    value: string | number | string[] | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !formData.category.includes(newCategory)) {
      handleChange("category", [...formData.category, newCategory]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (cat: string) => {
    handleChange(
      "category",
      formData.category.filter((c) => c !== cat)
    );
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Ex: Atelier méditation"
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL) *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            placeholder="Ex: atelier-meditation"
            className={errors.slug ? "border-destructive" : ""}
          />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className={errors.date ? "border-destructive" : ""}
          />
          {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
        </div>

        {/* Start Time */}
        <div className="space-y-2">
          <Label htmlFor="startTime">Heure de début</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => handleChange("startTime", e.target.value)}
          />
        </div>

        {/* End Time */}
        <div className="space-y-2">
          <Label htmlFor="endTime">Heure de fin</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => handleChange("endTime", e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Lieu</Label>
          <Select
            value={formData.location}
            onValueChange={(value) => handleChange("location", value)}
          >
            <SelectTrigger id="location">
              <SelectValue placeholder="Sélectionner un lieu" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_LOCATIONS.map((loc: string) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description (full width) */}
      <div className="space-y-2">
        <Label htmlFor="description">Description complète *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Description détaillée de l'événement..."
          rows={6}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
      </div>

      {/* Short Description */}
      <div className="space-y-2">
        <Label htmlFor="shortDescription">Description courte (cards)</Label>
        <Textarea
          id="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => handleChange("shortDescription", e.target.value)}
          placeholder="Résumé court pour les cards (max 300 caractères)..."
          rows={3}
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground">
          {formData.shortDescription?.length || 0}/300 caractères
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label>Catégories *</Label>
        <div className="flex gap-2">
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_EVENT_CATEGORIES.map((cat: string) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" onClick={handleAddCategory} disabled={!newCategory}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.category.map((cat) => (
            <Badge key={cat} variant="secondary">
              {cat}
              <button
                type="button"
                onClick={() => handleRemoveCategory(cat)}
                className="ml-2"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
      </div>

      {/* Continue in next file due to length... */}
      <EventFormPart2
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
      />
    </form>
  );
}

// Part 2 of the form (to keep file under 200 lines)
function EventFormPart2({
  formData,
  errors,
  handleChange,
  isSubmitting,
  onCancel,
}: {
  formData: EventFormData;
  errors: Record<string, string>;
  handleChange: (field: keyof EventFormData, value: any) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  return (
    <>
      {/* Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="imgSrc">URL Image (Cloudinary) *</Label>
          <Input
            id="imgSrc"
            value={formData.imgSrc}
            onChange={(e) => handleChange("imgSrc", e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className={errors.imgSrc ? "border-destructive" : ""}
          />
          {errors.imgSrc && <p className="text-sm text-destructive">{errors.imgSrc}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="imgAlt">Alt text (SEO) *</Label>
          <Input
            id="imgAlt"
            value={formData.imgAlt}
            onChange={(e) => handleChange("imgAlt", e.target.value)}
            placeholder="Description de l'image"
            className={errors.imgAlt ? "border-destructive" : ""}
          />
          {errors.imgAlt && <p className="text-sm text-destructive">{errors.imgAlt}</p>}
        </div>
      </div>

      {/* Registration Type */}
      <div className="space-y-4 border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Label>Type d'inscription</Label>
          <div className="flex items-center gap-4 ml-4">
            <button
              type="button"
              className={`px-3 py-1 rounded ${
                formData.registrationType === "external"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
              onClick={() => handleChange("registrationType", "external")}
            >
              Externe (lien)
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded ${
                formData.registrationType === "internal"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
              onClick={() => handleChange("registrationType", "internal")}
            >
              Interne (formulaire)
            </button>
          </div>
        </div>

        {formData.registrationType === "external" && (
          <div className="space-y-2">
            <Label htmlFor="externalLink">Lien externe *</Label>
            <Input
              id="externalLink"
              type="url"
              value={formData.externalLink}
              onChange={(e) => handleChange("externalLink", e.target.value)}
              placeholder="https://eventbrite.com/..."
              className={errors.externalLink ? "border-destructive" : ""}
            />
            {errors.externalLink && (
              <p className="text-sm text-destructive">{errors.externalLink}</p>
            )}
          </div>
        )}

        {formData.registrationType === "internal" && (
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Nombre max de participants *</Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              value={formData.maxParticipants || ""}
              onChange={(e) =>
                handleChange("maxParticipants", e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="Ex: 20"
              className={errors.maxParticipants ? "border-destructive" : ""}
            />
            {errors.maxParticipants && (
              <p className="text-sm text-destructive">{errors.maxParticipants}</p>
            )}
          </div>
        )}
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price">Prix (€)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price || ""}
            onChange={(e) =>
              handleChange("price", e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizer">Organisateur</Label>
          <Input
            id="organizer"
            value={formData.organizer}
            onChange={(e) => handleChange("organizer", e.target.value)}
            placeholder="Nom de l'organisateur"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email de contact</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleChange("contactEmail", e.target.value)}
            placeholder="contact@example.com"
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Statut</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleChange("status", value as EventStatus)}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
            <SelectItem value="archived">Archivé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </>
  );
}
