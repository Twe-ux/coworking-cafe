"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ArticleFormData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  category: string;
  imgSrc?: string;
  imgAlt?: string;
  status: "draft" | "published";
}

interface ArticleFormProps {
  initialData?: ArticleFormData;
  onSubmit: (data: ArticleFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  categories: { _id: string; name: string }[];
}

export function ArticleForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  categories,
}: ArticleFormProps) {
  const [formData, setFormData] = useState<ArticleFormData>(
    initialData || {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      category: "",
      imgSrc: "",
      imgAlt: "",
      status: "draft",
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Auto-generate slug from title (only if not manually edited)
  useEffect(() => {
    if (!initialData && formData.title && !slugManuallyEdited) {
      const generatedSlug = formData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, initialData, slugManuallyEdited]);

  const handleChange = (
    field: keyof ArticleFormData,
    value: string | undefined
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

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    handleChange("slug", value);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = "Titre requis";
    if (!formData.slug) newErrors.slug = "Slug requis";
    if (!formData.content) newErrors.content = "Contenu requis";
    if (!formData.category) newErrors.category = "Catégorie requise";

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
            placeholder="Ex: Comment améliorer sa productivité"
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        {/* Slug (éditable) */}
        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug (URL) *
            <span className="text-xs text-muted-foreground ml-2">
              {slugManuallyEdited ? "Modifié" : "Auto-généré"}
            </span>
          </Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="Ex: ameliorer-productivite"
            className={errors.slug ? "border-destructive" : ""}
          />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
          <p className="text-xs text-muted-foreground">
            Modifiable si besoin. URL finale : /blog/{formData.slug || "..."}
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange("category", value)}
          >
            <SelectTrigger id="category" className={errors.category ? "border-destructive" : ""}>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange("status", value as "draft" | "published")}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="published">Publié</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">Résumé (extrait)</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => handleChange("excerpt", e.target.value)}
          placeholder="Résumé court pour les cards (max 200 caractères)..."
          rows={3}
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground">
          {formData.excerpt?.length || 0}/200 caractères
        </p>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Contenu complet *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleChange("content", e.target.value)}
          placeholder="Contenu de l'article (Markdown supporté)..."
          rows={12}
          className={errors.content ? "border-destructive" : ""}
        />
        {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
      </div>

      {/* Image */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Image de couverture</Label>
          <ImageUpload
            value={formData.imgSrc}
            onChange={(url) => handleChange("imgSrc", url)}
            disabled={isSubmitting}
            folder="blog"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imgAlt">Alt text (SEO)</Label>
          <Input
            id="imgAlt"
            value={formData.imgAlt}
            onChange={(e) => handleChange("imgAlt", e.target.value)}
            placeholder="Description de l'image"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : initialData ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
