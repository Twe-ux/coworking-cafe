"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { ContactMail } from "@/types/contactMail";
import { Mail, Phone, Calendar, User, Archive, Trash2, Send, Reply } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactMessageDialogProps {
  open: boolean;
  onClose: () => void;
  message: ContactMail | null;
  onUpdate: () => void;
}

/**
 * Dialog pour afficher le détail d'un message de contact et répondre
 */
export function ContactMessageDialog({
  open,
  onClose,
  message,
  onUpdate,
}: ContactMessageDialogProps) {
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  if (!message) return null;

  const handleReply = async () => {
    if (!reply.trim()) {
      toast.error("La réponse ne peut pas être vide");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/support/contact/${message.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: reply.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de l'envoi de la réponse");
      }

      toast.success("Réponse envoyée avec succès");
      setReply("");
      setShowReplyForm(false);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'envoi"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    try {
      const response = await fetch(`/api/support/contact/${message.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de l'archivage");
      }

      toast.success("Message archivé avec succès");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error archiving message:", error);
      toast.error("Erreur lors de l'archivage");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce message définitivement ?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/support/contact/${message.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      toast.success("Message supprimé avec succès");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const statusConfig = {
    unread: {
      label: "Non lu",
      className: "bg-red-100 text-red-700 border-red-200",
    },
    read: {
      label: "Lu",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    replied: {
      label: "Répondu",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    archived: {
      label: "Archivé",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
  };

  const config = statusConfig[message.status] || {
    label: message.status,
    className: "",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Détails du message</span>
            <Badge variant="outline" className={cn(config.className)}>
              {config.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Boutons d'actions */}
        <div className="flex gap-2 pb-4 border-b">
          {message.status !== "replied" && (
            <Button
              onClick={() => setShowReplyForm(!showReplyForm)}
              variant={showReplyForm ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              <Reply className="w-4 h-4 mr-2" />
              Répondre
            </Button>
          )}
          {message.status !== "archived" && (
            <Button
              onClick={handleArchive}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archiver
            </Button>
          )}
          <Button
            onClick={handleDelete}
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>

        <div className="space-y-4">
          {/* Informations de contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-medium">{message.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{message.email}</p>
              </div>
            </div>

            {message.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{message.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Reçu le</p>
                <p className="font-medium">
                  {new Date(message.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          {/* Sujet */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Sujet</p>
            <p className="font-semibold">{message.subject}</p>
          </div>

          {/* Message */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Message</p>
            <div className="bg-muted p-4 rounded-md">
              <p className="whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>

          {/* Réponse existante */}
          {message.reply && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Réponse envoyée
                {message.repliedAt && (
                  <span className="ml-2">
                    le {new Date(message.repliedAt).toLocaleString("fr-FR")}
                  </span>
                )}
              </p>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                <p className="whitespace-pre-wrap text-sm">{message.reply}</p>
              </div>
            </div>
          )}

          {/* Formulaire de réponse */}
          {showReplyForm && message.status !== "replied" && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Send className="w-4 h-4" />
                <span>Envoyer une réponse par email</span>
              </div>
              <Textarea
                placeholder="Écrivez votre réponse ici...
Elle sera envoyée par email à l'adresse fournie."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={6}
                className="bg-white border-green-300 focus:border-green-500"
              />
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setShowReplyForm(false);
                    setReply("");
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleReply}
                  disabled={isSubmitting || !reply.trim()}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Envoi..." : "Envoyer la réponse"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
