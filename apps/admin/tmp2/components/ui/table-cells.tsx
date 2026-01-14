"use client";

import { Button } from "@/components/ui/button";
import {
  AmountDisplay,
  DateDisplay,
  LabelAmountList,
} from "@/components/ui/data-display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";

// Types pour les cellules de tableau
export type TableCellProps = {
  value: any;
  row?: any;
  className?: string;
};

export type ActionsCellProps = {
  row: any;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: any) => void;
    variant?: "default" | "destructive";
  }>;
};

// Formateur de montants réutilisable
export const AmountFormatter = new Intl.NumberFormat("fr", {
  style: "currency",
  currency: "EUR",
});

// Cellule de date formatée
export function DateCell({ value, className }: TableCellProps) {
  if (!value) return <div className={className}>-</div>;

  return (
    <div className={`text-center ${className || ""}`}>
      <DateDisplay date={value} />
    </div>
  );
}

// Cellule de montant formaté
export function AmountCell({ value, className }: TableCellProps) {
  return (
    <div className={`text-right ${className || ""}`}>
      <AmountDisplay amount={value || 0} />
    </div>
  );
}

// Cellule pour les objets de montants avec différents taux (TVA, HT)
export function TaxRatesCell({ value, className }: TableCellProps) {
  if (!value || typeof value !== "object") {
    return (
      <div className={`text-center ${className || ""}`}>
        <AmountDisplay amount={value || 0} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className || ""}`}>
      {Object.entries(value)
        .filter(([, amount]) => amount !== null && amount !== undefined)
        .sort(
          ([a], [b]) =>
            parseFloat(a.replace(",", ".")) - parseFloat(b.replace(",", ".")),
        )
        .map(([rate, amount]) => (
          <div key={rate} className="flex min-w-24 gap-1">
            <span className="min-w-10 text-right font-bold">{rate}% :</span>
            <span className="min-w-16 text-right font-medium">
              <AmountDisplay amount={amount as number} />
            </span>
          </div>
        ))}
    </div>
  );
}

// Cellule pour les listes de prestations/dépenses
export function ItemListCell({
  value,
  className,
  emptyMessage = "Aucune donnée",
}: TableCellProps & { emptyMessage?: string }) {
  if (!Array.isArray(value) || value.length === 0) {
    return (
      <div className={`text-muted-foreground text-center ${className || ""}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`text-right ${className || ""}`}>
      <LabelAmountList entries={value} emptyMessage={emptyMessage} />
    </div>
  );
}

// Cellule de texte simple avec formatage optionnel
export function TextCell({
  value,
  className,
  format,
}: TableCellProps & {
  format?: "uppercase" | "lowercase" | "capitalize" | "number";
}) {
  if (value === null || value === undefined) {
    return <div className={className}>-</div>;
  }

  let formattedValue = String(value);

  switch (format) {
    case "uppercase":
      formattedValue = formattedValue.toUpperCase();
      break;
    case "lowercase":
      formattedValue = formattedValue.toLowerCase();
      break;
    case "capitalize":
      formattedValue =
        formattedValue.charAt(0).toUpperCase() + formattedValue.slice(1);
      break;
    case "number":
      formattedValue = Number(value).toLocaleString("fr-FR");
      break;
  }

  return <div className={className}>{formattedValue}</div>;
}

// Cellule d'actions avec menu dropdown
export function ActionsCell({
  row,
  onEdit,
  onDelete,
  onView,
  customActions = [],
}: ActionsCellProps) {
  const hasDefaultActions = onEdit || onDelete || onView;
  const hasActions = hasDefaultActions || customActions.length > 0;

  if (!hasActions) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={() => onView(row)}>
            <Eye className="mr-2 h-4 w-4" />
            Voir
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(row)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
        )}
        {customActions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => action.onClick(row)}
            className={action.variant === "destructive" ? "text-red-600" : ""}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </DropdownMenuItem>
        ))}
        {onDelete && (
          <>
            {(hasDefaultActions || customActions.length > 0) && (
              <div className="my-1 border-t" />
            )}
            <DropdownMenuItem
              onClick={() => onDelete(row)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Cellule de badge/statut
export function StatusCell({
  value,
  className,
  statusMap = {},
}: TableCellProps & {
  statusMap?: Record<
    string,
    { label: string; variant: string; className?: string }
  >;
}) {
  const status = statusMap[value] || { label: value, variant: "default" };

  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <div className={className}>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[status.variant as keyof typeof variantClasses] || variantClasses.default} ${status.className || ""} `}
      >
        {status.label}
      </span>
    </div>
  );
}

// Utilitaires pour créer des colonnes rapidement
export const columnUtils = {
  // Colonne de date
  dateColumn: (accessorKey: string, header: string = "Date") => ({
    accessorKey,
    header,
    cell: ({ row }: any) => <DateCell value={row.original[accessorKey]} />,
  }),

  // Colonne de montant
  amountColumn: (accessorKey: string, header: string) => ({
    accessorKey,
    header,
    cell: ({ row }: any) => <AmountCell value={row.original[accessorKey]} />,
  }),

  // Colonne de taux de TVA
  taxRatesColumn: (accessorKey: string, header: string) => ({
    accessorKey,
    header,
    cell: ({ row }: any) => <TaxRatesCell value={row.original[accessorKey]} />,
  }),

  // Colonne de liste d'items
  itemListColumn: (
    accessorKey: string,
    header: string,
    emptyMessage?: string,
  ) => ({
    accessorKey,
    header,
    cell: ({ row }: any) => (
      <ItemListCell
        value={row.original[accessorKey]}
        emptyMessage={emptyMessage}
      />
    ),
  }),

  // Colonne de texte
  textColumn: (
    accessorKey: string,
    header: string,
    format?: "uppercase" | "lowercase" | "capitalize" | "number",
  ) => ({
    accessorKey,
    header,
    cell: ({ row }: any) => (
      <TextCell value={row.original[accessorKey]} format={format} />
    ),
  }),

  // Colonne d'actions
  actionsColumn: (actions: Omit<ActionsCellProps, "row">) => ({
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => <ActionsCell row={row.original} {...actions} />,
  }),

  // Colonne de statut
  statusColumn: (
    accessorKey: string,
    header: string,
    statusMap: Record<
      string,
      { label: string; variant: string; className?: string }
    >,
  ) => ({
    accessorKey,
    header,
    cell: ({ row }: any) => (
      <StatusCell value={row.original[accessorKey]} statusMap={statusMap} />
    ),
  }),
};
