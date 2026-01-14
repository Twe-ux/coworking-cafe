"use client";

import {
  DataTable,
  DataTableContainer,
  DataTableHeader,
  DataTableModal,
} from "@/components/ui/data-table-components";
import {
  useDataTable,
  useDataTableCRUD,
  useReactDataTable,
} from "@/hooks/use-data-table";
import { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

// Props pour la DataTable refactorisée
interface RefactoredDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onAdd?: () => void;
  emptyMessage?: string;
  // Props pour le formulaire modal
  formComponent?: React.ComponentType<{
    data?: TData;
    onSubmit: (data: TData) => void | Promise<void>;
    onCancel: () => void;
  }>;
  modalTitle?: string;
  modalSize?: "sm" | "md" | "lg" | "xl";
}

export function RefactoredDataTable<TData, TValue>({
  columns,
  data,
  title = "Données",
  description,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onAdd,
  emptyMessage = "Aucune donnée disponible",
  formComponent: FormComponent,
  modalTitle = "Formulaire",
  modalSize = "md",
}: RefactoredDataTableProps<TData, TValue>) {
  // Hooks pour la gestion de l'état
  const { state, actions } = useDataTable<TData>();
  const table = useReactDataTable(data, columns);
  const { handleEdit, handleDelete, handleAdd } = useDataTableCRUD<TData>(
    onEdit,
    onDelete,
    onAdd,
  );

  // Configuration des actions avec modal
  const handleEditWithModal = React.useCallback(
    (row: TData) => {
      actions.openDialog(row);
      handleEdit(row);
    },
    [actions, handleEdit],
  );

  const handleAddWithModal = React.useCallback(() => {
    actions.openDialog();
    handleAdd();
  }, [actions, handleAdd]);

  const handleFormSubmit = React.useCallback(
    async (formData: TData) => {
      try {
        actions.setLoading(true);

        // Si c'est une édition, on a selectedRow, sinon c'est un ajout
        if (state.selectedRow) {
          await onEdit?.(formData);
        } else {
          await onAdd?.();
        }

        actions.closeDialog();
      } catch (error) {
        console.error("Erreur lors de la soumission:", error);
        actions.setError("Une erreur est survenue lors de la soumission");
      } finally {
        actions.setLoading(false);
      }
    },
    [state.selectedRow, onEdit, onAdd, actions],
  );

  return (
    <DataTableContainer>
      {/* Header avec titre et bouton d'ajout */}
      <DataTableHeader
        title={title}
        description={description}
        onAdd={FormComponent ? handleAddWithModal : onAdd}
        addButtonLabel="Ajouter"
      />

      {/* Table principale */}
      <DataTable
        table={table}
        loading={loading}
        error={error}
        emptyMessage={emptyMessage}
      />

      {/* Modal pour le formulaire */}
      {FormComponent && (
        <DataTableModal
          isOpen={state.isDialogOpen}
          onClose={actions.closeDialog}
          title={
            state.selectedRow
              ? `Modifier ${modalTitle}`
              : `Ajouter ${modalTitle}`
          }
          size={modalSize}
        >
          <FormComponent
            data={state.selectedRow || undefined}
            onSubmit={handleFormSubmit}
            onCancel={actions.closeDialog}
          />
        </DataTableModal>
      )}
    </DataTableContainer>
  );
}

// Version simplifiée pour les cas basiques
interface SimpleDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

export function SimpleDataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage = "Aucune donnée disponible",
}: SimpleDataTableProps<TData, TValue>) {
  const table = useReactDataTable(data, columns);

  return (
    <DataTable
      table={table}
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
    />
  );
}

// Version spécialisée pour Cash Control (compatible avec l'ancien code)
interface CashControlDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  formStatus: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  editingRow?: any;
  onDelete?: (row: TData) => void;
}

export function CashControlDataTable<TData, TValue>({
  columns,
  data,
  form,
  setForm,
  formStatus,
  onSubmit,
  editingRow,
  onDelete,
}: CashControlDataTableProps<TData, TValue>) {
  const { state, actions } = useDataTable<TData>();
  const table = useReactDataTable(data, columns);

  // Gestion de l'ouverture du formulaire
  const handleOpenForm = React.useCallback(
    (row: TData) => {
      actions.setSelectedRow(row);
      actions.openDialog(row);
    },
    [actions],
  );

  // Mise à jour du formulaire basé sur la ligne sélectionnée
  React.useEffect(() => {
    if (state.selectedRow) {
      setForm(state.selectedRow);
    }
  }, [state.selectedRow, setForm]);

  return (
    <DataTableContainer>
      <DataTable
        table={table}
        loading={formStatus === "loading"}
        error={formStatus === "error" ? "Une erreur est survenue" : null}
        emptyMessage="Aucune donnée de contrôle de caisse"
      />

      <DataTableModal
        isOpen={state.isDialogOpen}
        onClose={actions.closeDialog}
        title={state.selectedRow ? "Modifier l'entrée" : "Nouvelle entrée"}
        size="lg"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Ici on peut intégrer le FormCashControl existant */}
          <div className="p-4">
            <p>Formulaire de contrôle de caisse</p>
            {/* FormCashControl component would go here */}
          </div>
        </form>
      </DataTableModal>
    </DataTableContainer>
  );
}

// Export de tous les composants
export {
  useDataTable,
  useDataTableCRUD,
  useDataTableForm,
  useReactDataTable,
} from "@/hooks/use-data-table";

export {
  DataTable,
  DataTableAmountCell,
  DataTableContainer,
  DataTableDateCell,
  DataTableHeader,
  DataTableModal,
  DataTableRowActions,
  DataTableStatusBadge,
  DataTableTextCell,
} from "@/components/ui/data-table-components";

// Types pour l'export
export type {
  CashControlDataTableProps,
  RefactoredDataTableProps,
  SimpleDataTableProps,
};
