import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";

interface MainSectionsProps {
  pendingJustifications: number;
}

export function MainSections({ pendingJustifications }: MainSectionsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Employés</CardTitle>
          </div>
          <CardDescription>
            Gérer les employés, onboarding, contrats et disponibilités
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild className="w-full" variant="default">
            <Link href="/admin/hr/employees">
              <Users className="mr-2 h-4 w-4" />
              Voir tous les employés
            </Link>
          </Button>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="col-span-2"
            >
              <Link href="/admin/hr/employees?tab=availability">
                Disponibilités
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Planning</CardTitle>
          </div>
          <CardDescription>
            Planifier et gérer les horaires de tous les employés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" variant="default">
            <Link href="/admin/hr/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              Gérer le planning
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Créez et modifiez les créneaux horaires pour tous les employés
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Pointages</CardTitle>
            {pendingJustifications > 0 && (
              <Badge
                variant="destructive"
                className="h-5 min-w-5 flex items-center justify-center"
              >
                {pendingJustifications}
              </Badge>
            )}
          </div>
          <CardDescription>
            Récapitulatif des heures et pointages mensuels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" variant="default">
            <Link href="/admin/hr/clocking-admin">
              <Clock className="mr-2 h-4 w-4" />
              Voir les pointages
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Consultez et modifiez les entrées de temps des employés
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
