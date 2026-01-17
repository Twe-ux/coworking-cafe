import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Mail, CheckCircle, XCircle } from "lucide-react";
import type { User } from "@/types/user";

interface UsersTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Aucun utilisateur trouvé</p>
      </div>
    );
  }

  const getRoleBadgeVariant = (slug: string) => {
    switch (slug) {
      case "dev":
        return "default";
      case "admin":
        return "secondary";
      case "staff":
        return "outline";
      case "client":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Newsletter</TableHead>
            <TableHead>Vérifié</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              {/* Email */}
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {user.email}
                </div>
              </TableCell>

              {/* Nom */}
              <TableCell>
                {user.givenName || user.username || "-"}
              </TableCell>

              {/* Rôle */}
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role.slug)}>
                  {user.role.name}
                </Badge>
              </TableCell>

              {/* Newsletter */}
              <TableCell>
                {user.newsletter ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </TableCell>

              {/* Vérifié */}
              <TableCell>
                {user.isEmailVerified ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Vérifié
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Non vérifié
                  </Badge>
                )}
              </TableCell>

              {/* Statut */}
              <TableCell>
                {user.isActive ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Actif
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Supprimé
                  </Badge>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && user.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(user.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
