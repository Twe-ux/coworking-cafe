import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateAppBadge } from "@/lib/notifications";
import type {
  ContactMail,
  ContactMailStatus,
  ContactMailStats,
} from "@/types/contactMail";

interface UseContactMessagesReturn {
  messages: ContactMail[];
  loading: boolean;
  stats: ContactMailStats;
  fetchMessages: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer les messages de contact
 */
export function useContactMessages(
  statusFilter: ContactMailStatus | "all"
): UseContactMessagesReturn {
  const [messages, setMessages] = useState<ContactMail[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ContactMailStats>({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0,
  });

  const calculateStats = (allMessages: ContactMail[]): ContactMailStats => {
    return {
      total: allMessages.length,
      unread: allMessages.filter((m) => m.status === "unread").length,
      read: allMessages.filter((m) => m.status === "read").length,
      replied: allMessages.filter((m) => m.status === "replied").length,
      archived: allMessages.filter((m) => m.status === "archived").length,
    };
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);

      // Toujours récupérer TOUS les messages pour les stats
      const response = await fetch("/api/messages/contact");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la récupération");
      }

      const allMessages = data.data || [];

      // Calculer les stats sur TOUS les messages
      const newStats = calculateStats(allMessages);
      setStats(newStats);

      // Filtrer les messages côté client selon le filtre
      const filteredMessages =
        statusFilter === "all"
          ? allMessages
          : allMessages.filter((m: ContactMail) => m.status === statusFilter);

      setMessages(filteredMessages);

      // Mettre à jour le badge de l'app avec le nombre de messages non lus
      updateAppBadge(newStats.unread);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erreur lors de la récupération des messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  return {
    messages,
    loading,
    stats,
    fetchMessages,
  };
}
