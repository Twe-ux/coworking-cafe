import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SortableItemList } from "./SortableItemList";
import type { ProduitsItem, ProduitsCategory } from "@/types/produits";

interface ProduitsItemsByCategoryListProps {
  items: ProduitsItem[];
  categories: ProduitsCategory[];
  onEditItem?: (item: ProduitsItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onReorderItems?: (items: ProduitsItem[]) => void;
  showInactive?: boolean;
}

/**
 * Liste des items groupés par catégorie
 * Affiche une card par catégorie avec les items en liste simple
 */
export function ProduitsItemsByCategoryList({
  items,
  categories,
  onEditItem,
  onDeleteItem,
  onReorderItems,
  showInactive = false,
}: ProduitsItemsByCategoryListProps) {
  // État d'expansion pour chaque catégorie
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Toggle expansion d'une catégorie
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Grouper les items par catégorie
  const itemsByCategory = categories.map((category) => ({
    category,
    items: items.filter((item) => item.category.id === category.id),
  }));

  // Ne montrer que les catégories qui ont des items
  const categoriesWithItems = itemsByCategory.filter((group) => group.items.length > 0);

  if (categoriesWithItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {showInactive ? "Aucun item inactif." : "Aucun item. Créez-en un pour commencer."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {categoriesWithItems.map(({ category, items: categoryItems }) => {
        const isExpanded = expandedCategories.has(category.id);

        return (
          <Card key={category.id}>
            <div
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
                <CardTitle className="text-lg flex items-center gap-2">
                  {category.name}
                  <Badge variant="outline" className="text-xs font-normal">
                    {categoryItems.length} {categoryItems.length > 1 ? "items" : "item"}
                  </Badge>
                </CardTitle>
              </div>
            </div>

            {isExpanded && (
              <CardContent className="border-t pt-4">
                <SortableItemList
                  items={categoryItems}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  onReorder={(reorderedItems) => {
                    if (onReorderItems) {
                      // Mettre à jour avec les items réorganisés de cette catégorie
                      const otherItems = items.filter(
                        (item) => item.category.id !== category.id
                      );
                      onReorderItems([...otherItems, ...reorderedItems]);
                    }
                  }}
                />
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
