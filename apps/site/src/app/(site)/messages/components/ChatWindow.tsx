"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Image from "next/image";
import { useChatContext } from "@/context/useChatContext";
import { timeSince } from "@/utils/date";
import avatar1 from "@/assets/dashboard/images/users/avatar-1.jpg";
import "./typing-indicator.css";

interface ChatWindowProps {
  onBack?: () => void;
}

const messageSchema = yup.object({
  message: yup.string().required("Veuillez entrer un message"),
});

export default function ChatWindow({ onBack }: ChatWindowProps) {
  const {
    activeConversation,
    messages,
    loadingMessages,
    sendMessage,
    typingUsers,
    setIsTyping,
  } = useChatContext();

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    resolver: yupResolver(messageSchema),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageValue = watch("message");

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (messageValue && messageValue.length > 0) {
      // User is typing
      setIsTyping(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    } else {
      // User stopped typing
      setIsTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageValue, setIsTyping]);

  if (!activeConversation) {
    return null;
  }

  // Get conversation display info
  const getConversationInfo = () => {
    if (activeConversation.type === "group") {
      return {
        name: activeConversation.name || "Groupe",
        avatar: activeConversation.avatar || avatar1,
      };
    }
    const otherParticipant = activeConversation.participants.find(
      (p) => p.user._id !== activeConversation.participants[0]?.user._id
    );
    return {
      name: otherParticipant?.user.name || "Utilisateur",
      avatar: otherParticipant?.user.avatar || avatar1,
    };
  };

  const { name, avatar } = getConversationInfo();
  const currentUserId = activeConversation.participants[0]?.user._id;

  const onSubmit = async (data: { message: string }) => {
    if (!data.message.trim() || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(data.message.trim());
      reset();
    } catch (error) {
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-window d-flex flex-column" style={{ height: "700px" }}>
      {/* Header */}
      <div className="border-bottom p-3 bg-light">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-link d-lg-none p-0 me-3"
            onClick={onBack}
          >
            <i className="bi bi-arrow-left fs-4"></i>
          </button>
          <Image
            src={avatar}
            alt={name}
            width={40}
            height={40}
            className="rounded-circle me-3"
            style={{ objectFit: "cover" }}
          />
          <div className="flex-grow-1">
            <h6 className="mb-0">{name}</h6>
            <small className="text-muted">
              {activeConversation.type === "group"
                ? `${activeConversation.participants.length} participants`
                : "Conversation directe"}
            </small>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-3" style={{ backgroundColor: "#f8f9fa" }}>
        {loadingMessages ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-chat-dots display-4 text-muted"></i>
            <p className="text-muted mt-3">Aucun message</p>
            <p className="text-muted small">
              Envoyez un message pour commencer la conversation
            </p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => {
              const isOwnMessage = message.sender._id === currentUserId;
              const senderAvatar = message.sender.avatar || avatar1;

              return (
                <div
                  key={message._id}
                  className={`d-flex mb-3 ${
                    isOwnMessage ? "justify-content-end" : "justify-content-start"
                  }`}
                >
                  {!isOwnMessage && (
                    <Image
                      src={senderAvatar}
                      alt={message.sender.name}
                      width={32}
                      height={32}
                      className="rounded-circle me-2"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                  <div
                    className={`message-bubble ${
                      isOwnMessage ? "text-end" : ""
                    }`}
                    style={{ maxWidth: "70%" }}
                  >
                    {!isOwnMessage && (
                      <div className="mb-1">
                        <small className="text-muted fw-bold">
                          {message.sender.name}
                        </small>
                      </div>
                    )}
                    <div
                      className={`p-2 rounded ${
                        isOwnMessage
                          ? "bg-primary text-white"
                          : "bg-white border"
                      }`}
                    >
                      <p className="mb-0">{message.content}</p>
                    </div>
                    <div className="mt-1">
                      <small className="text-muted">
                        {timeSince(new Date(message.createdAt))}
                        {isOwnMessage && (
                          <>
                            {" "}
                            <i
                              className={`bi ${
                                message.status === "read"
                                  ? "bi-check-all text-primary"
                                  : "bi-check-all"
                              }`}
                            ></i>
                          </>
                        )}
                      </small>
                    </div>
                  </div>
                  {isOwnMessage && (
                    <Image
                      src={senderAvatar}
                      alt={message.sender.name}
                      width={32}
                      height={32}
                      className="rounded-circle ms-2"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="d-flex mb-3 justify-content-start">
                <div className="message-bubble">
                  <div className="p-2 rounded bg-white border">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <small className="text-muted">En train d'écrire...</small>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-top p-3 bg-white">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <input
              type="text"
              className={`form-control ${errors.message ? "is-invalid" : ""}`}
              placeholder="Tapez votre message..."
              {...register("message")}
              disabled={isSending}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSending}
            >
              {isSending ? (
                <span className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Envoi...</span>
                </span>
              ) : (
                <i className="bi bi-send"></i>
              )}
            </button>
          </div>
          {errors.message && (
            <div className="invalid-feedback d-block">
              {errors.message.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
