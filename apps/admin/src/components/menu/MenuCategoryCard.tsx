import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { MenuCategory } from "@/types/menu";

interface MenuCategoryCardProps {
  category: MenuCategory;
  onEdit?: (category: MenuCategory) => void;
  onDelete?: (categoryId: string) => void;
  onToggleActive?: (categoryId: string, isActive: boolean) => void;
}

/**
 * Carte affichant une catégorie de menu
 *
 * @param category - Catégorie à afficher
 * @param onEdit - Callback pour éditer la catégorie
 * @param onDelete - Callback pour supprimer la catégorie
 * @param onToggleActive - Callback pour activer/désactiver la catégorie
 */
export function MenuCategoryCard({
  category,
  onEdit,
  onDelete,
  onToggleActive,
}: MenuCategoryCardProps) {
  return (
    <Card className={!category.isActive ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{category.name}</CardTitle>
            {!category.isActive && (
              <Badge variant="secondary" className="text-xs">
                Inactif
              </Badge>
            )}
            {!category.showOnSite && (
              <Badge variant="outline" className="text-xs">
                Masqué site
              </Badge>
            )}
          </div>
          <Badge variant={category.type === "food" ? "default" : "secondary"}>
            {category.type === "food" ? "Nourriture" : "Boisson"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Description */}
          {category.description && (
            <p className="text-sm text-muted-foreground">{category.description}</p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Slug: {category.slug}</span>
            <span>Ordre: {category.order}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(category)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}

            {onToggleActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleActive(category.id, !category.isActive)}
              >
                {category.isActive ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Activer
                  </>
                )}
              </Button>
            )}

            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(category.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
