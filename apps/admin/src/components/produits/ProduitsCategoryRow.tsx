import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { ProduitsCategory } from "@/types/produits";

interface ProduitsCategoryRowProps {
  category: ProduitsCategory;
  onEdit?: (category: ProduitsCategory) => void;
  onDelete?: (categoryId: string) => void;
  onToggleActive?: (categoryId: string, isActive: boolean) => void;
}

/**
 * Row affichant une catégorie de produits en liste
 *
 * @param category - Catégorie à afficher
 * @param onEdit - Callback pour éditer la catégorie
 * @param onDelete - Callback pour supprimer la catégorie
 * @param onToggleActive - Callback pour activer/désactiver la catégorie
 */
export function ProduitsCategoryRow({
  category,
  onEdit,
  onDelete,
  onToggleActive,
}: ProduitsCategoryRowProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
        !category.isActive ? "bg-muted/30" : ""
      }`}
    >
      {/* Info catégorie */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${!category.isActive ? "text-muted-foreground" : ""}`}>
              {category.name}
            </h3>
            <Badge
              variant={category.isActive ? "default" : "secondary"}
              className={`text-xs ${category.isActive ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"}`}
            >
              {category.isActive ? "Activé" : "Désactivé"}
            </Badge>
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
      <div className="flex items-center gap-1">
        {onEdit && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(category)}
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )}

        {onToggleActive && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleActive(category.id, !category.isActive)}
            title={category.isActive ? "Désactiver" : "Activer"}
          >
            {category.isActive ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        )}

        {onDelete && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(category.id)}
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
