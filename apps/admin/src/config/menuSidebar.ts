/**
 * Configuration centralisée des menus de la sidebar
 *
 * Pour modifier les menus, éditer simplement ce fichier plutôt que le composant
 */

import {
  BarChart3,
  BookOpen,
  Building2,
  Calculator,
  Calendar,
  CalendarDays,
  Clock,
  ClipboardList,
  Coins,
  Home,
  ListTodo,
  Mail,
  Package,
  PartyPopper,
  ScanQrCode,
  ShoppingCart,
  Terminal,
  Truck,
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
 *
 * @param outOfStockCount - Nombre de produits en rupture de stock
 */
export function getStaffMenu(outOfStockCount?: number): MenuItem[] {
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
      title: "Fond de Caisse",
      url: "/cash-register",
      icon: Coins,
    },
    {
      title: "Produits & Recettes",
      url: "/produits",
      icon: UtensilsCrossed,
      badge: outOfStockCount && outOfStockCount > 0 ? outOfStockCount : undefined,
    },
  ];
}

/**
 * Interface pour les sections de menu avec label
 */
export interface MenuSection {
  label?: string; // Label optionnel pour la section
  items: MenuItem[];
}

/**
 * Menu pour les ADMIN/DEV (toutes les sections)
 * Visible pour: admin et dev
 *
 * @param unreadCount - Nombre de messages non lus (pour le badge)
 * @param pendingAbsences - Nombre de demandes d'absence en attente
 * @param pendingBookings - Nombre de réservations en attente
 * @param pendingJustifications - Nombre de pointages avec justification
 * @param draftOrders - Nombre de commandes en brouillon
 * @param outOfStockCount - Nombre de produits en rupture de stock
 * @param isDev - Si l'utilisateur est dev (pour afficher Dev Tools)
 * @param isAdmin - Si l'utilisateur est admin (pour afficher Dev Tools)
 */
export function getAdminMenu(
  unreadCount: number,
  pendingAbsences: number,
  pendingBookings: number,
  pendingJustifications: number,
  draftOrders: number,
  outOfStockCount: number,
  isDev: boolean,
  isAdmin: boolean,
): MenuSection[] {
  const sections: MenuSection[] = [
    // Section Général (sans label)
    {
      items: [
        // {
        //   title: "Accueil Staff",
        //   url: "/",
        //   icon: Home,
        // },
        {
          title: "Dashboard",
          url: "/admin",
          icon: Home,
        },
      ],
    },

    // Section Clients
    {
      label: "Clients",
      items: [
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
              title: "Agenda",
              url: "/admin/booking/agenda",
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
          title: "Utilisateurs",
          url: "/admin/users",
          icon: Users,
        },
      ],
    },

    // Section Employés & Messages
    {
      label: "Employés & Messages",
      items: [
        {
          title: "Ressources Humaines",
          url: "/admin/hr",
          icon: UserCog,
          badge: pendingJustifications > 0 ? pendingJustifications : undefined,
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
              badge:
                pendingJustifications > 0 ? pendingJustifications : undefined,
            },
            {
              title: "Absences",
              url: "/admin/hr/absences",
              badge: pendingAbsences > 0 ? pendingAbsences : undefined,
            },
            {
              title: "Disponibilités",
              url: "/admin/hr/employees?tab=availability",
            },
          ],
        },
        {
          title: "Tâches",
          url: "/admin/tasks",
          icon: ListTodo,
        },
        {
          title: "Messages",
          url: "/admin/messages",
          icon: Mail,
          badge: unreadCount > 0 ? unreadCount : undefined,
          items: [
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
        },
      ],
    },

    // Section Actualités
    {
      label: "Actualités",
      items: [
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
          title: "Événements",
          url: "/admin/events",
          icon: PartyPopper,
          items: [
            {
              title: "Liste des événements",
              url: "/admin/events",
            },
            {
              title: "Créer un événement",
              url: "/admin/events/create",
            },
          ],
        },
        {
          title: "Promo",
          url: "/admin/promo",
          icon: ScanQrCode,
        },
      ],
    },
    // Section Comptabilité
    {
      label: "Comptabilité",
      items: [
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
              title: "Fond de caisse",
              url: "/admin/accounting/cash-register",
            },
            {
              title: "Empreintes capturées",
              url: "/admin/accounting/captured-deposits",
            },
            {
              title: "Analyse",
              url: "/admin/accounting/analytics",
            },
          ],
        },
      ],
    },

    // Section Stock & Inventory
    {
      label: "Stock",
      items: [
        {
          title: "Inventaire",
          url: "/admin/inventory",
          icon: Package,
          badge: (draftOrders > 0 || outOfStockCount > 0) ? (draftOrders + outOfStockCount) : undefined,
          items: [
            {
              title: "Fournisseurs",
              url: "/admin/inventory/suppliers",
            },
            {
              title: "Produits",
              url: "/admin/inventory/products",
              badge: outOfStockCount > 0 ? outOfStockCount : undefined,
            },
            {
              title: "Inventaires",
              url: "/admin/inventory/entries",
            },
            {
              title: "Commandes",
              url: "/admin/inventory/orders",
              badge: draftOrders > 0 ? draftOrders : undefined,
            },
            {
              title: "Achats directs",
              url: "/admin/inventory/direct-purchases",
            },
            ...(isDev || isAdmin
              ? [
                  {
                    title: "Analytics",
                    url: "/admin/inventory/analytics",
                  },
                ]
              : []),
          ],
        },
      ],
    },

    {
      items: [
        // {
        //   title: "Accueil Staff",
        //   url: "/",
        //   icon: Home,
        // },
        {
          title: "Horaires",
          url: "/admin/settings/hours",
          icon: Clock,
        },
      ],
    },
  ];

  // Section Dev Tools (conditionnelle - visible uniquement pour dev/admin)
  if (isDev || isAdmin) {
    sections.push({
      label: "Dev Tools",
      items: [
        {
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
        },
      ],
    });
  }

  return sections;
}
