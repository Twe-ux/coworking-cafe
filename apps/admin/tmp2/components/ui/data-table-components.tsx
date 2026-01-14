import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dataTableUtils } from "@/hooks/use-data-table";
import { cn } from "@/lib/utils";
import { flexRender, Table as TanStackTable } from "@tanstack/react-table";
import { AlertCircle, Edit, Plus, Trash2 } from "lucide-react";
import * as React from "react";

// Composant principal DataTable modulaire
interface DataTableProps<TData> {
  table: TanStackTable<TData>;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<TData>({
  table,
  loading = false,
  error = null,
  emptyMessage = "Aucune donnée disponible",
  className,
}: DataTableProps<TData>) {
  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 text-destructive flex items-center space-x-2 rounded-md border p-4">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  }

  if (loading) {
    return <DataTableSkeleton />;
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Skeleton pour les tables en cours de chargement
export function DataTableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Composant pour les actions de ligne
interface DataTableRowActionsProps<TData> {
  row: TData;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: TData) => void;
    variant?: "default" | "destructive" | "outline" | "secondary";
  }>;
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
  customActions = [],
}: DataTableRowActionsProps<TData>) {
  return (
    <div className="flex items-center space-x-2">
      {onEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(row)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Modifier</span>
        </Button>
      )}

      {onDelete && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(row)}
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Supprimer</span>
        </Button>
      )}

      {customActions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "outline"}
          size="sm"
          onClick={() => action.onClick(row)}
          className="h-8 w-8 p-0"
        >
          {action.icon}
          <span className="sr-only">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}

// Composant pour afficher les statuts avec badges
interface DataTableStatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function DataTableStatusBadge({
  status,
  variant,
}: DataTableStatusBadgeProps) {
  const statusInfo = dataTableUtils.getStatusBadge(status);
  const badgeVariant = variant || (statusInfo.variant as any);

  return <Badge variant={badgeVariant}>{statusInfo.label}</Badge>;
}

// Composant pour afficher des montants formatés
interface DataTableAmountCellProps {
  amount: number | string;
  currency?: string;
  className?: string;
}

export function DataTableAmountCell({
  amount,
  currency = "€",
  className,
}: DataTableAmountCellProps) {
  const formattedAmount = dataTableUtils.formatCurrency(amount, currency);

  return (
    <span className={cn("text-right font-mono", className)}>
      {formattedAmount}
    </span>
  );
}

// Composant pour afficher des dates formatées
interface DataTableDateCellProps {
  date: string;
  format?: "date" | "datetime";
  className?: string;
}

export function DataTableDateCell({
  date,
  format = "date",
  className,
}: DataTableDateCellProps) {
  const formattedDate =
    format === "datetime"
      ? dataTableUtils.formatDateTime(date)
      : dataTableUtils.formatDate(date);

  return <span className={cn("text-sm", className)}>{formattedDate}</span>;
}

// Composant pour du texte tronqué avec tooltip
interface DataTableTextCellProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function DataTableTextCell({
  text,
  maxLength = 50,
  className,
}: DataTableTextCellProps) {
  const truncatedText = dataTableUtils.truncateText(text, maxLength);
  const isTruncated = text.length > maxLength;

  return (
    <span
      className={cn("text-sm", className)}
      title={isTruncated ? text : undefined}
    >
      {truncatedText}
    </span>
  );
}

// Composant Modal pour les formulaires
interface DataTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function DataTableModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: DataTableModalProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-[425px]", sizeClasses[size])}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Composant Header avec bouton d'ajout
interface DataTableHeaderProps {
  title: string;
  description?: string;
  onAdd?: () => void;
  addButtonLabel?: string;
  children?: React.ReactNode;
}

export function DataTableHeader({
  title,
  description,
  onAdd,
  addButtonLabel = "Ajouter",
  children,
}: DataTableHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      <div className="flex items-center space-x-2">
        {children}
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

// Container principal pour les pages de tables
interface DataTableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableContainer({
  children,
  className,
}: DataTableContainerProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
