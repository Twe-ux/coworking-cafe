import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

// Types génériques pour les tables de données
export interface DataTableState<TData = any> {
  selectedRow: TData | null;
  isDialogOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface DataTableActions<TData = any> {
  setSelectedRow: (row: TData | null) => void;
  openDialog: (row?: TData) => void;
  closeDialog: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onAdd?: () => void;
  loading?: boolean;
  error?: string | null;
}

// Hook pour gérer l'état des tables de données
export function useDataTable<TData = any>() {
  const [state, setState] = React.useState<DataTableState<TData>>({
    selectedRow: null,
    isDialogOpen: false,
    isLoading: false,
    error: null,
  });

  const actions: DataTableActions<TData> = {
    setSelectedRow: (row) =>
      setState((prev) => ({ ...prev, selectedRow: row })),

    openDialog: (row) =>
      setState((prev) => ({
        ...prev,
        selectedRow: row || null,
        isDialogOpen: true,
      })),

    closeDialog: () =>
      setState((prev) => ({
        ...prev,
        isDialogOpen: false,
        selectedRow: null,
      })),

    setLoading: (loading) =>
      setState((prev) => ({ ...prev, isLoading: loading })),

    setError: (error) => setState((prev) => ({ ...prev, error })),
  };

  return { state, actions };
}

// Hook pour la configuration TanStack Table
export function useReactDataTable<TData, TValue>(
  data: TData[],
  columns: ColumnDef<TData, TValue>[],
) {
  return useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
}

// Hook pour gérer les actions CRUD
export function useDataTableCRUD<TData = any>(
  onEdit?: (row: TData) => void,
  onDelete?: (row: TData) => void,
  onAdd?: () => void,
) {
  const handleEdit = React.useCallback(
    (row: TData) => {
      console.log("Édition:", row);
      onEdit?.(row);
    },
    [onEdit],
  );

  const handleDelete = React.useCallback(
    (row: TData) => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
        console.log("Suppression:", row);
        onDelete?.(row);
      }
    },
    [onDelete],
  );

  const handleAdd = React.useCallback(() => {
    console.log("Ajout d'un nouvel élément");
    onAdd?.();
  }, [onAdd]);

  return { handleEdit, handleDelete, handleAdd };
}

// Hook pour la gestion des formulaires dans les modals
export function useDataTableForm<TFormData = any>(
  initialData?: TFormData,
  onSubmit?: (data: TFormData) => void | Promise<void>,
) {
  const [formData, setFormData] = React.useState<TFormData>(
    initialData || ({} as TFormData),
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const updateField = React.useCallback(
    (field: keyof TFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Effacer l'erreur du champ modifié
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    },
    [errors],
  );

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isSubmitting) return;

      setIsSubmitting(true);
      setErrors({});

      try {
        await onSubmit?.(formData);
      } catch (error) {
        console.error("Erreur lors de la soumission:", error);
        setErrors({ submit: "Une erreur est survenue lors de la soumission" });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSubmit, isSubmitting],
  );

  const resetForm = React.useCallback(() => {
    setFormData(initialData || ({} as TFormData));
    setErrors({});
  }, [initialData]);

  // Mettre à jour le formulaire quand les données initiales changent
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  return {
    formData,
    setFormData,
    updateField,
    handleSubmit,
    resetForm,
    isSubmitting,
    errors,
    setErrors,
  };
}

// Utilitaires pour les formatages communs
export const dataTableUtils = {
  formatDate: (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR");
  },

  formatDateTime: (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("fr-FR");
  },

  formatCurrency: (amount: number | string, currency = "€"): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return `0,00 ${currency}`;

    return (
      num.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + ` ${currency}`
    );
  },

  truncateText: (text: string, maxLength = 50): string => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  },

  getStatusBadge: (status: string): { variant: string; label: string } => {
    switch (status?.toLowerCase()) {
      case "active":
      case "actif":
        return { variant: "success", label: "Actif" };
      case "inactive":
      case "inactif":
        return { variant: "secondary", label: "Inactif" };
      case "pending":
      case "en_attente":
        return { variant: "warning", label: "En attente" };
      case "error":
      case "erreur":
        return { variant: "destructive", label: "Erreur" };
      default:
        return { variant: "default", label: status || "Inconnu" };
    }
  },

  sortData: <T>(
    data: T[],
    key: keyof T,
    direction: "asc" | "desc" = "asc",
  ): T[] => {
    return [...data].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  },

  filterData: <T>(
    data: T[],
    searchTerm: string,
    searchFields: (keyof T)[],
  ): T[] => {
    if (!searchTerm.trim()) return data;

    const term = searchTerm.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return String(value).toLowerCase().includes(term);
      }),
    );
  },
};

// Types utilitaires pour les exports
export type DataTableHookResult<T> = ReturnType<typeof useDataTable<T>>;
export type DataTableFormHookResult<T> = ReturnType<typeof useDataTableForm<T>>;
export type DataTableCRUDHookResult<T> = ReturnType<typeof useDataTableCRUD<T>>;
