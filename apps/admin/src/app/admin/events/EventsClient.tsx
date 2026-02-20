"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StyledAlert } from "@/components/ui/styled-alert";
import { Plus, X } from "lucide-react";
import { EventsTable } from "@/components/events/EventsTable";
import { EventsFilters } from "@/components/events/EventsFilters";
import { EventsTableSkeleton } from "@/components/events/EventsTableSkeleton";
import { DeleteEventDialog } from "@/components/events/DeleteEventDialog";
import { useEvents } from "@/hooks/useEvents";

export function EventsClient() {
  const router = useRouter();
  const {
    events,
    pagination,
    loading,
    message,
    setMessage,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    deleteDialogOpen,
    eventToDelete,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleStatusToggle,
    handleArchive,
    setPage,
  } = useEvents();

  if (loading && events.length === 0) {
    return <EventsTableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Événements</h1>
          <p className="text-muted-foreground">
            Gérer les événements du site public
          </p>
        </div>
        <Button onClick={() => router.push("/admin/events/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Créer un événement
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className="relative">
          <StyledAlert variant={message.type === "success" ? "success" : "destructive"}>
            {message.text}
          </StyledAlert>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => setMessage(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Filters */}
      <EventsFilters
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* Table */}
      <EventsTable
        events={events}
        loading={loading}
        onEdit={(eventId) => router.push(`/admin/events/${eventId}/edit`)}
        onDuplicate={(eventId) => router.push(`/admin/events/duplicate/${eventId}`)}
        onArchive={handleArchive}
        onDelete={handleDeleteClick}
        onStatusToggle={handleStatusToggle}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPage(pagination.page - 1)}
          >
            Précédent
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPage(pagination.page + 1)}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteEventDialog
        open={deleteDialogOpen}
        event={eventToDelete}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
