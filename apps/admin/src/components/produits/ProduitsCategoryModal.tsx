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
import type { ProduitsCategory, ProduitsItemType } from "@/types/produits";

interface ProduitsCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    slug: string;
    description?: string;
    type: ProduitsItemType;
    order?: number;
    isActive?: boolean;
    showOnSite?: boolean;
  }) => Promise<boolean>;
  category?: ProduitsCategory; // Si fourni = mode édition
  fixedType?: ProduitsItemType; // Type fixe (food ou drink)
}

/**
 * Modal pour créer ou éditer une catégorie de produits
 *
 * @param isOpen - État d'ouverture du modal
 * @param onClose - Callback pour fermer le modal
 * @param onSave - Callback pour sauvegarder (retourne true si succès)
 * @param category - Catégorie à éditer (optionnel)
 * @param fixedType - Type fixe (food ou drink) pour le mode création
 */
export function ProduitsCategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  fixedType,
}: ProduitsCategoryModalProps) {
  const isEditing = !!category;

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProduitsItemType>(fixedType || "food");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [showOnSite, setShowOnSite] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialiser le formulaire
  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || "");
      setType(category.type);
      setOrder(category.order);
      setIsActive(category.isActive);
      setShowOnSite(category.showOnSite);
    } else {
      // Réinitialiser en mode création
      setName("");
      setSlug("");
      setDescription("");
      setType(fixedType || "food");
      setOrder(0);
      setIsActive(true);
      setShowOnSite(true);
    }
  }, [category, fixedType, isOpen]);

  // Générer slug automatiquement depuis le nom
  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEditing) {
      // Auto-générer le slug en mode création seulement
      const generatedSlug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Retirer accents
        .replace(/[^a-z0-9\s-]/g, "") // Garder seulement lettres, chiffres, espaces, tirets
        .trim()
        .replace(/\s+/g, "-"); // Remplacer espaces par tirets
      setSlug(generatedSlug);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await onSave({
        name,
        slug,
        description: description || undefined,
        type,
        order,
        isActive,
        showOnSite,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de la catégorie"
              : "Créez une nouvelle catégorie de menu"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Boissons chaudes"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ex: boissons-chaudes"
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly (lettres minuscules, tirets)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la catégorie..."
              rows={3}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as ProduitsItemType)}
              disabled={!!fixedType}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Nourriture</SelectItem>
                <SelectItem value="drink">Boisson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordre */}
          <div className="space-y-2">
            <Label htmlFor="order">Ordre d'affichage</Label>
            <Input
              id="order"
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>

          {/* Switches */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Actif</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showOnSite">Afficher sur le site</Label>
            <Switch
              id="showOnSite"
              checked={showOnSite}
              onCheckedChange={setShowOnSite}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || !name || !slug}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
