"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, X, Users, Search } from "lucide-react";
import { RegistrationsTable } from "@/components/events/RegistrationsTable";
import { useRegistrations } from "@/hooks/useRegistrations";
import type { RegistrationStatus } from "@coworking-cafe/database";

interface RegistrationsClientProps {
  eventId: string;
}

const statusOptions: { value: RegistrationStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "confirmed", label: "Confirmées" },
  { value: "pending", label: "En attente" },
  { value: "cancelled", label: "Annulées" },
];

export function RegistrationsClient({ eventId }: RegistrationsClientProps) {
  const router = useRouter();
  const {
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
  } = useRegistrations(eventId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          onClick={() => router.push("/admin/events")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Inscriptions</h1>
          {event && (
            <div className="mt-2 space-y-1">
              <p className="text-lg text-muted-foreground">{event.title}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {new Date(event.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {event.startTime && <span>{event.startTime}</span>}
              </div>
              {event.maxParticipants && (
                <div className="flex items-center gap-2 mt-2">
                  <Users className="h-4 w-4" />
                  <Badge variant="outline" className="text-sm">
                    {event.currentParticipants || 0} / {event.maxParticipants} inscrits
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
          onClick={exportCSV}
          disabled={registrations.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`relative p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
            onClick={() => setMessage(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Status filter */}
        <div className="flex gap-1">
          {statusOptions.map((opt) => (
            <Button
              key={opt.value}
              variant="outline"
              className={statusFilter === opt.value ? "border-green-500 bg-green-50 text-green-700" : "border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"}
              size="sm"
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-md bg-background"
          />
        </div>

        {/* Count */}
        <span className="text-sm text-muted-foreground ml-auto">
          {pagination.total} inscription{pagination.total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {loading && registrations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <RegistrationsTable
          registrations={registrations}
          loading={loading}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            disabled={pagination.page <= 1}
            onClick={() => setPage(pagination.page - 1)}
          >
            Précédent
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage(pagination.page + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
