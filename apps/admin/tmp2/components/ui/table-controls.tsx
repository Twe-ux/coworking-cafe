"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Filter, RefreshCw, Search } from "lucide-react";

// Types pour les contrôles de table
export type TableFilterProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
};

export type TableActionsProps = {
  onRefresh?: () => void;
  onExport?: () => void;
  onFilter?: () => void;
  showRefresh?: boolean;
  showExport?: boolean;
  showFilter?: boolean;
  customActions?: React.ReactNode;
};

export type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
};

// Composant de recherche pour les tables
export function TableSearch({
  searchValue,
  onSearchChange,
  placeholder = "Rechercher...",
}: TableFilterProps) {
  return (
    <div className="relative max-w-sm">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

// Actions de table (refresh, export, filter)
export function TableActions({
  onRefresh,
  onExport,
  onFilter,
  showRefresh = true,
  showExport = true,
  showFilter = true,
  customActions,
}: TableActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {showRefresh && onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      )}

      {showExport && onExport && (
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      )}

      {showFilter && onFilter && (
        <Button variant="outline" size="sm" onClick={onFilter}>
          <Filter className="mr-2 h-4 w-4" />
          Filtrer
        </Button>
      )}

      {customActions}
    </div>
  );
}

// Pagination pour les tables
export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Sélecteur de taille de page */}
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Lignes par page</Label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border-input ring-offset-background focus:ring-ring h-8 w-[70px] rounded border bg-transparent px-3 py-1 text-sm focus:ring-2 focus:outline-none"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Informations de pagination */}
        <div className="text-muted-foreground text-sm">
          {startItem}-{endItem} sur {totalItems} élément(s)
        </div>
      </div>

      {/* Contrôles de navigation */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          Premier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Précédent
        </Button>

        {/* Numéros de page */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="h-8 w-8 p-0"
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Suivant
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Dernier
        </Button>
      </div>
    </div>
  );
}

// En-tête de table avec titre et actions
export function TableHeader({
  title,
  description,
  search,
  actions,
  className,
}: {
  title: string;
  description?: string;
  search?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between space-y-2 ${className || ""}`}
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {search}
        {actions}
      </div>
    </div>
  );
}

// État de chargement pour les tables
export function TableSkeleton({
  columns = 5,
  rows = 10,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="bg-muted h-4 flex-1 animate-pulse rounded"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// État vide pour les tables
export function TableEmpty({
  message = "Aucune donnée disponible",
  action,
}: {
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-muted-foreground mb-4">{message}</div>
      {action}
    </div>
  );
}
