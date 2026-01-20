import { Clock, Building2 } from "lucide-react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function SettingsPage() {
  const settingsModules = [
    {
      title: "Horaires d'ouverture",
      description: "Gérer les horaires et fermetures exceptionnelles",
      icon: Clock,
      href: "/admin/settings/hours",
    },
    {
      title: "Espaces de réunion",
      description: "Configuration des espaces réservables",
      icon: Building2,
      href: "/admin/booking/spaces",
      note: "Voir module Booking"
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Configuration globale du coworking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <module.icon className="w-8 h-8 text-primary" />
                  {module.note && (
                    <span className="text-xs text-muted-foreground">{module.note}</span>
                  )}
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
