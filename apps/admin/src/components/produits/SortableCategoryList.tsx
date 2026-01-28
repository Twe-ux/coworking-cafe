"use client";

import { useState, useEffect } from "react";
import { SortableList } from "@/components/ui/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { ProduitsCategory } from "@/types/produits";
import { useToast } from "@/hooks/use-toast";

interface SortableCategoryListProps {
  categories: ProduitsCategory[];
  onEdit?: (category: ProduitsCategory) => void;
  onDelete?: (categoryId: string) => void;
  onReorder: (categories: ProduitsCategory[]) => void;
}

export function SortableCategoryList({
  categories,
  onEdit,
  onDelete,
  onReorder,
}: SortableCategoryListProps) {
  const { toast } = useToast();
  const [isReordering, setIsReordering] = useState(false);
  const [localCategories, setLocalCategories] = useState(categories);

  // Sync local state with props
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const handleReorder = async (reorderedCategories: ProduitsCategory[]) => {
    // Mise à jour optimiste de l'UI
    setLocalCategories(reorderedCategories);
    setIsReordering(true);

    try {
      const categoryIds = reorderedCategories.map((cat) => cat.id);

      const response = await fetch("/api/produits/categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryIds }),
      });

      const result = await response.json();

      if (!result.success) {
        // En cas d'erreur, restaurer l'ordre original
        setLocalCategories(categories);
        throw new Error(result.error || "Erreur lors de la réorganisation");
      }

      onReorder(reorderedCategories);

      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des catégories a été sauvegardé",
      });
    } catch (error) {
      console.error("Erreur lors de la réorganisation:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de réorganiser les catégories",
      });
    } finally {
      setIsReordering(false);
    }
  };

  if (localCategories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune catégorie. Créez-en une pour commencer.
      </div>
    );
  }

  return (
    <SortableList
      items={localCategories}
      keyExtractor={(cat) => cat.id}
      onReorder={handleReorder}
      renderItem={(category) => (
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="font-medium truncate">{category.name}</span>
              {category.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Badges empilés verticalement */}
            <div className="flex flex-col gap-1 items-end">
              <Badge
                variant={category.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {category.isActive ? "Actif" : "Inactif"}
              </Badge>
              {!category.showOnSite && (
                <Badge variant="outline" className="text-xs">
                  Masqué du site
                </Badge>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(category)}
                  disabled={isReordering}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(category.id)}
                  disabled={isReordering}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    />
  );
}
