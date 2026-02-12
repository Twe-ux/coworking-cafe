import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, UserPlus } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
        <CardDescription>
          Accès direct aux fonctionnalités principales
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/admin/hr/employees?action=new">
            <UserPlus className="mr-2 h-4 w-4" />
            Nouvel employé
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/hr/schedule">
            <Calendar className="mr-2 h-4 w-4" />
            Créer un créneau
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/hr/clocking-admin">
            <Clock className="mr-2 h-4 w-4" />
            Pointer un employé
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
