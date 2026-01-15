import {
  BarChart,
  Calculator,
  Calendar,
  Clock,
  FileText,
  Home,
  LifeBuoy,
  MessageSquare,
  Package,
  Send,
  Terminal,
  Users,
  UserCog,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: {
    title: string;
    url: string;
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

  // RH (dev + admin)
  if (permissions.canViewHR) {
    items.push({
      title: "Gestion RH",
      url: "/hr/overview",
      icon: UserCog,
      items: [
        {
          title: "Employés",
          url: "/hr",
        },
        {
          title: "Planning",
          url: "/schedule",
        },
        {
          title: "Pointages",
          url: "/clocking-admin",
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

  // Analytics (dev + admin) - TODO: à implémenter
  if (permissions.canViewAnalytics) {
    items.push({
      title: "Analytics",
      url: "/analytics",
      icon: BarChart,
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

  // Utilisateurs (dev + admin) - TODO: à implémenter
  if (permissions.canViewUsers) {
    items.push({
      title: "Utilisateurs",
      url: "/users",
      icon: Users,
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

  // Messages (tous) - TODO: à implémenter
  if (permissions.canUseMessages) {
    items.push({
      title: "Messages",
      url: "/messages",
      icon: MessageSquare,
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
