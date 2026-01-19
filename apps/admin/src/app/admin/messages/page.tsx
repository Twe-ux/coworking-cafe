"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, HeadphonesIcon } from "lucide-react";
import Link from "next/link";
import { useUnreadContactMessages } from "@/hooks/useUnreadContactMessages";

export default function MessagesPage() {
  const { unreadCount } = useUnreadContactMessages();
  return (
    <div className="space-y-8">
      <div className="px-4 md:px-0">
        <h1 className="text-2xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Gestion des messages de contact, messagerie et support client
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
        <Link href="/admin/messages/contact" className="relative">
          <Button
            variant="outline"
            className="h-32 w-full flex flex-col gap-2 hover:bg-accent"
          >
            <Mail className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold">Messages de Contact</span>
            <span className="text-sm text-muted-foreground">
              Gérer les demandes de contact
            </span>
          </Button>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{unreadCount}</span>
            </span>
          )}
        </Link>

        {/* Placeholder pour futures sections */}
        <Button
          variant="outline"
          className="h-32 w-full flex flex-col gap-2 opacity-50 cursor-not-allowed"
          disabled
        >
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
          <span className="text-lg font-semibold">Messagerie</span>
          <span className="text-sm text-muted-foreground">
            À venir prochainement
          </span>
        </Button>

        <Button
          variant="outline"
          className="h-32 w-full flex flex-col gap-2 opacity-50 cursor-not-allowed"
          disabled
        >
          <HeadphonesIcon className="h-8 w-8 text-muted-foreground" />
          <span className="text-lg font-semibold">Support Client</span>
          <span className="text-sm text-muted-foreground">
            À venir prochainement
          </span>
        </Button>
      </div>
    </div>
  );
}
