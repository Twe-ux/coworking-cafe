"use client";

import { useState, useEffect, useCallback } from "react";
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

interface Message {
  type: "success" | "error";
  text: string;
}

export function useEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEvents = useCallback(async () => {
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
    } catch {
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des événements",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
        setMessage({ type: "success", text: "Événement supprimé avec succès" });
        setDeleteDialogOpen(false);
        setEventToDelete(null);
        fetchEvents();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la suppression",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erreur lors de la suppression de l'événement",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
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
    } catch {
      setMessage({
        type: "error",
        text: "Erreur lors du changement de statut",
      });
    }
  };

  const handleArchive = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Événement archivé avec succès",
        });
        fetchEvents();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de l'archivage",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erreur lors de l'archivage de l'événement",
      });
    }
  };

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return {
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
  };
}
