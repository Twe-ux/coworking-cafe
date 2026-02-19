"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StyledAlert } from "@/components/ui/styled-alert";
import { Plus, X } from "lucide-react";
import { EventsTable } from "@/components/events/EventsTable";
import { EventsFilters } from "@/components/events/EventsFilters";
import { EventsTableSkeleton } from "@/components/events/EventsTableSkeleton";
import { DeleteEventDialog } from "@/components/events/DeleteEventDialog";
import type { EventStatus } from "@coworking-cafe/database";

interface EventItem {
  _id: string;
  title: string;
  slug: string;
  date: string;
  startTime?: string;
  category: string[];
  imgSrc: string;
  status: EventStatus;
  registrationType: "internal" | "external";
  maxParticipants?: number;
  currentParticipants?: number;
  createdBy?: {
    givenName?: string;
    familyName?: string;
  };
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function EventsClient() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (categoryFilter) {
        params.set("category", categoryFilter);
      }

      const response = await fetch(`/api/events?${params}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data.events || []);
        setPagination(data.data.pagination);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du chargement",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des événements",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, statusFilter, categoryFilter]);

  const handleCreateClick = () => {
    router.push("/events/create");
  };

  const handleEditClick = (eventId: string) => {
    router.push(`/events/${eventId}/edit`);
  };

  const handleDeleteClick = (event: EventItem) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/events/${eventToDelete._id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Événement supprimé avec succès",
        });
        setDeleteDialogOpen(false);
        setEventToDelete(null);
        fetchEvents();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la suppression",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de la suppression de l'événement",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = async (eventId: string, currentStatus: EventStatus) => {
    const newStatus: EventStatus = currentStatus === "published" ? "draft" : "published";

    try {
      const response = await fetch(`/api/events/${eventId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `Événement ${newStatus === "published" ? "publié" : "mis en brouillon"}`,
        });
        fetchEvents();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du changement de statut",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors du changement de statut",
      });
    }
  };

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
        <Button onClick={handleCreateClick}>
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
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onStatusToggle={handleStatusToggle}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          >
            Précédent
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
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
        onCancel={() => {
          setDeleteDialogOpen(false);
          setEventToDelete(null);
        }}
      />
    </div>
  );
}
