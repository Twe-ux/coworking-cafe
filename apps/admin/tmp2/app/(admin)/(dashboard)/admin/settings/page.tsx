"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, FileText, Settings, Users } from "lucide-react";
import Link from "next/link";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <RoleGuard role="admin">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Administration</h1>
              <p className="text-muted-foreground">
                Bienvenue {user?.firstName}, vous avez accès aux paramètres
                d'administration.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestion du Personnel
                  </CardTitle>
                  <CardDescription>
                    Gérer les employés, leurs rôles et leurs accès
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/list">Liste du Personnel</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/score">Pointages</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Finances
                  </CardTitle>
                  <CardDescription>
                    Contrôle de caisse et rapports financiers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/accounting/cash-control">
                        Contrôle de Caisse
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/">Dashboard Financier</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Rapports
                  </CardTitle>
                  <CardDescription>
                    Génération et export de rapports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" disabled>
                      Rapport Mensuel
                    </Button>
                    <Button variant="outline" className="w-full" disabled>
                      Export Données
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Paramètres Système
                  </CardTitle>
                  <CardDescription>
                    Configuration générale de l'application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" disabled>
                      Paramètres Généraux
                    </Button>
                    <Button variant="outline" className="w-full" disabled>
                      Sauvegardes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Informations Utilisateur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <strong>Nom:</strong> {user?.firstName} {user?.lastName}
                    </div>
                    <div>
                      <strong>Nom d'utilisateur:</strong> {user?.username}
                    </div>
                    <div>
                      <strong>Rôle:</strong> {user?.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
