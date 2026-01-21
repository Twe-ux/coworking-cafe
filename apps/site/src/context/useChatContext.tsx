"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { ChildrenType } from "../types/component-props";
import type {
  ChatOffcanvasStatesType,
  OffcanvasControlType,
} from "../types/context";

// Types for real messaging
interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Participant {
  user: User;
  joinedAt: string;
  lastReadAt?: string;
  unreadCount: number;
}

interface Message {
  _id: string;
  conversation: string;
  sender: User;
  content: string;
  type: "text" | "image" | "file" | "audio" | "video";
  attachments: Array<{
    url: string;
    type: string;
    name?: string;
    size?: number;
  }>;
  status: "sent" | "delivered" | "read" | "failed";
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface Conversation {
  _id: string;
  type: "direct" | "group";
  participants: Participant[];
  name?: string;
  avatar?: string;
  description?: string;
  createdBy?: string;
  lastMessage?: Message;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface MessagingContextType {
  // Conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  loadingConversations: boolean;

  // Messages
  messages: Message[];
  loadingMessages: boolean;

  // Typing indicators
  typingUsers: string[];
  setIsTyping: (isTyping: boolean) => void;

  // Actions
  fetchConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, type?: Message["type"]) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;

  // Offcanvas states (keep existing functionality)
  chatList: { open: boolean; toggle: () => void };
  chatProfile: { open: boolean; toggle: () => void };
  voiceCall: { open: boolean; toggle: () => void };
  videoCall: { open: boolean; toggle: () => void };
  chatSetting: { open: boolean; toggle: () => void };
}

const MessagingContext = createContext<MessagingContextType | undefined>(
  undefined,
);

export const useChatContext = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useChatContext can only be used within ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }: ChildrenType) => {
  // Data state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Offcanvas states (keep existing)
  const [offcanvasStates, setOffcanvasStates] =
    useState<ChatOffcanvasStatesType>({
      showChatList: false,
      showUserProfile: false,
      showVoiceCall: false,
      showVideoCall: false,
      showUserSetting: false,
    });

  // Toggle functions for offcanvas
  const toggleOffcanvas = (key: keyof ChatOffcanvasStatesType) => {
    setOffcanvasStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const chatList: OffcanvasControlType = {
    open: offcanvasStates.showChatList,
    toggle: () => toggleOffcanvas("showChatList"),
  };

  const chatProfile: OffcanvasControlType = {
    open: offcanvasStates.showUserProfile,
    toggle: () => toggleOffcanvas("showUserProfile"),
  };

  const voiceCall: OffcanvasControlType = {
    open: offcanvasStates.showVoiceCall,
    toggle: () => toggleOffcanvas("showVoiceCall"),
  };

  const videoCall: OffcanvasControlType = {
    open: offcanvasStates.showVideoCall,
    toggle: () => toggleOffcanvas("showVideoCall"),
  };

  const chatSetting: OffcanvasControlType = {
    open: offcanvasStates.showUserSetting,
    toggle: () => toggleOffcanvas("showUserSetting"),
  };

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const response = await fetch("/api/conversations");
      const data = await response.json();

      if (data.success) {
        setConversations(data.data);

        // If no active conversation, select first one
        if (!activeConversation && data.data.length > 0) {
          await selectConversation(data.data[0]._id);
        }
      }
    } catch (error) {
      // Error fetching conversations
    } finally {
      setLoadingConversations(false);
    }
  }, [activeConversation]);

  // Select conversation and fetch messages
  const selectConversation = useCallback(
    async (conversationId: string) => {
      try {
        setLoadingMessages(true);
        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
        );
        const data = await response.json();

        if (data.success) {
          setActiveConversation(
            conversations.find((c) => c._id === conversationId) || null,
          );
          setMessages(data.data);
        }
      } catch (error) {
        // Error selecting conversation
      } finally {
        setLoadingMessages(false);
      }
    },
    [conversations],
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string, type: Message["type"] = "text") => {
      if (!activeConversation) return;

      try {
        const response = await fetch(
          `/api/conversations/${activeConversation._id}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, type }),
          },
        );
        const data = await response.json();

        if (data.success) {
          setMessages((prev) => [...prev, data.data]);
        }
      } catch (error) {
        // Error sending message
      }
    },
    [activeConversation],
  );

  // Mark as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: "POST",
      });
    } catch (error) {
      // Error marking as read
    }
  }, []);

  // Set typing indicator
  const setIsTyping = useCallback((isTyping: boolean) => {
    // Typing indicator logic to be implemented
  }, []);

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        activeConversation,
        loadingConversations,
        messages,
        loadingMessages,
        typingUsers,
        setIsTyping,
        fetchConversations,
        selectConversation,
        sendMessage,
        markAsRead,
        chatList,
        chatProfile,
        videoCall,
        voiceCall,
        chatSetting,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

// Export types
export type { Conversation, Message, User, Participant };
