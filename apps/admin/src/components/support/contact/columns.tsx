"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Trash2 } from "lucide-react";
import type { ContactMail } from "@/types/contactMail";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

/**
 * Colonnes de la DataTable pour les messages de contact
 */
export const columns: ColumnDef<ContactMail>[] = [
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.original.status;

      const statusConfig = {
        unread: {
          label: "Non lu",
          className: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
        },
        read: {
          label: "Lu",
          className: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
        },
        replied: {
          label: "Répondu",
          className: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
        },
        archived: {
          label: "Archivé",
          className: "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200",
        },
      };

      const config = statusConfig[status] || {
        label: status,
        className: "",
      };

      return (
        <Badge
          variant="outline"
          className={cn(config.className)}
        >
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "subject",
    header: "Sujet",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">{row.original.subject}</div>
    ),
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <div className="max-w-[400px] truncate text-sm text-muted-foreground">
        {row.original.message}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Reçu",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      const relative = formatDistanceToNow(date, {
        addSuffix: true,
        locale: fr,
      });
      return (
        <span className="text-sm text-muted-foreground" title={date.toLocaleString("fr-FR")}>
          {relative}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onView?: (message: ContactMail) => void;
        onReply?: (message: ContactMail) => void;
        onDelete?: (id: string) => void;
      };

      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              meta?.onReply?.(row.original);
            }}
          >
            <Mail className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              meta?.onDelete?.(row.original.id);
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      );
    },
  },
];
