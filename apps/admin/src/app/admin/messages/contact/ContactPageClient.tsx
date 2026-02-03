"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/messages/contact/data-table";
import { columns } from "@/components/messages/contact/columns";
import { ContactMessageDialog } from "@/components/messages/contact/ContactMessageDialog";
import { ContactPageSkeleton } from "./ContactPageSkeleton";
import { useContactMessages } from "@/hooks/useContactMessages";
import { toast } from "sonner";
import type { ContactMail, ContactMailStatus } from "@/types/contactMail";
import type { RowSelectionState } from "@tanstack/react-table";
import {
  Mail,
  MailOpen,
  MessageSquare,
  Archive,
  Inbox,
  Trash2,
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
  const [openInReplyMode, setOpenInReplyMode] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { messages, loading, stats, fetchMessages } =
    useContactMessages(statusFilter);

  // Obtenir les messages sélectionnés
  const selectedMessages = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((index) => messages[parseInt(index)]);

  const handleView = async (message: ContactMail) => {
    // Mettre à jour localement le message pour éviter le flash
    const updatedMessage = { ...message, status: "read" as const };
    setSelectedMessage(updatedMessage);
    setDialogOpen(true);
    setOpenInReplyMode(false);

    // Marquer comme lu en arrière-plan si nécessaire
    if (message.status === "unread") {
      try {
        await fetch(`/api/messages/contact/${message.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "read" }),
        });
        // Recharger seulement quand le dialog se ferme
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  const handleReply = async (message: ContactMail) => {
    // Mettre à jour localement le message pour éviter le flash
    const updatedMessage = { ...message, status: "read" as const };
    setSelectedMessage(updatedMessage);
    setDialogOpen(true);
    setOpenInReplyMode(true);

    // Marquer comme lu en arrière-plan si nécessaire
    if (message.status === "unread") {
      try {
        await fetch(`/api/messages/contact/${message.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "read" }),
        });
        // Recharger seulement quand le dialog se ferme
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
      const response = await fetch(`/api/messages/contact/${id}`, {
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

  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) return;

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${selectedMessages.length} message(s) ?`
    );

    if (!confirmed) return;

    try {
      // Supprimer tous les messages sélectionnés en parallèle
      const deletePromises = selectedMessages.map((message) =>
        fetch(`/api/messages/contact/${message.id}`, {
          method: "DELETE",
        }).then((res) => res.json())
      );

      const results = await Promise.all(deletePromises);

      const failedCount = results.filter((r) => !r.success).length;

      if (failedCount === 0) {
        toast.success(`${selectedMessages.length} message(s) supprimé(s) avec succès`);
      } else {
        toast.error(
          `${failedCount} message(s) n'ont pas pu être supprimé(s)`
        );
      }

      // Réinitialiser la sélection
      setRowSelection({});
      fetchMessages();
    } catch (error) {
      console.error("Error bulk deleting messages:", error);
      toast.error("Erreur lors de la suppression des messages");
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
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Inbox className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "unread" ? "ring-2 ring-red-500" : ""}`}
          onClick={() => setStatusFilter("unread")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non lus</CardTitle>
            <Mail className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "read" ? "ring-2 ring-blue-500" : ""}`}
          onClick={() => setStatusFilter("read")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lus</CardTitle>
            <MailOpen className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.read}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "replied" ? "ring-2 ring-green-500" : ""}`}
          onClick={() => setStatusFilter("replied")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Répondus</CardTitle>
            <MessageSquare className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.replied}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "archived" ? "ring-2 ring-gray-500" : ""}`}
          onClick={() => setStatusFilter("archived")}
        >
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
          <div className="flex items-center justify-between">
            <CardTitle>Messages</CardTitle>
            {selectedMessages.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer ({selectedMessages.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={messages}
            onView={handleView}
            onReply={handleReply}
            onDelete={handleDelete}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          />
        </CardContent>
      </Card>

      {/* Dialog */}
      <ContactMessageDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setOpenInReplyMode(false);
          // Recharger les messages après fermeture pour avoir les stats à jour
          fetchMessages();
        }}
        message={selectedMessage}
        openInReplyMode={openInReplyMode}
        onUpdate={fetchMessages}
      />
    </div>
  );
}
