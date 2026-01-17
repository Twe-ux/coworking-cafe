"use client";

import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, HeadphonesIcon } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <div className="px-4 md:px-0">
        <h1 className="text-2xl font-bold mb-2">Support & Messages</h1>
        <p className="text-muted-foreground">
          Gestion des messages de contact et du support client
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
        <Link href="/support/contact">
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
