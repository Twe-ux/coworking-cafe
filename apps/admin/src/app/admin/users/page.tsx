"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, UserPlus, Mail, CheckCircle } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { UsersTable } from "@/components/users/UsersTable";
import { UserFilters } from "@/components/users/UserFilters";
import { UsersPageSkeleton } from "./UsersPageSkeleton";
import { toast } from "sonner";
import type { UserFilters as UserFiltersType } from "@/types/user";

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFiltersType>({
    search: "",
    roleSlug: "all",
    isActive: undefined,
    newsletter: undefined,
  });

  const { users, loading, error, refetch, deleteUser } = useUsers(filters);

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
    );

    if (!confirmed) return;

    const success = await deleteUser(userId);
    if (success) {
      toast.success("Utilisateur supprimé avec succès");
    } else {
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
  };

  // Stats calculées
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const verified = users.filter((u) => u.isEmailVerified).length;
    const newsletter = users.filter((u) => u.newsletter).length;

    return { total, active, verified, newsletter };
  }, [users]);

  // Skeleton pendant chargement initial
  if (loading && users.length === 0) {
    return <UsersPageSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérer les utilisateurs de la plateforme
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">utilisateurs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">comptes actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vérifiés</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">emails vérifiés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter</CardTitle>
            <Mail className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newsletter}</div>
            <p className="text-xs text-muted-foreground">inscrits</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Rechercher et filtrer les utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserFilters filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des utilisateurs ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-12 text-destructive">
              <p>Erreur : {error}</p>
              <Button variant="outline" onClick={refetch} className="mt-4">
                Réessayer
              </Button>
            </div>
          ) : (
            <UsersTable
              users={users}
              onEdit={(user) => console.log("Edit user:", user)}
              onDelete={handleDeleteUser}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
