import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function ScheduleSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Message de chargement */}
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Chargement du planning...
        </p>
      </div>

      {/* Header avec navigation mois */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Calendrier */}
      <Card className="animate-in fade-in duration-700" style={{ animationDelay: "200ms" }}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          {/* En-tête jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>

          {/* Grille calendrier - 5 semaines */}
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((week) => (
              <div key={week} className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <Skeleton
                    key={day}
                    className="h-24 w-full"
                    style={{ animationDelay: `${week * 100 + day * 20}ms` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste employés */}
      <Card className="animate-in fade-in duration-700" style={{ animationDelay: "400ms" }}>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 border rounded-lg"
              style={{ animationDelay: `${400 + i * 100}ms` }}
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
