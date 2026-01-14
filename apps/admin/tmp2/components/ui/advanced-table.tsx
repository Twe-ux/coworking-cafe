/**
 * Advanced Table System - Configuration-driven table management
 * Migrates and enhances existing data-table-components.tsx (364 lines → ~200 lines expected)
 *
 * Features:
 * - Declarative configuration
 * - Built-in pagination, search, filtering
 * - Export functionality (PDF, CSV, Excel)
 * - Advanced column types (actions, status, amount, date, image, etc.)
 * - Real-time updates and loading states
 * - Responsive design with mobile optimization
 * - Accessibility compliance
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader as UITableHeader,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowUpDown,
  ChevronDown,
  Download,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import * as React from "react";

// Types pour la configuration des colonnes
export interface TableColumnConfig<TData = any> {
  id: string;
  label: string;
  type:
    | "text"
    | "number"
    | "currency"
    | "date"
    | "datetime"
    | "status"
    | "badge"
    | "actions"
    | "image"
    | "email"
    | "url"
    | "boolean";
  accessor?: keyof TData | ((row: TData) => any);
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  format?: (value: any) => string;

  // Configuration spécifique par type
  statusConfig?: {
    options: Array<{
      value: string;
      label: string;
      variant: string;
      color?: string;
    }>;
  };
  actionsConfig?: {
    onView?: (row: TData) => void;
    onEdit?: (row: TData) => void;
    onDelete?: (row: TData) => void;
    customActions?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: (row: TData) => void;
      variant?: "default" | "destructive" | "outline" | "secondary";
      condition?: (row: TData) => boolean;
    }>;
  };
  currencyConfig?: {
    currency?: string;
    decimals?: number;
  };
  imageConfig?: {
    width?: number;
    height?: number;
    fallback?: string;
  };
}

// Configuration principale de la table
export interface AdvancedTableConfig<TData = any> {
  columns: TableColumnConfig<TData>[];
  data: TData[];

  // Options de base
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;

  // Fonctionnalités
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  exportable?: boolean;
  exportFormats?: ("csv" | "excel" | "pdf")[];

  // Actions globales
  onAdd?: () => void;
  addButtonLabel?: string;
  onBulkDelete?: (selectedRows: TData[]) => void;
  onRefresh?: () => void;

  // Événements
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (selectedRows: TData[]) => void;

  // Style et responsive
  className?: string;
  density?: "compact" | "normal" | "comfortable";
  responsive?: boolean;
  mobileBreakpoint?: number;
}

// Composant principal AdvancedTable
export function AdvancedTable<TData = any>({
  columns: columnsConfig,
  data,
  title,
  description,
  loading = false,
  error = null,
  emptyMessage = "Aucune donnée disponible",
  searchable = true,
  searchPlaceholder = "Rechercher...",
  filterable = false,
  sortable = true,
  selectable = false,
  paginated = true,
  pageSize = 10,
  exportable = false,
  exportFormats = ["csv", "excel", "pdf"],
  onAdd,
  addButtonLabel = "Ajouter",
  onBulkDelete,
  onRefresh,
  onRowClick,
  onSelectionChange,
  className,
  density = "normal",
  responsive = true,
  mobileBreakpoint = 768,
}: AdvancedTableConfig<TData>) {
  // États de la table
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Responsive hook
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (responsive) {
      const checkMobile = () =>
        setIsMobile(window.innerWidth < mobileBreakpoint);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, [responsive, mobileBreakpoint]);

  // Construction des colonnes TanStack
  const columns = React.useMemo<ColumnDef<TData>[]>(() => {
    const cols: ColumnDef<TData>[] = [];

    // Colonne de sélection
    if (selectable) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Sélectionner tout"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Sélectionner cette ligne"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      });
    }

    // Colonnes configurées
    columnsConfig.forEach((colConfig) => {
      if (colConfig.visible === false) return;

      cols.push({
        id: colConfig.id,
        accessorKey:
          typeof colConfig.accessor === "string"
            ? colConfig.accessor
            : undefined,
        accessorFn:
          typeof colConfig.accessor === "function"
            ? colConfig.accessor
            : undefined,
        header: ({ column }) => (
          <div
            className={cn(
              "flex items-center space-x-1",
              colConfig.align === "center" && "justify-center",
              colConfig.align === "right" && "justify-end",
            )}
          >
            <span>{colConfig.label}</span>
            {sortable && colConfig.sortable !== false && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            )}
          </div>
        ),
        cell: ({ row, getValue }) => {
          const value = getValue();
          return renderCellContent(value, colConfig, row.original);
        },
        enableSorting: sortable && colConfig.sortable !== false,
        enableHiding: true,
        size: colConfig.width ? parseInt(colConfig.width) : undefined,
      });
    });

    return cols;
  }, [columnsConfig, selectable, sortable]);

  // Configuration de la table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: paginated ? getPaginationRowModel() : undefined,
    getSortedRowModel: sortable ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
    initialState: {
      pagination: { pageSize },
    },
  });

  // Gestion de la sélection
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  // Fonctions utilitaires
  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    const { useAdvancedExport, ExportButton } = await import(
      "./advanced-export"
    );

    const exportColumns = columnsConfig
      .filter((col) => col.visible !== false && col.type !== "actions")
      .map((col) => ({
        id: col.id,
        label: col.label,
        width: col.width ? parseInt(col.width) : undefined,
        align: col.align,
        format: col.format,
        type:
          col.type === "currency"
            ? ("currency" as const)
            : col.type === "date" || col.type === "datetime"
              ? ("date" as const)
              : col.type === "number"
                ? ("number" as const)
                : col.type === "boolean"
                  ? ("boolean" as const)
                  : ("text" as const),
      }));

    const exporter = new (await import("./advanced-export")).default({
      filename: title?.replace(/\s+/g, "_").toLowerCase() || "export",
      title,
      subtitle: description,
      columns: exportColumns,
      data: table.getFilteredRowModel().rows.map((row) => row.original),
      includeHeader: true,
      includeFooter: true,
      company: "Coworking Café",
    });

    try {
      await exporter.export(format);
    } catch (error) {
      console.error("Erreur d'export:", error);
    }
  };

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  // Interface mobile simplifiée
  if (isMobile && responsive) {
    return (
      <MobileTableView
        data={data}
        columns={columnsConfig}
        loading={loading}
        error={error}
        emptyMessage={emptyMessage}
        onRowClick={onRowClick}
      />
    );
  }

  // Rendu de la table
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <TableHeader
        title={title}
        description={description}
        onAdd={onAdd}
        addButtonLabel={addButtonLabel}
        onRefresh={onRefresh}
        searchable={searchable}
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder={searchPlaceholder}
        exportable={exportable}
        exportFormats={exportFormats}
        onExport={handleExport}
        selectedCount={selectedRowsCount}
        onBulkDelete={
          onBulkDelete
            ? () => {
                const selectedRows = table
                  .getFilteredSelectedRowModel()
                  .rows.map((row) => row.original);
                onBulkDelete(selectedRows);
              }
            : undefined
        }
        table={table}
      />

      {/* Table */}
      <TableContent
        table={table}
        loading={loading}
        error={error}
        emptyMessage={emptyMessage}
        density={density}
        onRowClick={onRowClick}
      />

      {/* Pagination */}
      {paginated && <TablePagination table={table} />}
    </div>
  );
}

