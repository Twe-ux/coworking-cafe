import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { ProduitsCategory } from "@/types/produits";

interface ProduitsCategoryRowProps {
  category: ProduitsCategory;
  onEdit?: (category: ProduitsCategory) => void;
  onDelete?: (categoryId: string) => void;
}

/**
 * Row affichant une catégorie de produits en liste (collapsible)
 *
 * @param category - Catégorie à afficher
 * @param onEdit - Callback pour éditer la catégorie
 * @param onDelete - Callback pour supprimer la catégorie
 */
export function ProduitsCategoryRow({
  category,
  onEdit,
  onDelete,
}: ProduitsCategoryRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`border rounded-lg transition-colors ${
        !category.isActive ? "bg-muted/30" : ""
      }`}
    >
      {/* Header - toujours visible */}
      <div className={`flex items-center justify-between p-4 hover:bg-green-50 hover:border-green-500 ${isExpanded ? 'rounded-t-lg' : 'rounded-lg'} transition-colors cursor-pointer border border-transparent`}>
        {/* Left: Chevron + Info principale */}
        <div className="flex items-center gap-3 flex-1">
          {/* Chevron expand/collapse */}
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>

          {/* Nom + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-semibold ${!category.isActive ? "text-muted-foreground" : ""}`}
            >
              {category.name}
            </h3>

            {/* Badge Actif/Inactif */}
            <Badge
              variant={category.isActive ? "default" : "secondary"}
              className={`text-xs ${
                category.isActive
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {category.isActive ? "Actif" : "Inactif"}
            </Badge>

            {/* Badge type */}
            <Badge variant="outline" className="text-xs">
              {category.type === "drink" && "🍺 Boisson"}
              {category.type === "food" && "🥗 Nourriture"}
              {category.type === "grocery" && "🛒 Épicerie"}
              {category.type === "goodies" && "🎁 Goodies"}
            </Badge>

            {/* Badge caché du site */}
            {!category.showOnSite && (
              <Badge
                variant="outline"
                className="text-xs border-orange-500 text-orange-700"
              >
                ❌ Caché du site
              </Badge>
            )}
          </div>
        </div>

        {/* Actions - toujours visibles */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="outline"
              size="icon"
              className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => onEdit(category)}
              title="Modifier"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="outline"
              size="icon"
              className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(category.id)}
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Détails - affichés seulement si expanded */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t">
          <div className="ml-9 space-y-2 pt-3">
            {/* Description */}
            {category.description && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Description:
                </span>
                <p className="text-sm mt-1">{category.description}</p>
              </div>
            )}

            {/* Slug et ordre */}
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Slug:
                </span>
                <Badge variant="outline" className="text-xs ml-2">
                  {category.slug}
                </Badge>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Ordre:
                </span>
                <Badge variant="outline" className="text-xs ml-2">
                  {category.order}
                </Badge>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Créé: {new Date(category.createdAt).toLocaleDateString("fr-FR")}
              </span>
              <span>
                Modifié:{" "}
                {new Date(category.updatedAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
