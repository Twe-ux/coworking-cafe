import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, Plus } from "lucide-react";

interface ReservationsHeaderProps {
  onCreateClick: () => void;
}

export function ReservationsHeader({ onCreateClick }: ReservationsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="w-8 h-8" />
          Réservations
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérer les réservations clients
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle réservation
        </Button>
        <Link href="/admin/booking/agenda">
          <Button variant="outline">
            <CalendarDays className="w-4 h-4 mr-2" />
            Voir l'agenda
          </Button>
        </Link>
      </div>
    </div>
  );
}
