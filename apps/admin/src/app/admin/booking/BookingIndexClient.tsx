"use client";

import { Building2, Calendar, Clock, Settings } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";

export function BookingIndexClient() {
  const { counts } = useSidebarCounts();

  const bookingModules = [
    {
      title: "Réservations",
      description: "Gérer les réservations clients",
      icon: Calendar,
      href: "/admin/booking/reservations",
      badge:
        counts.pendingBookings > 0 ? counts.pendingBookings : undefined,
    },
    {
      title: "Agenda",
      description: "Vue agenda mensuel des réservations",
      icon: Clock,
      href: "/admin/booking/agenda",
    },
    {
      title: "Espaces de réunion",
      description: "Configuration des espaces réservables",
      icon: Building2,
      href: "/admin/booking/spaces",
    },
    {
      title: "Settings",
      description: "Paramètre des conditions de réservation",
      icon: Settings,
      href: "/admin/booking/settings",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Booking</h1>
        <p className="text-muted-foreground mt-2">
          Gestion des espaces et réservations
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bookingModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <module.icon className="w-8 h-8 text-primary" />
                    {module.badge && (
                      <Badge
                        variant="destructive"
                        className="h-5 min-w-5 flex items-center justify-center"
                      >
                        {module.badge}
                      </Badge>
                    )}
                  </div>
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
