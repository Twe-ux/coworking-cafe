import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { Message } from "@/types/messages"

interface MessageAreaProps {
  messages: Message[]
  loading: boolean
  currentUserId?: string
}

export function MessageArea({ messages, loading, currentUserId }: MessageAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas quand nouveaux messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Formater l'heure
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Formater la date complète pour les séparateurs
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui"
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return "Hier"
    }

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Vérifier si on doit afficher un séparateur de date
  const shouldShowDateSeparator = (currentMessage: Message, previousMessage?: Message): boolean => {
    if (!previousMessage) return true

    const currentDate = new Date(currentMessage.createdAt).toDateString()
    const previousDate = new Date(previousMessage.createdAt).toDateString()

    return currentDate !== previousDate
  }

  // Obtenir les initiales
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full max-w-md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Aucun message</p>
          <p className="text-sm mt-2">Envoyez un message pour démarrer la conversation</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isCurrentUser = message.sender._id === currentUserId
          const showDateSeparator = shouldShowDateSeparator(message, messages[index - 1])

          return (
            <div key={message._id}>
              {/* Séparateur de date */}
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {formatDate(message.createdAt)}
                  </div>
                </div>
              )}

              {/* Message */}
              <div className={`flex items-start gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                {!isCurrentUser && (
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                    <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
                  </Avatar>
                )}

                {/* Bulle de message */}
                <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[70%]`}>
                  {/* Nom de l'expéditeur */}
                  {!isCurrentUser && (
                    <span className="text-xs text-muted-foreground mb-1 px-1">
                      {message.sender.name}
                    </span>
                  )}

                  {/* Contenu */}
                  <div
                    className={`
                      rounded-lg px-4 py-2 break-words
                      ${
                        isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }
                    `}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Heure */}
                  <span className="text-xs text-muted-foreground mt-1 px-1">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
