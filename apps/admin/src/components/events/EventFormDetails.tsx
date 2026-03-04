"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventStatus } from "@coworking-cafe/database";
import type { EventFormData, EventFormChangeHandler } from "./EventForm";

interface EventFormDetailsProps {
  formData: EventFormData;
  errors: Record<string, string>;
  handleChange: EventFormChangeHandler;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function EventFormDetails({
  formData,
  errors,
  handleChange,
  isSubmitting,
  onCancel,
}: EventFormDetailsProps) {
  return (
    <>
      {/* Image */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Image de couverture *</Label>
          <ImageUpload
            value={formData.imgSrc}
            onChange={(url) => handleChange("imgSrc", url)}
            disabled={isSubmitting}
            folder="events"
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
          <Label>Type d&apos;inscription</Label>
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
        <Button
          type="button"
          variant="outline"
          className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="outline"
          className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </>
  );
}
