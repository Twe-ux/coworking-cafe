# Configuration des Menus de la Sidebar

## 📁 Fichier Principal: `menuSidebar.ts`

Ce fichier centralise **toute** la configuration des menus de la sidebar.

### 🎯 Avantages

- ✅ **Facile à modifier** - Pas besoin de chercher dans les composants React
- ✅ **Configuration centralisée** - Un seul fichier pour tous les menus
- ✅ **Structure claire** - Séparation Staff / Admin / Dev
- ✅ **Type-safe** - TypeScript garantit la structure correcte

---

## 📝 Comment Modifier les Menus

### 1. Ajouter un Item au Menu STAFF

```typescript
// Dans menuSidebar.ts, fonction getStaffMenu()
export function getStaffMenu(): MenuItem[] {
  return [
    // ... items existants

    // Ajouter ici ⬇️
    {
      title: "Nouveau Menu",
      url: "/nouveau-menu",
      icon: IconName, // Import depuis lucide-react
    },
  ];
}
```

### 2. Ajouter un Item au Menu ADMIN

```typescript
// Dans menuSidebar.ts, fonction getAdminMenu()
export function getAdminMenu(unreadCount: number, isDev: boolean): MenuItem[] {
  const items: MenuItem[] = [
    // ... items existants

    // Ajouter ici ⬇️
    {
      title: "Nouveau Menu Admin",
      url: "/admin/nouveau-menu",
      icon: IconName,
      items: [ // Optionnel: sous-menu
        {
          title: "Sous-menu 1",
          url: "/admin/nouveau-menu/page1",
        },
      ],
    },
  ];

  return items;
}
```

### 3. Ajouter un Badge de Notification

```typescript
{
  title: "Messages",
  url: "/messages",
  icon: Mail,
  badge: unreadCount, // Nombre affiché dans le badge
}
```

### 4. Ajouter un Menu uniquement pour DEV

```typescript
// À la fin de getAdminMenu(), dans le bloc if (isDev)
if (isDev) {
  items.push({
    title: "Dev Tools",
    url: "/dev",
    icon: Terminal,
    items: [
      {
        title: "Nouveau Tool",
        url: "/dev/nouveau-tool",
      },
    ],
  });
}
```

---

## 🎨 Structure d'un MenuItem

```typescript
interface MenuItem {
  title: string;           // Titre affiché
  url: string;            // URL de la page
  icon: LucideIcon;       // Icône (import depuis lucide-react)
  badge?: number;         // Optionnel: badge de notification
  items?: {               // Optionnel: sous-menu
    title: string;
    url: string;
    badge?: number;
  }[];
}
```

---

## 📦 Icônes Disponibles

Import depuis `lucide-react`:

```typescript
import {
  Home,           // Accueil
  Calendar,       // Planning
  Clock,          // Pointage
  Mail,           // Messages
  Users,          // Utilisateurs
  Calculator,     // Comptabilité
  UserCog,        // RH
  Terminal,       // Dev Tools
  Settings,       // Paramètres
  // ... et des centaines d'autres
} from "lucide-react";
```

Voir toutes les icônes: [lucide.dev](https://lucide.dev)

---

## 🔄 Workflow de Modification

1. **Ouvrir** `/apps/admin/src/config/menuSidebar.ts`
2. **Modifier** le menu souhaité (Staff ou Admin)
3. **Sauvegarder** - Les changements sont automatiques (hot reload)
4. **Vérifier** dans l'app - Le menu est mis à jour

**Pas besoin de toucher** `app-sidebar.tsx` ! 🎉

---

## 🧪 Exemple Complet

```typescript
// Ajouter un menu "Réservations" avec sous-menu pour les admin
export function getAdminMenu(unreadCount: number, isDev: boolean): MenuItem[] {
  const items: MenuItem[] = [
    // ... autres items

    {
      title: "Réservations",
      url: "/admin/bookings",
      icon: Calendar,
      badge: 3, // 3 nouvelles réservations
      items: [
        {
          title: "Liste",
          url: "/admin/bookings/list",
        },
        {
          title: "Calendrier",
          url: "/admin/bookings/calendar",
        },
        {
          title: "Espaces",
          url: "/admin/bookings/spaces",
        },
      ],
    },
  ];

  return items;
}
```

---

## 🎯 Best Practices

1. **Ordre logique** - Grouper les menus par fonctionnalité
2. **Titres courts** - Max 2-3 mots pour une bonne lisibilité
3. **URLs cohérentes** - Suivre la structure `/admin/[module]/[page]`
4. **Icônes pertinentes** - Choisir des icônes qui représentent bien la fonction
5. **Badge uniquement si pertinent** - Ne pas abuser des notifications

---

**Dernière mise à jour**: 2026-01-19
