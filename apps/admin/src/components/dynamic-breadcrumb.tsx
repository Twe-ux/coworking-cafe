"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Fragment } from "react"

const routeLabels: Record<string, string> = {
  admin: "Admin",
  dashboard: "Tableau de bord",
  accounting: "Comptabilité",
  "cash-control": "Contrôle de Caisse",
  turnover: "Chiffre d'affaires",
  hr: "Ressources Humaines",
  employees: "Employés",
  onboarding: "Intégration",
  schedule: "Planning",
  clocking: "Pointage",
  "clocking-admin": "Pointage Admin",
  availability: "Disponibilités",
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
  contact: "Messages de contact",
  feedback: "Retours",
  settings: "Paramètres",
  analytics: "Analytiques",
  dev: "Outils Dev",
  logs: "Journaux",
  debug: "Débogage",
  database: "Base de données",
  menu: "Menu",
  drinks: "Boissons",
  food: "Nourriture",
  recipes: "Recettes",
  promo: "Promotions",
  "my-schedule": "Mon Planning",
  notifications: "Notifications",
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()

  // Générer les segments du chemin
  const segments = pathname.split("/").filter(Boolean)

  // Déterminer si on est dans le contexte admin ou staff
  const isAdminContext = segments[0] === "admin"
  const homeHref = isAdminContext ? "/admin" : "/"
  const homeLabel = isAdminContext ? "Dashboard Admin" : "Tableau de bord"

  // Si on est sur la page d'accueil admin ou staff
  if (segments.length === 0 || pathname === "/" || pathname === "/admin") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{homeLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={homeHref}>{homeLabel}</BreadcrumbLink>
        </BreadcrumbItem>
        {segments
          .filter((segment) => !(isAdminContext && segment === "admin"))
          .map((segment, index, filteredSegments) => {
            const isLast = index === filteredSegments.length - 1
            const originalIndex = segments.indexOf(segment)
            const href = "/" + segments.slice(0, originalIndex + 1).join("/")
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
