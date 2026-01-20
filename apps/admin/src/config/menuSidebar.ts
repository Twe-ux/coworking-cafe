/**
 * Configuration centralisée des menus de la sidebar
 *
 * Pour modifier les menus, éditer simplement ce fichier plutôt que le composant
 */

import {
  BookOpen,
  Building2,
  Calendar,
  Calculator,
  Clock,
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
      title: "Pointage",
      url: "/clocking",
      icon: Clock,
    },
    {
      title: "Mon Planning",
      url: "/my-schedule",
      icon: Calendar,
    },
    {
      title: "Menu",
      url: "/menu",
      icon: UtensilsCrossed,
      items: [
        {
          title: "Recettes Boissons",
          url: "/menu/recipes?category=drinks",
        },
        {
          title: "Recettes Food",
          url: "/menu/recipes?category=food",
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
 * @param isDev - Si l'utilisateur est dev (pour afficher Dev Tools)
 * @param isLoading - Si la session est en chargement (pour éviter le flash)
 */
export function getAdminMenu(unreadCount: number, isDev: boolean, isLoading = false): MenuItem[] {
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
          url: "/admin/hr/availability",
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
      items: [
        {
          title: "Espaces",
          url: "/admin/booking/spaces",
        },
        {
          title: "Réservations",
          url: "/admin/booking/reservations",
        },
        {
          title: "Calendrier",
          url: "/admin/booking/calendar",
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
        {
          title: "Commentaires",
          url: "/admin/blog/comments",
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
      badge: unreadCount > 0 ? unreadCount : undefined,
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

  // Dev Tools (uniquement pour les dev, ou pendant le chargement pour éviter le flash)
  if (isDev || isLoading) {
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
