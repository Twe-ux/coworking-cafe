"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Fragment } from "react"

const routeLabels: Record<string, string> = {
  dashboard: "Tableau de bord",
  accounting: "Comptabilité",
  "cash-control": "Contrôle de Caisse",
  hr: "Ressources Humaines",
  employees: "Employés",
  onboarding: "Intégration",
  schedule: "Planning",
  clocking: "Pointage",
  users: "Utilisateurs",
  bookings: "Réservations",
  calendar: "Calendrier",
  spaces: "Espaces",
  products: "Produits",
  categories: "Catégories",
  blog: "Blog",
  articles: "Articles",
  comments: "Commentaires",
  messages: "Messages",
  support: "Support",
  feedback: "Retours",
  settings: "Paramètres",
  analytics: "Analytiques",
  dev: "Outils Dev",
  logs: "Journaux",
  debug: "Débogage",
  database: "Base de données",
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()

  // Générer les segments du chemin
  const segments = pathname.split("/").filter(Boolean)

  // Si on est sur la page d'accueil
  if (segments.length === 0 || pathname === "/") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Tableau de bord</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Tableau de bord</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          const href = "/" + segments.slice(0, index + 1).join("/")
          const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

          return (
            <Fragment key={segment + index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