// Composant pour le rendu du contenu de cellule
function renderCellContent<TData>(
  value: any,
  config: TableColumnConfig<TData>,
  row: TData,
) {
  switch (config.type) {
    case "currency":
      const { currency = "€", decimals = 2 } = config.currencyConfig || {};
      return (
        <span className="text-right font-mono">
          {typeof value === "number" ? value.toFixed(decimals) : "0.00"}{" "}
          {currency}
        </span>
      );

    case "date":
      return new Date(value).toLocaleDateString("fr-FR");

    case "datetime":
      return new Date(value).toLocaleString("fr-FR");

    case "status":
    case "badge":
      const statusOption = config.statusConfig?.options.find(
        (opt) => opt.value === value,
      );
      return (
        <Badge variant={(statusOption?.variant as any) || "default"}>
          {statusOption?.label || value}
        </Badge>
      );

    case "boolean":
      return value ? "✓" : "✗";

    case "email":
      return (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      );

    case "url":
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Lien
        </a>
      );

    case "image":
      const {
        width = 40,
        height = 40,
        fallback = "",
      } = config.imageConfig || {};
      return (
        <img
          src={value || fallback}
          alt=""
          width={width}
          height={height}
          className="rounded object-cover"
        />
      );

    case "actions":
      return <TableRowActions row={row} config={config.actionsConfig} />;

    case "number":
      return typeof value === "number" ? value.toLocaleString("fr-FR") : value;

    default:
      if (config.format) {
        return config.format(value);
      }
      return value?.toString() || "";
  }
}

