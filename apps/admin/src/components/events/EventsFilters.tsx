"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventStatus } from "@coworking-cafe/database";

interface EventsFiltersProps {
  statusFilter: EventStatus | "all";
  categoryFilter: string;
  onStatusChange: (status: EventStatus | "all") => void;
  onCategoryChange: (category: string) => void;
}

export function EventsFilters({
  statusFilter,
  categoryFilter,
  onStatusChange,
  onCategoryChange,
}: EventsFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
      <div className="space-y-2">
        <Label htmlFor="status-filter">Statut</Label>
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusChange(value as EventStatus | "all")}
        >
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
            <SelectItem value="archived">Archivé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-filter">Catégorie</Label>
        <Input
          id="category-filter"
          placeholder="Filtrer par catégorie..."
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
        />
      </div>
    </div>
  );
}
