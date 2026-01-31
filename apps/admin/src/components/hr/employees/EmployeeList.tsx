"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { filterEmployees } from "@/lib/utils/hr/employee-utils";
import type { Employee, EmployeeRole } from "@/types/hr";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmployeeCard } from "./EmployeeCard";
import { PromoteToAdminModal } from "./PromoteToAdminModal";

interface EmployeeListProps {
  employees: Employee[];
  loading: boolean;
  onCreateNew: () => void;
  onEdit: (employee: Employee) => void;
  onViewContract: (employee: Employee) => void;
  onEndContract: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onRefresh?: () => void;
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
  onRefresh,
}: EmployeeListProps) {
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [contractTypeFilter, setContractTypeFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [employeeToPromote, setEmployeeToPromote] = useState<Employee | null>(
    null,
  );

  const filteredEmployees = filterEmployees(employees, {
    search,
    showArchived,
    contractType: contractTypeFilter || undefined,
    role: roleFilter || undefined,
  }).filter((emp) => {
    // Masquer l'employé dev
    return (
      !emp.email.toLowerCase().includes("dev@") &&
      emp.email !== "dev@coworkingcafe.com"
    );
  });

  const handlePromoteToAdmin = (employee: Employee) => {
    setEmployeeToPromote(employee);
    setPromoteModalOpen(true);
  };

  const handleConfirmPromotion = async (
    employeeId: string,
    newRole: EmployeeRole,
    pin: string,
  ) => {
    try {
      const response = await fetch(`/api/hr/employees/${employeeId}/promote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newRole, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Erreur lors de la promotion");
      }

      toast.success(data.message || "Employé promu avec succès");

      // Refresh employee list
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la promotion",
      );
      throw error;
    }
  };

  if (loading) {
    return <LoadingSkeleton variant="card" count={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        {/* <div>
          <h2 className="text-2xl font-bold tracking-tight">Employés</h2>
          <p className="text-sm text-muted-foreground">
            {filteredEmployees.length} employé{filteredEmployees.length > 1 ? "s" : ""}
          </p>
        </div> */}
      </div>

      {/* Filtres */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
        <Select
          value={contractTypeFilter}
          onValueChange={setContractTypeFilter}
        >
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

        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvel Employé
        </Button>
      </div>

      {/* Liste des employés */}
      {filteredEmployees.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            {showArchived ? "Aucun employé archivé" : "Aucun employé trouvé"}
          </p>
          {!showArchived && (
            <Button onClick={onCreateNew} variant="outline" className="mt-4">
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
              onPromoteToAdmin={handlePromoteToAdmin}
              showArchived={showArchived}
            />
          ))}
        </div>
      )}

      {/* Promotion Modal */}
      {employeeToPromote && (
        <PromoteToAdminModal
          isOpen={promoteModalOpen}
          employee={employeeToPromote}
          onClose={() => {
            setPromoteModalOpen(false);
            setEmployeeToPromote(null);
          }}
          onConfirm={handleConfirmPromotion}
        />
      )}
    </div>
  );
}
