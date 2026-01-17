import {
  BarChart,
  Calculator,
  Calendar,
  Clock,
  FileText,
  Home,
  LifeBuoy,
  Mail,
  MessageSquare,
  Package,
  ScanQrCode,
  Send,
  Terminal,
  UserCog,
  Users,
  UtensilsCrossed,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: number; // Nombre de notifications (pour afficher pastille rouge)
  items?: {
    title: string;
    url: string;
    badge?: number; // Badge sur le sous-item
  }[];
}

interface Permissions {
  canViewDashboard: boolean;
  canViewAnalytics: boolean;
  canViewAccounting: boolean;
  canViewUsers: boolean;
  canViewHR: boolean;
  canManageAllSchedules: boolean;
  canViewBookings: boolean;
  canManageBookings: boolean;
  canViewSpaces: boolean;
  canViewProducts: boolean;
  canViewBlog: boolean;
  canViewOwnSchedule: boolean;
  canUseMessages: boolean;
  canViewPromo: boolean;
  canViewSupportContact: boolean;
  canViewMenu: boolean;
  canViewMenuRecipes: boolean;
  canAccessDevTools: boolean;
}

/**
 * Génère les items de navigation principaux selon les permissions
 */
export function getNavigationItems(permissions: Permissions): NavigationItem[] {
  const items: NavigationItem[] = [];

  // Dashboard (tous)
  if (permissions.canViewDashboard) {
    items.push({
      title: "Accueil",
      url: "/",
      icon: Home,
    });
  }

  // Analytics (dev + admin) - TODO: à implémenter
  if (permissions.canViewAnalytics) {
    items.push({
      title: "Analytics",
      url: "/analytics",
      icon: BarChart,
    });
  }

  // RH (dev + admin)
  if (permissions.canViewHR) {
    items.push({
      title: "Gestion RH",
      url: "/hr",
      icon: UserCog,
      items: [
        {
          title: "Employés",
          url: "/hr/employees",
        },
        {
          title: "Planning",
          url: "/hr/schedule",
        },
        {
          title: "Pointages",
          url: "/hr/clocking-admin",
        },
      ],
    });
  }

  // Mon Planning (staff uniquement)
  if (permissions.canViewOwnSchedule && !permissions.canViewHR) {
    items.push({
      title: "Mon Planning",
      url: "/my-schedule",
      icon: Calendar,
    });
  }

  // Pointage (staff uniquement)
  if (permissions.canViewOwnSchedule && !permissions.canViewHR) {
    items.push({
      title: "Pointage",
      url: "/clocking",
      icon: Clock,
    });
  }

  // Comptabilité (dev + admin) - TODO: à implémenter
  if (permissions.canViewAccounting) {
    items.push({
      title: "Comptabilité",
      url: "/accounting",
      icon: Calculator,
      items: [
        {
          title: "Vue d'ensemble",
          url: "/accounting",
        },
        {
          title: "Contrôle de Caisse",
          url: "/accounting/cash-control",
        },
      ],
    });
  }

  // Promo (tous)
  if (permissions.canViewPromo) {
    items.push({
      title: "Promo",
      url: "/promo",
      icon: ScanQrCode,
    });
  }

  // Menu (dev/admin pour gestion, staff pour recettes)
  if (permissions.canViewMenu || permissions.canViewMenuRecipes) {
    const menuItems: NavigationItem = {
      title: "Menu",
      url: "/menu",
      icon: UtensilsCrossed,
      items: [],
    };

    // Ajouter les sous-items selon les permissions
    if (permissions.canViewMenu) {
      menuItems.items?.push(
        {
          title: "Nourriture",
          url: "/menu/food",
        },
        {
          title: "Boissons",
          url: "/menu/drinks",
        }
      );
    }

    if (permissions.canViewMenuRecipes) {
      menuItems.items?.push({
        title: "Recettes",
        url: "/menu/recipes",
      });
    }

    items.push(menuItems);
  }

  // Messages (dev + admin)
  if (permissions.canViewSupportContact) {
    items.push({
      title: "Messages",
      url: "/support",
      icon: Mail,
      items: [
        {
          title: "Contact",
          url: "/support/contact",
        },
      ],
    });
  }

  // Utilisateurs (dev + admin)
  if (permissions.canViewUsers) {
    items.push({
      title: "Utilisateurs",
      url: "/users",
      icon: Users,
    });
  }

  // Dev Tools (dev only) - TODO: à implémenter
  if (permissions.canAccessDevTools) {
    items.push({
      title: "Dev Tools",
      url: "/dev",
      icon: Terminal,
      items: [
        {
          title: "Logs",
          url: "/dev/logs",
        },
        {
          title: "Debug",
          url: "/dev/debug",
        },
        {
          title: "Database",
          url: "/dev/database",
        },
      ],
    });
  }

  // Messages (tous) - TODO: à implémenter
  if (permissions.canUseMessages) {
    items.push({
      title: "Messages",
      url: "/messages",
      icon: MessageSquare,
    });
  }

  // Réservations (tous) - TODO: à implémenter
  if (permissions.canViewBookings) {
    items.push({
      title: "Réservations",
      url: "/bookings",
      icon: Calendar,
      items: permissions.canManageBookings
        ? [
            {
              title: "Liste",
              url: "/bookings",
            },
            {
              title: "Calendrier",
              url: "/bookings/calendar",
            },
          ]
        : undefined,
    });
  }

  // Espaces (dev + admin) - TODO: à implémenter
  if (permissions.canViewSpaces) {
    items.push({
      title: "Espaces",
      url: "/spaces",
      icon: Warehouse,
      items: [
        {
          title: "Liste",
          url: "/spaces",
        },
        {
          title: "Gérer",
          url: "/spaces/manage",
        },
      ],
    });
  }

  // Produits (dev + admin) - TODO: à implémenter
  if (permissions.canViewProducts) {
    items.push({
      title: "Produits",
      url: "/products",
      icon: Package,
      items: [
        {
          title: "Liste",
          url: "/products",
        },
        {
          title: "Catégories",
          url: "/products/categories",
        },
      ],
    });
  }

  // Blog (dev + admin) - TODO: à implémenter
  if (permissions.canViewBlog) {
    items.push({
      title: "Blog",
      url: "/blog",
      icon: FileText,
      items: [
        {
          title: "Articles",
          url: "/blog/articles",
        },
        {
          title: "Catégories",
          url: "/blog/categories",
        },
        {
          title: "Commentaires",
          url: "/blog/comments",
        },
      ],
    });
  }

  return items;
}

/**
 * Items de navigation secondaire (toujours visibles)
 */
export function getSecondaryNavigationItems(): NavigationItem[] {
  return [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ];
}
