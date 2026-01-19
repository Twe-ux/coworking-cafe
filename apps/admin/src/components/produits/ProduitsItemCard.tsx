import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import type { ProduitsItem } from "@/types/produits";

interface ProduitsItemCardProps {
  item: ProduitsItem;
  onEdit?: (item: ProduitsItem) => void;
  onDelete?: (itemId: string) => void;
  onToggleActive?: (itemId: string, isActive: boolean) => void;
}

/**
 * Carte affichant un item de produits
 *
 * @param item - Item à afficher
 * @param onEdit - Callback pour éditer l'item
 * @param onDelete - Callback pour supprimer l'item
 * @param onToggleActive - Callback pour activer/désactiver l'item
 */
export function ProduitsItemCard({
  item,
  onEdit,
  onDelete,
  onToggleActive,
}: ProduitsItemCardProps) {
  return (
    <Card className={!item.isActive ? "bg-muted/30" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CardTitle className={`text-lg truncate ${!item.isActive ? "text-muted-foreground" : ""}`}>
              {item.name}
            </CardTitle>
            <Badge
              variant={item.isActive ? "default" : "secondary"}
              className={`text-xs whitespace-nowrap ${item.isActive ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"}`}
            >
              {item.isActive ? "Activé" : "Désactivé"}
            </Badge>
            {item.recipe && (
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                <FileText className="w-3 h-3 mr-1" />
                Recette
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Image si disponible */}
          {item.image && (
            <div className="w-full h-48 rounded-md overflow-hidden bg-muted">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}

          {/* Catégorie */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {item.category.name}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Ordre: {item.order}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 pt-2">
            {onEdit && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(item)}
                title="Modifier"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}

            {onToggleActive && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleActive(item.id, !item.isActive)}
                title={item.isActive ? "Désactiver" : "Activer"}
              >
                {item.isActive ? (
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
                onClick={() => onDelete(item.id)}
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
