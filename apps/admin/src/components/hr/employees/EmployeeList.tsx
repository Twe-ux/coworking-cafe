"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import type { Employee } from "@/types/hr";
import { filterEmployees } from "@/lib/utils/hr/employee-utils";
import { EmployeeCard } from "./EmployeeCard";
import { Plus, Search } from "lucide-react";

interface EmployeeListProps {
  employees: Employee[];
  loading: boolean;
  onCreateNew: () => void;
  onEdit: (employee: Employee) => void;
  onViewContract: (employee: Employee) => void;
  onEndContract: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

/**
 * Liste des employés avec filtres
 * Limite : <200 lignes selon CLAUDE.md
 */
export function EmployeeList({
  employees,
  loading,
  onCreateNew,
  onEdit,
  onViewContract,
  onEndContract,
  onDelete,
}: EmployeeListProps) {
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [contractTypeFilter, setContractTypeFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  const filteredEmployees = filterEmployees(employees, {
    search,
    showArchived,
    contractType: contractTypeFilter || undefined,
    role: roleFilter || undefined,
  }).filter((emp) => {
    // Masquer le compte Admin Dev (compte technique pour tests)
    return emp.email !== "dev@coworkingcafe.com" &&
           !(emp.firstName === "Admin" && emp.lastName === "Dev");
  });

  if (loading) {
    return <LoadingSkeleton variant="card" count={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employés</h2>
          <p className="text-sm text-muted-foreground">
            {filteredEmployees.length} employé{filteredEmployees.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvel Employé
        </Button>
      </div>

      {/* Filtres */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type de contrat */}
        <Select value={contractTypeFilter} onValueChange={setContractTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Type de contrat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="CDI">CDI</SelectItem>
            <SelectItem value="CDD">CDD</SelectItem>
            <SelectItem value="Stage">Stage</SelectItem>
          </SelectContent>
        </Select>

        {/* Rôle */}
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Employé">Employé</SelectItem>
          </SelectContent>
        </Select>

        {/* Toggle archivés */}
        <div className="flex items-center space-x-2">
          <Switch
            id="show-archived"
            checked={showArchived}
            onCheckedChange={setShowArchived}
          />
          <Label htmlFor="show-archived" className="cursor-pointer">
            Afficher archivés
          </Label>
        </div>
      </div>

      {/* Liste des employés */}
      {filteredEmployees.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            {showArchived
              ? "Aucun employé archivé"
              : "Aucun employé trouvé"}
          </p>
          {!showArchived && (
            <Button
              onClick={onCreateNew}
              variant="outline"
              className="mt-4"
            >
              Créer le premier employé
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onEdit={onEdit}
              onViewContract={onViewContract}
              onEndContract={onEndContract}
              onDelete={onDelete}
              showArchived={showArchived}
            />
          ))}
        </div>
      )}
    </div>
  );
}
