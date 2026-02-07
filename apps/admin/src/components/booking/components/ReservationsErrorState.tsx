import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface ReservationsErrorStateProps {
  error: string;
}

export function ReservationsErrorState({
  error,
}: ReservationsErrorStateProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Réservations du jour
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[200px] flex-col items-center justify-center text-destructive">
          <p className="text-sm">Erreur: {error}</p>
        </div>
      </CardContent>
    </Card>
  );
}
