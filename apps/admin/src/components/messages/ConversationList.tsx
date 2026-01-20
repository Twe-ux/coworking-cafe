import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import type { Conversation } from "@/types/messages"

interface ConversationListProps {
  conversations: Conversation[]
  activeConversationId?: string
  onSelectConversation: (conversationId: string) => void
  currentUserId?: string
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUserId,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filtrer les conversations par recherche
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations

    const query = searchQuery.toLowerCase()
    return conversations.filter((conversation) => {
      if (conversation.type === "group") {
        return conversation.name?.toLowerCase().includes(query)
      } else {
        // Conversation directe: chercher dans le nom du participant
        const otherParticipant = conversation.participants.find(
          (p) => p.user._id !== currentUserId
        )
        return otherParticipant?.user.name?.toLowerCase().includes(query)
      }
    })
  }, [conversations, searchQuery, currentUserId])

  // Formater l'heure du dernier message
  const formatTime = (dateString?: string): string => {
    if (!dateString) return ""

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) {
      return `${diffMins}min`
    }

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) {
      return `${diffHours}h`
    }

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) {
      return `${diffDays}j`
    }

    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
  }

  // Obtenir le nom à afficher pour une conversation
  const getConversationName = (conversation: Conversation): string => {
    if (conversation.type === "group") {
      return conversation.name || "Groupe"
    }

    const otherParticipant = conversation.participants.find(
      (p) => p.user._id !== currentUserId
    )
    return otherParticipant?.user.name || "Utilisateur"
  }

  // Obtenir l'avatar à afficher
  const getConversationAvatar = (conversation: Conversation): string | undefined => {
    if (conversation.type === "group") {
      return conversation.avatar
    }

    const otherParticipant = conversation.participants.find(
      (p) => p.user._id !== currentUserId
    )
    return otherParticipant?.user.avatar
  }

  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Obtenir le unreadCount pour l'utilisateur courant
  const getUnreadCount = (conversation: Conversation): number => {
    const participant = conversation.participants.find(
      (p) => p.user._id === currentUserId
    )
    return participant?.unreadCount || 0
  }

  return (
    <div className="flex flex-col h-full border-r">
      {/* Header avec recherche */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Liste des conversations */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Aucune conversation trouvée" : "Aucune conversation"}
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const isActive = conversation._id === activeConversationId
              const unreadCount = getUnreadCount(conversation)
              const name = getConversationName(conversation)
              const avatar = getConversationAvatar(conversation)

              return (
                <button
                  key={conversation._id}
                  onClick={() => conversation._id && onSelectConversation(conversation._id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                    hover:bg-muted/50
                    ${isActive ? "bg-muted" : ""}
                  `}
                >
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                  </Avatar>

                  {/* Infos */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium truncate ${unreadCount > 0 ? "font-semibold" : ""}`}>
                        {name}
                      </span>
                      {conversation.lastMessageAt && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {conversation.lastMessage && (
                        <p className={`text-sm truncate ${unreadCount > 0 ? "font-medium" : "text-muted-foreground"}`}>
                          {conversation.lastMessage.content}
                        </p>
                      )}

                      {unreadCount > 0 && (
                        <Badge variant="default" className="ml-auto flex-shrink-0">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
