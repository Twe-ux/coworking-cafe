import { Calendar, Building2, Clock } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function BookingPage() {
  const bookingModules = [
    {
      title: "Espaces de réunion",
      description: "Configuration des espaces réservables",
      icon: Building2,
      href: "/admin/booking/spaces",
    },
    {
      title: "Réservations",
      description: "Gérer les réservations clients",
      icon: Calendar,
      href: "/admin/booking/reservations",
    },
    {
      title: "Calendrier",
      description: "Vue calendrier mensuel des réservations",
      icon: Clock,
      href: "/admin/booking/calendar",
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookingModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <module.icon className="w-8 h-8 text-primary" />
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
