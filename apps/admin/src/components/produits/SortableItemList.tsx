"use client";

import { useState, useEffect } from "react";
import { SortableList } from "@/components/ui/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { ProduitsItem } from "@/types/produits";
import { useToast } from "@/hooks/use-toast";

interface SortableItemListProps {
  items: ProduitsItem[];
  onEdit?: (item: ProduitsItem) => void;
  onDelete?: (itemId: string) => void;
  onReorder: (items: ProduitsItem[]) => void;
}

export function SortableItemList({
  items,
  onEdit,
  onDelete,
  onReorder,
}: SortableItemListProps) {
  const { toast } = useToast();
  const [isReordering, setIsReordering] = useState(false);
  const [localItems, setLocalItems] = useState(items);

  // Sync local state with props
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleReorder = async (reorderedItems: ProduitsItem[]) => {
    // Mise à jour optimiste de l'UI
    setLocalItems(reorderedItems);
    setIsReordering(true);

    try {
      const itemIds = reorderedItems.map((item) => item.id);

      const response = await fetch("/api/produits/items/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds }),
      });

      const result = await response.json();

      if (!result.success) {
        // En cas d'erreur, restaurer l'ordre original
        setLocalItems(items);
        throw new Error(result.error || "Erreur lors de la réorganisation");
      }

      onReorder(reorderedItems);

      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des items a été sauvegardé",
      });
    } catch (error) {
      console.error("Erreur lors de la réorganisation:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de réorganiser les items",
      });
    } finally {
      setIsReordering(false);
    }
  };

  if (localItems.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        Aucun item dans cette catégorie
      </div>
    );
  }

  return (
    <SortableList
      items={localItems}
      keyExtractor={(item) => item.id}
      onReorder={handleReorder}
      renderItem={(item) => (
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {item.image && (
              <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="font-medium truncate">{item.name}</span>
              {item.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Badge actif/inactif */}
            <Badge
              variant={item.isActive ? "default" : "secondary"}
              className="text-xs"
            >
              {item.isActive ? "Actif" : "Inactif"}
            </Badge>

            {/* Boutons d'action */}
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(item)}
                  disabled={isReordering}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(item.id)}
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
