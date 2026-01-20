"use client"

import { useSession } from "next-auth/react"
import { Mail } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ConversationList } from "@/components/messages/ConversationList"
import { MessageArea } from "@/components/messages/MessageArea"
import { MessageInput } from "@/components/messages/MessageInput"
import { useConversations } from "@/hooks/useConversations"

export function MessagesClient() {
  const { data: session } = useSession()
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    loadingMessages,
    selectConversation,
    sendMessage,
  } = useConversations()

  const currentUserId = session?.user?.id

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail className="w-8 h-8" />
          Messages
        </h1>
        <p className="text-muted-foreground mt-2">
          Messagerie interne
        </p>
      </div>

      <Card className="h-[calc(100vh-250px)]">
        <div className="flex h-full">
          {/* Liste des conversations (sidebar gauche) */}
          <div className="w-80 flex-shrink-0">
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversation?._id}
              onSelectConversation={selectConversation}
              currentUserId={currentUserId}
            />
          </div>

          {/* Zone de messages (droite) */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Header de la conversation */}
                <div className="p-4 border-b">
                  <h2 className="font-semibold">
                    {activeConversation.type === "group"
                      ? activeConversation.name
                      : activeConversation.participants.find(
                          (p) => p.user._id !== currentUserId
                        )?.user.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {activeConversation.type === "group"
                      ? `${activeConversation.participants.length} participants`
                      : activeConversation.participants.find(
                          (p) => p.user._id !== currentUserId
                        )?.user.email}
                  </p>
                </div>

                {/* Messages */}
                <MessageArea
                  messages={messages}
                  loading={loadingMessages}
                  currentUserId={currentUserId}
                />

                {/* Input */}
                <MessageInput onSendMessage={sendMessage} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm mt-2">
                    Choisissez une conversation pour commencer à échanger
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
