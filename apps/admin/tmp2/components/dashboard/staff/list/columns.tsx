"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // Mis à jour vers le format moderne
  mdp: number;
  isActive: boolean; // Mis à jour vers le format moderne
};

export const columns: ColumnDef<Staff>[] = [
  {
    id: "firstName",
    header: "Nom",
    accessorKey: "firstName",
  },
  {
    id: "lastName",
    header: "Prénom",
    accessorKey: "lastName",
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
  },
  {
    id: "phone",
    header: "Téléphone",
    accessorKey: "phone",
  },
  {
    id: "mdp",
    header: "Mot de passe",
    accessorKey: "mdp",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions row={row} />,
  },
];

// Composant séparé pour les actions de cellule (évite les problèmes React Hooks)
function CellActions({ row }: { row: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState(row.original);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Envoyer les données mises à jour à l'API
    fetch(`/api/staff/put`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }).then((res) => res.json());
  };

  const handleSelect = (id: string, value: string | boolean) => {
    setFormData({ ...formData, [id]: value });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            if (navigator?.clipboard) {
              navigator.clipboard.writeText(String(row.original.id));
            }
          }}
        >
          Copier l'ID du staff
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push(`/list/${row.original.id}`)}
        >
          Voir les détails du staff
        </DropdownMenuItem>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Modifier le staff
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Modifier le staff</AlertDialogTitle>
            </AlertDialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium"
                >
                  Nom
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="w-full rounded border p-2"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="lastName" className="block text-sm font-medium">
                  Prénom
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="w-full rounded border p-2"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full rounded border p-2"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium">
                  Téléphone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  className="w-full rounded border p-2"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="mdp"
                  type="password"
                  className="w-full rounded border p-2"
                  value={formData.mdp}
                  onChange={handleChange}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                />
              </div>
              <div className="mb-4">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(v) => handleSelect("isActive", v)}
                  className={cn("data-[state=checked]:bg-(--chart-4)")}
                />
                <span className="ml-2">
                  {formData.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction type="submit">Sauvegarder</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>

        <DropdownMenuItem className="text-red-600">
          Supprimer le staff
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
