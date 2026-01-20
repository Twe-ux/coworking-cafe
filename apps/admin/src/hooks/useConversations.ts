import { useState, useEffect, useCallback } from "react"
import type { Conversation, Message } from "@/types/messages"

interface UseConversationsReturn {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Message[]
  loading: boolean
  loadingMessages: boolean
  error: string | null
  selectConversation: (conversationId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  markAsRead: (conversationId: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Récupérer toutes les conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/conversations")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur lors du chargement")
      }

      setConversations(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }, [])

  // Sélectionner une conversation et charger ses messages
  const selectConversation = useCallback(async (conversationId: string) => {
    try {
      setLoadingMessages(true)
      setError(null)

      // Trouver la conversation dans la liste
      const conv = conversations.find((c) => c._id === conversationId)
      if (conv) {
        setActiveConversation(conv)
      }

      // Charger les messages
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur lors du chargement des messages")
      }

      setMessages((data.data || []).reverse())

      // Marquer comme lu
      await markAsRead(conversationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoadingMessages(false)
    }
  }, [conversations])

  // Envoyer un message
  const sendMessage = useCallback(async (content: string) => {
    if (!activeConversation) {
      setError("Aucune conversation sélectionnée")
      return
    }

    try {
      setError(null)

      const response = await fetch(`/api/conversations/${activeConversation._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de l'envoi")
      }

      // Ajouter le message à la liste
      setMessages((prev) => [...prev, data.data])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    }
  }, [activeConversation])

  // Marquer une conversation comme lue
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: "POST",
      })
    } catch (err) {
      console.error("Erreur marquage comme lu:", err)
    }
  }, [])

  // Charger les conversations au montage
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    loadingMessages,
    error,
    selectConversation,
    sendMessage,
    markAsRead,
    refetch: fetchConversations,
  }
}
