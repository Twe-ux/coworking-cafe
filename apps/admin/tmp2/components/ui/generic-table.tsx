"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

// Types pour le système de table générique
export type GenericTableColumn<T = any> = {
  id: string;
  label: string;
  accessor?: keyof T | ((row: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: "left" | "center" | "right";
  type?:
    | "text"
    | "number"
    | "date"
    | "boolean"
    | "currency"
    | "badge"
    | "custom";
  format?: (value: any, row: T) => React.ReactNode;
  cellClassName?: string | ((value: any, row: T) => string);
  headerClassName?: string;
  hidden?: boolean;
  resizable?: boolean;
  sticky?: "left" | "right";
};

export type GenericTableAction<T = any> = {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "secondary" | "ghost" | "destructive";
  onClick: (row: T, index: number) => void;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  color?: string;
};

export type GenericTableFilter = {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "number" | "boolean";
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: any;
};

export type GenericTableConfig<T = any> = {
  columns: GenericTableColumn<T>[];
  actions?: GenericTableAction<T>[];
  filters?: GenericTableFilter[];
  pagination?: {
    pageSize: number;
    showSizeSelector?: boolean;
    pageSizeOptions?: number[];
  };
  sorting?: {
    defaultSort?: { column: string; direction: "asc" | "desc" };
    multiSort?: boolean;
  };
  selection?: {
    enabled: boolean;
    onSelectionChange?: (selectedRows: T[]) => void;
  };
  search?: {
    enabled: boolean;
    placeholder?: string;
    searchableColumns?: string[];
  };
  export?: {
    enabled: boolean;
    formats?: ("csv" | "excel" | "pdf")[];
    onExport?: (data: T[], format: string) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
  title?: string;
  description?: string;
  refreshButton?: boolean;
  onRefresh?: () => void;
};

interface GenericTableProps<T = any> {
  data: T[];
  config: GenericTableConfig<T>;
  className?: string;
}

export function GenericTable<T = any>({
  data,
  config,
  className = "",
}: GenericTableProps<T>) {
  // États locaux
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortConfig, setSortConfig] = useState<
    { column: string; direction: "asc" | "desc" }[]
  >(config.sorting?.defaultSort ? [config.sorting.defaultSort] : []);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.pagination?.pageSize || 10);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Données filtrées et triées
  const processedData = useMemo(() => {
    let result = [...data];

    // Recherche textuelle
    if (config.search?.enabled && searchTerm) {
      const searchableColumns =
        config.search.searchableColumns ||
        config.columns
          .filter((col) => col.filterable !== false)
          .map((col) => col.id);

      result = result.filter((row: any) =>
        searchableColumns.some((columnId) => {
          const column = config.columns.find((col) => col.id === columnId);
          if (!column) return false;

          const value = column.accessor
            ? typeof column.accessor === "function"
              ? column.accessor(row)
              : row[column.accessor]
            : row[columnId];

          return String(value || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        }),
      );
    }

    // Filtres avancés
    Object.entries(filters).forEach(([filterId, filterValue]) => {
      if (
        filterValue === "" ||
        filterValue === null ||
        filterValue === undefined
      )
        return;

      const column = config.columns.find((col) => col.id === filterId);
      if (!column) return;

      result = result.filter((row: any) => {
        const value = column.accessor
          ? typeof column.accessor === "function"
            ? column.accessor(row)
            : row[column.accessor]
          : row[filterId];

        switch (column.type) {
          case "boolean":
            return Boolean(value) === Boolean(filterValue);
          case "number":
          case "currency":
            return Number(value) === Number(filterValue);
          default:
            return String(value || "")
              .toLowerCase()
              .includes(String(filterValue).toLowerCase());
        }
      });
    });

    // Tri
    sortConfig.forEach(({ column: columnId, direction }) => {
      const column = config.columns.find((col) => col.id === columnId);
      if (!column) return;

      result.sort((a: any, b: any) => {
        const aValue = column.accessor
          ? typeof column.accessor === "function"
            ? column.accessor(a)
            : a[column.accessor]
          : a[columnId];
        const bValue = column.accessor
          ? typeof column.accessor === "function"
            ? column.accessor(b)
            : b[column.accessor]
          : b[columnId];

        let comparison = 0;

        if (column.type === "number" || column.type === "currency") {
          comparison = Number(aValue || 0) - Number(bValue || 0);
        } else if (column.type === "date") {
          comparison =
            new Date(aValue || 0).getTime() - new Date(bValue || 0).getTime();
        } else {
          comparison = String(aValue || "").localeCompare(String(bValue || ""));
        }

        return direction === "desc" ? -comparison : comparison;
      });
    });

    return result;
  }, [data, searchTerm, filters, sortConfig, config]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Gestionnaires d'événements
  const handleSort = (columnId: string) => {
    const column = config.columns.find((col) => col.id === columnId);
    if (!column?.sortable) return;

    setSortConfig((prev) => {
      const existing = prev.find((sort) => sort.column === columnId);

      if (config.sorting?.multiSort) {
        if (existing) {
          if (existing.direction === "asc") {
            return prev.map((sort) =>
              sort.column === columnId
                ? { ...sort, direction: "desc" as const }
                : sort,
            );
          } else {
            return prev.filter((sort) => sort.column !== columnId);
          }
        } else {
          return [...prev, { column: columnId, direction: "asc" as const }];
        }
      } else {
        if (existing) {
          return existing.direction === "asc"
            ? [{ column: columnId, direction: "desc" as const }]
            : [];
        } else {
          return [{ column: columnId, direction: "asc" as const }];
        }
      }
    });
  };

  const handleSelectRow = (index: number, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSelection = new Set(prev);
      if (checked) {
        newSelection.add(index);
      } else {
        newSelection.delete(index);
      }

      if (config.selection?.onSelectionChange) {
        const selectedData = Array.from(newSelection).map(
          (i) => paginatedData[i],
        );
        config.selection.onSelectionChange(selectedData);
      }

      return newSelection;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndexes = paginatedData.map((_, index) => index);
      setSelectedRows(new Set(allIndexes));

      if (config.selection?.onSelectionChange) {
        config.selection.onSelectionChange(paginatedData);
      }
    } else {
      setSelectedRows(new Set());
      if (config.selection?.onSelectionChange) {
        config.selection.onSelectionChange([]);
      }
    }
  };

  // Fonction de rendu de cellule
  const renderCell = (
    column: GenericTableColumn<T>,
    row: T,
    rowIndex: number,
  ) => {
    const value = column.accessor
      ? typeof column.accessor === "function"
        ? column.accessor(row)
        : (row as any)[column.accessor]
      : (row as any)[column.id];

    if (column.format) {
      return column.format(value, row);
    }

    switch (column.type) {
      case "currency":
        return new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(Number(value || 0));

      case "date":
        return value ? new Date(value).toLocaleDateString("fr-FR") : "-";

      case "boolean":
        return value ? (
          <Badge variant="default">Oui</Badge>
        ) : (
          <Badge variant="secondary">Non</Badge>
        );

      case "badge":
        return <Badge variant="outline">{value}</Badge>;

      case "number":
        return Number(value || 0).toLocaleString("fr-FR");

      default:
        return String(value || "");
    }
  };

  return (
    <Card className={className}>
      {(config.title || config.description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {config.title && <CardTitle>{config.title}</CardTitle>}
              {config.description && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {config.description}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {config.refreshButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={config.onRefresh}
                  disabled={config.loading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              {config.export?.enabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    config.export?.onExport?.(processedData, "csv")
                  }
                  disabled={config.loading}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* Barre de recherche et filtres */}
        <div className="space-y-4 border-b p-4">
          <div className="flex flex-wrap gap-4">
            {config.search?.enabled && (
              <div className="relative min-w-64 flex-1">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  type="text"
                  placeholder={config.search.placeholder || "Rechercher..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {config.filters?.map((filter) => (
              <div key={filter.id} className="min-w-48">
                {filter.type === "select" ? (
                  <Select
                    value={filters[filter.id] || ""}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, [filter.id]: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={filter.placeholder || filter.label}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous</SelectItem>
                      {filter.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={filter.type}
                    placeholder={filter.placeholder || filter.label}
                    value={filters[filter.id] || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        [filter.id]: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {/* Informations de résultat */}
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>
              {processedData.length} résultat
              {processedData.length !== 1 ? "s" : ""}
              {processedData.length !== data.length && ` sur ${data.length}`}
            </span>
            {selectedRows.size > 0 && (
              <span>
                {selectedRows.size} élément{selectedRows.size !== 1 ? "s" : ""}{" "}
                sélectionné{selectedRows.size !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {config.selection?.enabled && (
                  <th className="w-12 p-3 text-left">
                    <Checkbox
                      checked={
                        selectedRows.size === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                )}
                {config.columns
                  .filter((col) => !col.hidden)
                  .map((column) => (
                    <th
                      key={column.id}
                      className={`p-3 text-left font-medium ${column.headerClassName || ""}`}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          column.align === "center"
                            ? "justify-center"
                            : column.align === "right"
                              ? "justify-end"
                              : "justify-start"
                        }`}
                      >
                        <span>{column.label}</span>
                        {column.sortable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => handleSort(column.id)}
                          >
                            {(() => {
                              const sort = sortConfig.find(
                                (s) => s.column === column.id,
                              );
                              if (!sort) return <Filter className="h-3 w-3" />;
                              return sort.direction === "asc" ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              );
                            })()}
                          </Button>
                        )}
                      </div>
                    </th>
                  ))}
                {config.actions && config.actions.length > 0 && (
                  <th className="w-24 p-3 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {config.loading ? (
                <tr>
                  <td
                    colSpan={
                      config.columns.filter((col) => !col.hidden).length +
                      (config.selection?.enabled ? 1 : 0) +
                      (config.actions?.length ? 1 : 0)
                    }
                    className="text-muted-foreground p-8 text-center"
                  >
                    Chargement...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      config.columns.filter((col) => !col.hidden).length +
                      (config.selection?.enabled ? 1 : 0) +
                      (config.actions?.length ? 1 : 0)
                    }
                    className="text-muted-foreground p-8 text-center"
                  >
                    {config.emptyMessage || "Aucune donnée disponible"}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-muted/25 border-b transition-colors"
                  >
                    {config.selection?.enabled && (
                      <td className="p-3">
                        <Checkbox
                          checked={selectedRows.has(rowIndex)}
                          onCheckedChange={(checked: boolean) =>
                            handleSelectRow(rowIndex, checked)
                          }
                        />
                      </td>
                    )}
                    {config.columns
                      .filter((col) => !col.hidden)
                      .map((column) => (
                        <td
                          key={column.id}
                          className={`p-3 ${
                            column.align === "center"
                              ? "text-center"
                              : column.align === "right"
                                ? "text-right"
                                : "text-left"
                          } ${
                            typeof column.cellClassName === "function"
                              ? column.cellClassName(
                                  column.accessor
                                    ? typeof column.accessor === "function"
                                      ? column.accessor(row)
                                      : (row as any)[column.accessor]
                                    : (row as any)[column.id],
                                  row,
                                )
                              : column.cellClassName || ""
                          }`}
                        >
                          {renderCell(column, row, rowIndex)}
                        </td>
                      ))}
                    {config.actions && config.actions.length > 0 && (
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {config.actions
                            .filter((action) => !action.hidden?.(row))
                            .map((action) => {
                              const Icon = action.icon || MoreHorizontal;
                              return (
                                <Button
                                  key={action.id}
                                  variant={action.variant || "ghost"}
                                  size="sm"
                                  onClick={() => action.onClick(row, rowIndex)}
                                  disabled={action.disabled?.(row)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Icon className="h-4 w-4" />
                                  <span className="sr-only">
                                    {action.label}
                                  </span>
                                </Button>
                              );
                            })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {config.pagination && totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-4">
            <div className="flex items-center space-x-2">
              {config.pagination.showSizeSelector && (
                <>
                  <span className="text-muted-foreground text-sm">
                    Lignes par page:
                  </span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        config.pagination.pageSizeOptions || [10, 25, 50, 100]
                      ).map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground text-sm">
                Page {currentPage} sur {totalPages}
              </span>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Utilitaires pour créer rapidement des configurations
export function createQuickTableConfig<T>(
  columns: Array<{
    id: keyof T;
    label: string;
    type?: GenericTableColumn<T>["type"];
    sortable?: boolean;
  }>,
  options?: Partial<GenericTableConfig<T>>,
): GenericTableConfig<T> {
  return {
    columns: columns.map((col) => ({
      id: String(col.id),
      label: col.label,
      accessor: col.id,
      type: col.type || "text",
      sortable: col.sortable !== false,
      filterable: true,
    })),
    pagination: { pageSize: 10, showSizeSelector: true },
    search: { enabled: true },
    selection: { enabled: false },
    ...options,
  };
}

// Actions prédéfinies communes
export const commonActions = {
  view: (onClick: (row: any) => void): GenericTableAction => ({
    id: "view",
    label: "Voir",
    icon: Eye,
    variant: "ghost",
    onClick,
  }),

  edit: (onClick: (row: any) => void): GenericTableAction => ({
    id: "edit",
    label: "Modifier",
    icon: Edit,
    variant: "ghost",
    onClick,
  }),

  delete: (onClick: (row: any) => void): GenericTableAction => ({
    id: "delete",
    label: "Supprimer",
    icon: Trash2,
    variant: "ghost",
    onClick,
    color: "destructive",
  }),
};

export default GenericTable;
