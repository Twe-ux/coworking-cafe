"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Calendar } from "lucide-react";
import { DEFAULT_EVENT_CATEGORIES, EVENT_LOCATIONS } from "@/constants/events";
import type { EventFormData, EventFormChangeHandler } from "./EventForm";

interface EventFormFieldsProps {
  formData: EventFormData;
  errors: Record<string, string>;
  handleChange: EventFormChangeHandler;
  newCategory: string;
  onNewCategoryChange: (value: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (cat: string) => void;
}

export function EventFormFields({
  formData,
  errors,
  handleChange,
  newCategory,
  onNewCategoryChange,
  onAddCategory,
  onRemoveCategory,
}: EventFormFieldsProps) {
  return (
    <>
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

        {/* Add to Agenda Checkbox */}
        <div className="space-y-2 flex items-center gap-3 pt-6">
          <Checkbox
            id="addToAgenda"
            checked={formData.addToAgenda}
            onCheckedChange={(checked) => handleChange("addToAgenda", checked as boolean)}
          />
          <Label htmlFor="addToAgenda" className="cursor-pointer font-normal flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Ajouter automatiquement à l'agenda
          </Label>
        </div>
      </div>

      {formData.addToAgenda && (!formData.date || !formData.startTime || !formData.endTime || !formData.location) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
          <p className="text-sm text-yellow-700">
            <strong>Note :</strong> Pour ajouter l'événement à l'agenda, vous devez renseigner : date, heure de début, heure de fin et lieu.
          </p>
        </div>
      )}

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
          <Select
            value={newCategory}
            onValueChange={(value) => {
              onNewCategoryChange(value);
              onAddCategory(value); // Ajouter automatiquement dès la sélection
            }}
          >
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
          <Button type="button" onClick={() => onAddCategory()} disabled={!newCategory}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.category.map((cat) => (
            <Badge key={cat} variant="secondary">
              {cat}
              <button
                type="button"
                onClick={() => onRemoveCategory(cat)}
                className="ml-2"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
      </div>
    </>
  );
}
