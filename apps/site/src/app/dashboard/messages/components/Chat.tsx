import IconifyIcon from "@/components/dashboard/wrappers/IconifyIcon";
import SimplebarReactClient from "@/components/dashboard/wrappers/SimplebarReactClient";
import type { Conversation } from "@/context/useChatContext";
import { timeSince } from "@/utils/date";
import Image from "next/image";
import Link from "next/link";

import avatar1 from "@/assets/dashboard/images/users/avatar-1.jpg";

type ChatProps = {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onConversationSelect: (conversationId: string) => void;
};

const Chat = ({ conversations, activeConversation, onConversationSelect }: ChatProps) => {
  // Helper to get conversation display info
  const getConversationInfo = (conv: Conversation) => {
    if (conv.type === "group") {
      return {
        name: conv.name || "Groupe sans nom",
        avatar: conv.avatar || avatar1,
      };
    }

    // For direct chat, get the other participant
    const otherParticipant = conv.participants.find(
      (p) => p.user._id !== conv.participants[0]?.user._id // TODO: use actual current user ID
    );

    return {
      name: otherParticipant?.user.name || "Utilisateur inconnu",
      avatar: otherParticipant?.user.avatar || avatar1,
    };
  };

  // Get current user's unread count for a conversation
  const getUnreadCount = (conv: Conversation) => {
    const currentUserParticipant = conv.participants.find(
      (p) => p.user._id === conv.participants[0]?.user._id // TODO: use actual current user ID
    );
    return currentUserParticipant?.unreadCount || 0;
  };

  return (
    <SimplebarReactClient className="px-2 mb-3 chat-setting-height">
      {conversations.map((conv, idx) => {
        const { name, avatar } = getConversationInfo(conv);
        const unreadCount = getUnreadCount(conv);
        const isActive = activeConversation?._id === conv._id;

        return (
          <div
            className={`d-flex flex-column h-100 ${
              conversations.length - 1 != idx && "border-bottom"
            }`}
            key={conv._id}
          >
            <Link href="" className="d-block">
              <div
                className={`d-flex align-items-center px-2 pb-2 mb-1 ${
                  idx == 0 ? "" : "p-2"
                } rounded ${isActive ? "bg-light" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  onConversationSelect(conv._id);
                }}
              >
                <div className="position-relative">
                  <Image
                    src={avatar}
                    alt="avatar"
                    className="avatar rounded-circle flex-shrink-0"
                    width={40}
                    height={40}
                  />
                  {unreadCount > 0 && (
                    <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-light border-2 rounded-circle">
                      <span className="visually-hidden">New messages</span>
                    </span>
                  )}
                </div>
                <div className="d-block ms-3 flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5 className="mb-0">{name}</h5>
                    <div>
                      {conv.lastMessageAt && (
                        <p className="text-muted fs-13 mb-0">
                          {timeSince(new Date(conv.lastMessageAt))}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="mb-0 text-muted d-flex align-items-center gap-1 text-truncate">
                      {conv.lastMessage?.content || "Aucun message"}
                    </p>
                    <div className="d-flex align-items-center gap-1">
                      {unreadCount > 0 && (
                        <span className="badge bg-danger rounded-pill">
                          {unreadCount}
                        </span>
                      )}
                      {conv.lastMessage && (
                        <IconifyIcon
                          icon={
                            conv.lastMessage.status === "read"
                              ? "ri:check-double-line"
                              : "ri:check-line"
                          }
                          className={`fs-18 ${
                            conv.lastMessage.status === "read"
                              ? "text-primary"
                              : "text-muted"
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </SimplebarReactClient>
  );
};

export default Chat;
