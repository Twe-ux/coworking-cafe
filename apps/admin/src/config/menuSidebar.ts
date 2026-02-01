/**
 * Configuration centralisée des menus de la sidebar
 *
 * Pour modifier les menus, éditer simplement ce fichier plutôt que le composant
 */

import {
  BookOpen,
  Building2,
  Calculator,
  Calendar,
  CalendarDays,
  Home,
  Mail,
  ScanQrCode,
  Settings,
  Terminal,
  UserCog,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: number;
  items?: {
    title: string;
    url: string;
    badge?: number;
  }[];
}

/**
 * Menu pour les STAFF (employés)
 * Visible pour: staff et utilisateurs non connectés
 */
export function getStaffMenu(): MenuItem[] {
  return [
    {
      title: "Accueil",
      url: "/",
      icon: Home,
    },
    {
      title: "Planning",
      url: "/planning",
      icon: Calendar,
    },
    {
      title: "Agenda Réservations",
      url: "/agenda",
      icon: CalendarDays,
    },
    {
      title: "Produits & Recettes",
      url: "/produits",
      icon: UtensilsCrossed,
      items: [
        {
          title: "Recettes Boissons",
          url: "/produits/recipes?category=drinks",
        },
        {
          title: "Recettes Food",
          url: "/produits/recipes?category=food",
        },
      ],
    },
  ];
}

/**
 * Menu pour les ADMIN/DEV
 * Visible pour: admin et dev
 *
 * @param unreadCount - Nombre de messages non lus (pour le badge)
 * @param pendingUnavailabilities - Nombre de demandes d'indisponibilité en attente
 * @param pendingBookings - Nombre de réservations en attente
 * @param isDev - Si l'utilisateur est dev (pour afficher Dev Tools)
 * @param isAdmin - Si l'utilisateur est admin (pour afficher Dev Tools)
 * @param isLoading - Si la session est en chargement (pour éviter le flash)
 */
export function getAdminMenu(
  unreadCount: number,
  pendingUnavailabilities: number,
  pendingBookings: number,
  isDev: boolean,
  isAdmin: boolean,
  isLoading = false,
): MenuItem[] {
  const items: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
    },
    {
      title: "Ressources Humaines",
      url: "/admin/hr",
      icon: UserCog,
      items: [
        {
          title: "Employés",
          url: "/admin/hr/employees",
        },
        {
          title: "Planning",
          url: "/admin/hr/schedule",
        },
        {
          title: "Pointage Admin",
          url: "/admin/hr/clocking-admin",
        },
        {
          title: "Disponibilités",
          url: "/admin/hr/employees?tab=availability",
        },
      ],
    },
    {
      title: "Comptabilité",
      url: "/admin/accounting",
      icon: Calculator,
      items: [
        {
          title: "Caisse",
          url: "/admin/accounting/cash-control",
        },
        {
          title: "Chiffre d'affaires",
          url: "/admin/accounting/turnover",
        },
      ],
    },
    {
      title: "Booking",
      url: "/admin/booking",
      icon: Building2,
      badge: pendingBookings > 0 ? pendingBookings : undefined,
      items: [
        {
          title: "Réservations",
          url: "/admin/booking/reservations",
          badge: pendingBookings > 0 ? pendingBookings : undefined,
        },
        {
          title: "Calendrier",
          url: "/admin/booking/calendar",
        },
        {
          title: "Espaces",
          url: "/admin/booking/spaces",
        },
        {
          title: "Paramètre des conditions",
          url: "/admin/booking/settings",
        },
      ],
    },
    {
      title: "Blog",
      url: "/admin/blog",
      icon: BookOpen,
      items: [
        {
          title: "Articles",
          url: "/admin/blog/articles",
        },
        {
          title: "Catégories",
          url: "/admin/blog/categories",
        },
      ],
    },
    {
      title: "Promo",
      url: "/admin/promo",
      icon: ScanQrCode,
    },
    {
      title: "Utilisateurs",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Messages",
      url: "/admin/messages",
      icon: Mail,
      badge:
        unreadCount + pendingUnavailabilities > 0
          ? unreadCount + pendingUnavailabilities
          : undefined,
      items: [
        {
          title: "Demandes d'indisponibilité",
          url: "/admin/messages/unavailability-requests",
          badge:
            pendingUnavailabilities > 0 ? pendingUnavailabilities : undefined,
        },
        {
          title: "Contact",
          url: "/admin/messages/contact",
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
          title: "Support",
          url: "/admin/messages/support",
        },
        {
          title: "Messenger",
          url: "/admin/messages/messenger",
        },
      ],
    },
    {
      title: "Produits",
      url: "/admin/produits",
      icon: UtensilsCrossed,
      items: [
        {
          title: "Boissons",
          url: "/admin/produits/drinks",
        },
        {
          title: "Food",
          url: "/admin/produits/food",
        },
      ],
    },
    {
      title: "Paramètres",
      url: "/admin/settings",
      icon: Settings,
      items: [
        {
          title: "Horaires",
          url: "/admin/settings/hours",
        },
      ],
    },
  ];

  // Dev Tools (visible pour dev et admin, ou pendant le chargement pour éviter le flash)
  if (isDev || isAdmin || isLoading) {
    items.push({
      title: "Dev Tools",
      url: "/admin/dev",
      icon: Terminal,
      items: [
        {
          title: "Notifications",
          url: "/admin/debug/notifications",
        },
        {
          title: "Email Preview",
          url: "/admin/dev/email-preview",
        },
      ],
    });
  }

  return items;
}

/**
 * Menu secondaire (Support & Feedback)
 * Visible pour tous
 */
export function getSecondaryMenu(): MenuItem[] {
  return [
    // Peut être étendu plus tard si besoin
  ];
}