// Composants utilitaires
interface TableHeaderProps {
  title?: string;
  description?: string;
  onAdd?: () => void;
  addButtonLabel?: string;
  onRefresh?: () => void;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  exportable?: boolean;
  exportFormats?: ("csv" | "excel" | "pdf")[];
  onExport?: (format: "csv" | "excel" | "pdf") => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
  table?: any;
}

function TableHeader({
  title,
  description,
  onAdd,
  addButtonLabel,
  onRefresh,
  searchable,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  exportable,
  exportFormats,
  onExport,
  selectedCount,
  onBulkDelete,
  table,
}: TableHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        {title && (
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        )}
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
        {searchable && (
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-64 pl-8"
            />
          </div>
        )}

        {selectedCount && selectedCount > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground text-sm">
              {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
            </span>
            {onBulkDelete && (
              <Button variant="destructive" size="sm" onClick={onBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            )}
          </div>
        )}

        {exportable && exportFormats && exportFormats.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {exportFormats.map((format) => (
                <DropdownMenuItem
                  key={format}
                  onClick={() => onExport?.(format)}
                >
                  {format.toUpperCase()}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Actualiser
          </Button>
        )}

        {onAdd && (
          <Button onClick={onAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

interface TableContentProps {
  table: any;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  density?: "compact" | "normal" | "comfortable";
  onRowClick?: (row: any) => void;
}

function TableContent({
  table,
  loading,
  error,
  emptyMessage,
  density,
  onRowClick,
}: TableContentProps) {
  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 text-destructive flex items-center space-x-2 rounded-md border p-4">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  }

  if (loading) {
    return <TableSkeleton />;
  }

  const paddingClass = {
    compact: "p-1",
    normal: "p-2",
    comfortable: "p-4",
  }[density || "normal"];

  return (
    <div className="rounded-md border">
      <Table>
        <UITableHeader>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => (
                <TableHead key={header.id} className={paddingClass}>
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
        </UITableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row: any) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={onRowClick ? "hover:bg-muted/50 cursor-pointer" : ""}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell key={cell.id} className={paddingClass}>
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

function TablePagination({ table }: { table: any }) {
  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="text-muted-foreground text-sm">
        {table.getFilteredSelectedRowModel().rows.length} sur{" "}
        {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Lignes par page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} sur{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Aller à la page précédente</span>
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Aller à la page suivante</span>
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <UITableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </UITableHeader>
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

function TableRowActions<TData>({
  row,
  config,
}: {
  row: TData;
  config?: TableColumnConfig<TData>["actionsConfig"];
}) {
  if (!config) return null;

  const { onView, onEdit, onDelete, customActions = [] } = config;
  const visibleActions = customActions.filter(
    (action) => !action.condition || action.condition(row),
  );

  return (
    <div className="flex items-center space-x-1">
      {onView && (
        <Button variant="ghost" size="sm" onClick={() => onView(row)}>
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="sm" onClick={() => onDelete(row)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      {visibleActions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "ghost"}
          size="sm"
          onClick={() => action.onClick(row)}
        >
          {action.icon}
        </Button>
      ))}
    </div>
  );
}

function MobileTableView<TData>({
  data,
  columns,
  loading,
  error,
  emptyMessage,
  onRowClick,
}: {
  data: TData[];
  columns: TableColumnConfig<TData>[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
}) {
  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 text-destructive flex items-center space-x-2 rounded-md border p-4">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border p-4">
            <Skeleton className="mb-2 h-4 w-3/4" />
            <Skeleton className="mb-1 h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        {emptyMessage}
      </div>
    );
  }

  const visibleColumns = columns.filter((col) => col.visible !== false);

  return (
    <div className="space-y-4">
      {data.map((row, index) => (
        <div
          key={index}
          className={cn(
            "space-y-2 rounded-lg border p-4",
            onRowClick && "hover:bg-muted/50 cursor-pointer",
          )}
          onClick={() => onRowClick?.(row)}
        >
          {visibleColumns.map((column) => {
            const value =
              typeof column.accessor === "function"
                ? column.accessor(row)
                : (row as any)[column.accessor as string];

            return (
              <div
                key={column.id}
                className="flex items-center justify-between"
              >
                <span className="text-muted-foreground text-sm font-medium">
                  {column.label}:
                </span>
                <span className="text-sm">
                  {renderCellContent(value, column, row)}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Export des types et utilitaires (éviter les conflits)
export type {
  TableColumnConfig as AdvancedTableColumnConfig,
  AdvancedTableConfig as AdvancedTableConfiguration,
};
