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

  const getAccountBadge = (user: User) => {
    // Newsletter uniquement (standalone newsletter entry)
    if (user.role.slug === "newsletter-only") {
      return {
        variant: "default" as const,
        className: "bg-violet-100 text-violet-700 border-violet-300 hover:bg-violet-100",
        text: "Newsletter uniquement"
      };
    }

    // Compte avec newsletter (user account with newsletter subscribed)
    if (user.newsletter) {
      return {
        variant: "default" as const,
        className: "bg-green-100 text-green-700 border-green-300 hover:bg-green-100",
        text: "Compte"
      };
    }

    // Compte sans newsletter (user account without newsletter)
    return {
      variant: "default" as const,
      className: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-100",
      text: "Compte"
    };
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Email</TableHead>
            <TableHead className="text-center">Nom</TableHead>
            <TableHead className="text-center">Type de compte</TableHead>
            <TableHead className="text-center">Newsletter</TableHead>
            <TableHead className="text-center">Vérifié</TableHead>
            <TableHead className="text-center">Statut</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              {/* Email */}
              <TableCell className="font-medium text-center">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {user.email}
                </div>
              </TableCell>

              {/* Nom */}
              <TableCell className="text-center">
                {user.givenName || user.username || "-"}
              </TableCell>

              {/* Type de compte */}
              <TableCell className="text-center">
                {(() => {
                  const badge = getAccountBadge(user);
                  return (
                    <Badge variant={badge.variant} className={badge.className}>
                      {badge.text}
                    </Badge>
                  );
                })()}
              </TableCell>

              {/* Newsletter */}
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  {user.newsletter ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </TableCell>

              {/* Vérifié */}
              <TableCell className="text-center">
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
              <TableCell className="text-center">
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
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
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
