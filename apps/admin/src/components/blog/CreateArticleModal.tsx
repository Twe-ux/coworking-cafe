"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArticleForm, type ArticleFormData } from "./ArticleForm";

interface CreateArticleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  categories: { _id: string; name: string }[];
}

export function CreateArticleModal({
  open,
  onOpenChange,
  onSuccess,
  categories,
}: CreateArticleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ArticleFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Map form fields to API fields
      const { imgSrc, imgAlt, category, ...rest } = data;
      const apiData = {
        ...rest,
        featuredImage: imgSrc,
        categoryId: category, // Map category to categoryId for API
      };

      const response = await fetch("/api/blog/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (result.success) {
        onOpenChange(false);
        onSuccess();
      } else {
        setError(result.error || "Erreur lors de la création");
      }
    } catch (err) {
      setError("Erreur lors de la création de l'article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un article</DialogTitle>
          <DialogDescription>
            Ajouter un nouvel article au blog
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <ArticleForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          categories={categories}
        />
      </DialogContent>
    </Dialog>
  );
}
