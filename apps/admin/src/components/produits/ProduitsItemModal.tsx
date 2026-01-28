"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProduitsItem, ProduitsCategory, ProduitsItemType } from "@/types/produits";

interface ProduitsItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description?: string;
    recipe?: string;
    image?: string;
    categoryId: string;
    type: ProduitsItemType;
    isActive?: boolean;
  }) => Promise<boolean>;
  item?: ProduitsItem; // Si fourni = mode édition
  categories: ProduitsCategory[]; // Liste des catégories disponibles
  fixedType?: ProduitsItemType; // Type fixe (food ou drink)
}

/**
 * Modal pour créer ou éditer un item de produits
 *
 * @param isOpen - État d'ouverture du modal
 * @param onClose - Callback pour fermer le modal
 * @param onSave - Callback pour sauvegarder (retourne true si succès)
 * @param item - Item à éditer (optionnel)
 * @param categories - Liste des catégories disponibles
 * @param fixedType - Type fixe (food ou drink)
 */
export function ProduitsItemModal({
  isOpen,
  onClose,
  onSave,
  item,
  categories,
  fixedType,
}: ProduitsItemModalProps) {
  const isEditing = !!item;

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [recipe, setRecipe] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<ProduitsItemType>(fixedType || "food");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filtrer les catégories par type
  const filteredCategories = categories.filter((cat) => cat.type === type);

  // Initialiser le formulaire
  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || "");
      setRecipe(item.recipe || "");
      setImage(item.image || "");
      setCategoryId(item.category.id);
      setType(item.type);
      setIsActive(item.isActive);
    } else {
      // Réinitialiser en mode création
      setName("");
      setDescription("");
      setRecipe("");
      setImage("");
      setCategoryId("");
      setType(fixedType || "food");
      setIsActive(true);
    }
  }, [item, fixedType, isOpen]);

  // Sélectionner automatiquement la première catégorie si aucune n'est sélectionnée
  useEffect(() => {
    if (!categoryId && filteredCategories.length > 0) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, categoryId]);

  const handleSave = async () => {
    if (!categoryId) return;

    setSaving(true);
    try {
      const success = await onSave({
        name,
        description: description || undefined,
        recipe: recipe || undefined,
        image: image || undefined,
        categoryId,
        type,
        isActive,
      });

      if (success) {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'item" : "Nouvel item"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de l'item"
              : "Créez un nouvel item de menu"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Cappuccino"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description courte de l'item..."
              rows={2}
            />
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filteredCategories.length === 0 && (
              <p className="text-xs text-destructive">
                Aucune catégorie disponible pour le type {type}. Créez-en une d'abord.
              </p>
            )}
          </div>

          {/* Recette */}
          <div className="space-y-2">
            <Label htmlFor="recipe">Recette / Instructions</Label>
            <Textarea
              id="recipe"
              value={recipe}
              onChange={(e) => setRecipe(e.target.value)}
              placeholder="Ingrédients et instructions de préparation (format Markdown supporté)..."
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Cette information sera visible par le staff
            </p>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">URL de l'image</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
            {image && (
              <div className="mt-2">
                <img
                  src={image}
                  alt="Prévisualisation"
                  className="w-32 h-32 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = "";
                    e.currentTarget.alt = "Image invalide";
                  }}
                />
              </div>
            )}
          </div>

          {/* Switch Actif */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Actif</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name || !categoryId}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
