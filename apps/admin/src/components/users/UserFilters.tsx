import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { UserFilters as UserFiltersType } from "@/types/user";

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
}

export function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleRoleChange = (roleSlug: string) => {
    onFiltersChange({
      ...filters,
      roleSlug: roleSlug as UserFiltersType["roleSlug"],
    });
  };

  const handleActiveChange = (value: string) => {
    const isActive = value === "all" ? undefined : value === "true";
    onFiltersChange({ ...filters, isActive });
  };

  const handleNewsletterChange = (value: string) => {
    const newsletter = value === "all" ? undefined : value === "true";
    onFiltersChange({ ...filters, newsletter });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher..."
          value={filters.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Role Filter */}
      <Select
        value={filters.roleSlug || "all"}
        onValueChange={handleRoleChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Tous les rôles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les rôles</SelectItem>
          <SelectItem value="dev">Développeur</SelectItem>
          <SelectItem value="admin">Administrateur</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
          <SelectItem value="client">Client</SelectItem>
        </SelectContent>
      </Select>

      {/* Active Status Filter */}
      <Select
        value={
          filters.isActive === undefined
            ? "all"
            : filters.isActive
            ? "true"
            : "false"
        }
        onValueChange={handleActiveChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="true">Actifs</SelectItem>
          <SelectItem value="false">Supprimés</SelectItem>
        </SelectContent>
      </Select>

      {/* Newsletter Filter */}
      <Select
        value={
          filters.newsletter === undefined
            ? "all"
            : filters.newsletter
            ? "true"
            : "false"
        }
        onValueChange={handleNewsletterChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Newsletter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          <SelectItem value="true">Inscrit newsletter</SelectItem>
          <SelectItem value="false">Non inscrit</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
