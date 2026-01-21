"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  useChatContext,
  type Conversation,
} from "../../../../context/useChatContext";
import { timeSince } from "../../../../utils/date";
import avatar1 from "@/assets/dashboard/images/users/avatar-1.jpg";

interface ConversationsListProps {
  onConversationSelect?: () => void;
  onNewConversation?: () => void;
}

export default function ConversationsList({
  onConversationSelect,
  onNewConversation,
}: ConversationsListProps) {
  const { conversations, activeConversation, selectConversation } =
    useChatContext();
  const [searchText, setSearchText] = useState("");

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchText) return conversations;

    return conversations.filter((conv) => {
      if (conv.type === "direct") {
        return conv.participants.some((p) =>
          p.user.name?.toLowerCase().includes(searchText.toLowerCase()),
        );
      }
      return conv.name?.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [conversations, searchText]);

  // Get total unread count
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((sum, conv) => {
      const currentUserParticipant = conv.participants.find(
        (p) => p.user._id === conv.participants[0]?.user._id,
      );
      return sum + (currentUserParticipant?.unreadCount || 0);
    }, 0);
  }, [conversations]);

  const getConversationInfo = (conv: Conversation) => {
    if (conv.type === "group") {
      return {
        name: conv.name || "Groupe",
        avatar: conv.avatar || avatar1,
      };
    }
    const otherParticipant = conv.participants.find(
      (p) => p.user._id !== conv.participants[0]?.user._id,
    );
    return {
      name: otherParticipant?.user.name || "Utilisateur",
      avatar: otherParticipant?.user.avatar || avatar1,
    };
  };

  const getUnreadCount = (conv: Conversation) => {
    const currentUserParticipant = conv.participants.find(
      (p) => p.user._id === conv.participants[0]?.user._id,
    );
    return currentUserParticipant?.unreadCount || 0;
  };

  const handleSelectConversation = async (conversationId: string) => {
    await selectConversation(conversationId);
    onConversationSelect?.();
  };

  return (
    <div className="conversations-list">
      {/* Header with search */}
      <div className="p-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Conversations</h6>
          {onNewConversation && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onNewConversation}
              title="Nouvelle conversation"
            >
              <i className="bi bi-plus-circle"></i>
            </button>
          )}
        </div>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Rechercher..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        {totalUnreadCount > 0 && (
          <div className="mt-2 text-center">
            <span className="badge bg-danger">
              {totalUnreadCount} nouveau{totalUnreadCount > 1 ? "x" : ""}{" "}
              message{totalUnreadCount > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Conversations */}
      <div
        className="conversations-list-body"
        style={{ maxHeight: "600px", overflowY: "auto" }}
      >
        {filteredConversations.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox text-muted display-4"></i>
            <p className="text-muted mt-3">Aucune conversation trouvée</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {filteredConversations.map((conv) => {
              const { name, avatar } = getConversationInfo(conv);
              const unreadCount = getUnreadCount(conv);
              const isActive = activeConversation?._id === conv._id;

              return (
                <button
                  key={conv._id}
                  className={`list-group-item list-group-item-action border-0 ${
                    isActive ? "active" : ""
                  }`}
                  onClick={() => handleSelectConversation(conv._id)}
                >
                  <div className="d-flex align-items-start">
                    <div className="position-relative me-3">
                      <Image
                        src={avatar}
                        alt={name}
                        width={48}
                        height={48}
                        className="rounded-circle"
                        style={{ objectFit: "cover" }}
                      />
                      {unreadCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {unreadCount}
                          <span className="visually-hidden">
                            nouveaux messages
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-0 text-truncate">{name}</h6>
                        {conv.lastMessageAt && (
                          <small className="text-muted ms-2">
                            {timeSince(new Date(conv.lastMessageAt))}
                          </small>
                        )}
                      </div>
                      <p className="mb-0 text-muted text-truncate small">
                        {conv.lastMessage?.content || "Aucun message"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
