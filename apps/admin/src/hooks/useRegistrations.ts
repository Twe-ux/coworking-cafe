"use client";

import { useState, useEffect, useCallback } from "react";
import type { RegistrationStatus } from "@coworking-cafe/database";

export interface RegistrationItem {
  _id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
  status: RegistrationStatus;
  registeredAt: string;
  createdAt: string;
}

interface EventSummary {
  _id: string;
  title: string;
  date: string;
  startTime?: string;
  maxParticipants?: number;
  currentParticipants?: number;
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

export function useRegistrations(eventId: string) {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [event, setEvent] = useState<EventSummary | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "all">("all");
  const [search, setSearch] = useState("");

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (search) {
        params.set("search", search);
      }

      const response = await fetch(`/api/events/${eventId}/registrations?${params}`);
      const data = await response.json();

      if (data.success) {
        setRegistrations(data.data.registrations || []);
        setEvent(data.data.event || null);
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
        text: "Erreur lors du chargement des inscriptions",
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, pagination.page, pagination.limit, statusFilter, search]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleStatusChange = async (registrationId: string, newStatus: RegistrationStatus) => {
    try {
      const response = await fetch(`/api/events/${eventId}/registrations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Statut mis à jour" });
        fetchRegistrations();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la mise à jour",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
    }
  };

  const handleDelete = async (registrationId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/registrations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });
      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Inscription supprimée" });
        fetchRegistrations();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la suppression",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la suppression" });
    }
  };

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const exportCSV = () => {
    if (registrations.length === 0) return;

    const headers = ["Prénom", "Nom", "Email", "Téléphone", "Message", "Statut", "Date inscription"];
    const rows = registrations.map((r) => [
      r.firstName,
      r.lastName,
      r.email,
      r.phone || "",
      r.message || "",
      r.status,
      new Date(r.registeredAt).toLocaleDateString("fr-FR"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inscriptions-${event?.title || eventId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    registrations,
    event,
    pagination,
    loading,
    message,
    setMessage,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    handleStatusChange,
    handleDelete,
    setPage,
    exportCSV,
  };
}
