"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChatProvider } from "@/context/useChatContext";
import MessagingInterface from "./components/MessagingInterface";

export default function MessagesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/messages");
    }
  }, [sessionStatus, router]);

  if (sessionStatus === "loading") {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <ChatProvider>
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <h1 className="h3 mb-4">
              <i className="bi bi-chat-dots me-2"></i>
              Messagerie
            </h1>
            <MessagingInterface />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
