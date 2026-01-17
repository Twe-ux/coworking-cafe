"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/support/contact/data-table";
import { columns } from "@/components/support/contact/columns";
import { ContactMessageDialog } from "@/components/support/contact/ContactMessageDialog";
import { ContactPageSkeleton } from "./ContactPageSkeleton";
import { useContactMessages } from "@/hooks/useContactMessages";
import { toast } from "sonner";
import type { ContactMail, ContactMailStatus } from "@/types/contactMail";
import {
  Mail,
  MailOpen,
  MessageSquare,
  Archive,
  Inbox,
} from "lucide-react";

/**
 * Composant client pour la page de gestion des messages de contact
 */
export function ContactPageClient() {
  const [statusFilter, setStatusFilter] = useState<
    ContactMailStatus | "all"
  >("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMail | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const { messages, loading, stats, fetchMessages } =
    useContactMessages(statusFilter);

  const handleView = async (message: ContactMail) => {
    setSelectedMessage(message);
    setDialogOpen(true);

    if (message.status === "unread") {
      try {
        const response = await fetch(`/api/support/contact/${message.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "read" }),
        });

        const data = await response.json();

        if (data.success) {
          fetchMessages();
        }
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce message ?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/support/contact/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      toast.success("Message supprimé avec succès");
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Erreur lors de la suppression du message");
    }
  };

  // Afficher le skeleton pendant le chargement initial
  if (loading) {
    return <ContactPageSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messages de Contact</h1>

        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as ContactMailStatus | "all")
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les messages</SelectItem>
            <SelectItem value="unread">Non lus</SelectItem>
            <SelectItem value="read">Lus</SelectItem>
            <SelectItem value="replied">Répondus</SelectItem>
            <SelectItem value="archived">Archivés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Inbox className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non lus</CardTitle>
            <Mail className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lus</CardTitle>
            <MailOpen className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.read}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Répondus</CardTitle>
            <MessageSquare className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.replied}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivés</CardTitle>
            <Archive className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={messages}
            onView={handleView}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Dialog */}
      <ContactMessageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        message={selectedMessage}
        onUpdate={fetchMessages}
      />
    </div>
  );
}
