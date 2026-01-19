import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { MenuCategory } from "@/types/menu";

interface MenuCategoryRowProps {
  category: MenuCategory;
  onEdit?: (category: MenuCategory) => void;
  onDelete?: (categoryId: string) => void;
  onToggleActive?: (categoryId: string, isActive: boolean) => void;
}

/**
 * Row affichant une catégorie de menu en liste
 *
 * @param category - Catégorie à afficher
 * @param onEdit - Callback pour éditer la catégorie
 * @param onDelete - Callback pour supprimer la catégorie
 * @param onToggleActive - Callback pour activer/désactiver la catégorie
 */
export function MenuCategoryRow({
  category,
  onEdit,
  onDelete,
  onToggleActive,
}: MenuCategoryRowProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
        !category.isActive ? "opacity-60" : ""
      }`}
    >
      {/* Info catégorie */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{category.name}</h3>
            {!category.isActive && (
              <Badge variant="secondary" className="text-xs">
                Inactif
              </Badge>
            )}
            {!category.showOnSite && (
              <Badge variant="outline" className="text-xs">
                Caché du site
              </Badge>
            )}
          </div>
          {category.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {category.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Slug: {category.slug}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Ordre: {category.order}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
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
  );
}
