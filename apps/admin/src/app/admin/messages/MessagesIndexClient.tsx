"use client";

import { MessageCircle, Mail, HelpCircle, CalendarOff } from "lucide-react";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUnreadContactMessages } from "@/hooks/useUnreadContactMessages";
import { usePendingUnavailabilities } from "@/hooks/usePendingUnavailabilities";

export function MessagesIndexClient() {
  const { unreadCount } = useUnreadContactMessages();
  const { pendingCount } = usePendingUnavailabilities();

  const modules = [
    {
      title: "Demandes d'indisponibilité",
      description: "Approuver ou refuser les demandes de congés et absences",
      icon: CalendarOff,
      href: "/admin/messages/unavailability-requests",
      stats: "En attente",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      title: "Contact",
      description: "Consulter les demandes de contact des clients",
      icon: Mail,
      href: "/admin/messages/contact",
      stats: "Messages entrants",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      title: "Support",
      description: "Gérer les tickets de support client",
      icon: HelpCircle,
      href: "/admin/messages/support",
      stats: "À venir",
    },
    {
      title: "Messenger",
      description: "Messagerie interne entre staff et admin",
      icon: MessageCircle,
      href: "/admin/messages/messenger",
      stats: "Conversations",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-2">
          Gestion de la communication avec les clients et l'équipe
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <module.icon className="w-8 h-8 text-primary" />
                    {module.badge && (
                      <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center">
                        {module.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{module.stats}</span>
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
