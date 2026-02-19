"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ArticlesFiltersProps {
  statusFilter: "all" | "draft" | "published";
  categoryFilter: string;
  onStatusChange: (status: "all" | "draft" | "published") => void;
  onCategoryChange: (category: string) => void;
  categories: { _id: string; name: string }[];
}

export function ArticlesFilters({
  statusFilter,
  categoryFilter,
  onStatusChange,
  onCategoryChange,
  categories,
}: ArticlesFiltersProps) {
  return (
    <div className="flex gap-4 items-end">
      <div className="space-y-2 flex-1">
        <Label>Statut</Label>
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusChange(value as "all" | "draft" | "published")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="published">Publiés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 flex-1">
        <Label>Catégorie</Label>
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
