import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import type { MenuItem } from "@/types/menu";

interface MenuItemCardProps {
  item: MenuItem;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (itemId: string) => void;
  onToggleActive?: (itemId: string, isActive: boolean) => void;
}

/**
 * Carte affichant un item de menu
 *
 * @param item - Item à afficher
 * @param onEdit - Callback pour éditer l'item
 * @param onDelete - Callback pour supprimer l'item
 * @param onToggleActive - Callback pour activer/désactiver l'item
 */
export function MenuItemCard({
  item,
  onEdit,
  onDelete,
  onToggleActive,
}: MenuItemCardProps) {
  return (
    <Card className={!item.isActive ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            {!item.isActive && (
              <Badge variant="secondary" className="text-xs">
                Inactif
              </Badge>
            )}
            {item.recipe && (
              <Badge variant="outline" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Recette
              </Badge>
            )}
          </div>
          <Badge variant={item.type === "food" ? "default" : "secondary"}>
            {item.type === "food" ? "Nourriture" : "Boisson"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Image si disponible */}
          {item.image && (
            <div className="w-full h-32 rounded-md overflow-hidden bg-muted">
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
          <div className="flex items-center gap-2 pt-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(item)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}

            {onToggleActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleActive(item.id, !item.isActive)}
              >
                {item.isActive ? (
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
                onClick={() => onDelete(item.id)}
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
