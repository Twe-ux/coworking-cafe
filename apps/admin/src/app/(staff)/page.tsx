"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Clock,
  Calendar,
  ChefHat,
  GraduationCap,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRole } from "@/hooks/useRole";

export default function StaffHomePage() {
  const { data: session } = useSession();
  const { isAdmin, isDev } = useRole();

  const displayName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "Le Staff";

  const staffCards = [
    {
      title: "Pointage",
      description: "Pointer mon arrivée et départ",
      icon: Clock,
      href: "/clocking",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      available: true,
    },
    {
      title: "Mon Planning",
      description: "Consulter mon emploi du temps",
      icon: Calendar,
      href: "/my-schedule",
      color: "text-green-600",
      bgColor: "bg-green-50",
      available: true,
    },
    {
      title: "Menu & Recettes",
      description: "Découvrir le menu et les recettes",
      icon: ChefHat,
      href: "/menu/recipes",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      available: true,
    },
    {
      title: "Formation",
      description: "Accéder aux modules de formation",
      icon: GraduationCap,
      href: "#",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      available: false,
    },
    {
      title: "Mes Stats",
      description: "Voir mes heures et performances",
      icon: TrendingUp,
      href: "#",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      available: false,
    },
  ];

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bienvenue, {displayName}</h1>
        <p className="text-muted-foreground mt-2">
          Accédez rapidement à vos outils quotidiens
        </p>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffCards.map((card) => {
          const Icon = card.icon;
          const CardContent = (
            <Card
              className={`hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary ${
                !card.available ? "opacity-60" : ""
              }`}
            >
              <CardHeader className="space-y-4">
                <div
                  className={`w-14 h-14 rounded-lg ${card.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`w-7 h-7 ${card.color}`} />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {card.title}
                    {!card.available && (
                      <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                        Bientôt
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {card.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );

          if (!card.available) {
            return (
              <div key={card.href} className="cursor-not-allowed">
                {CardContent}
              </div>
            );
          }

          return (
            <Link key={card.href} href={card.href}>
              {CardContent}
            </Link>
          );
        })}
      </div>

      {/* Info section */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Astuce :</strong> Vous pouvez pointer depuis n'importe
          quelle page en cliquant sur l'icône d'horloge dans la barre de
          navigation.
        </p>
      </div>
    </div>
  );
}
