/**
 * Types for Menu Management (Food + Drinks)
 */

// API Response générique
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string | string[] | Record<string, string>;
  message?: string;
}

// Type d'élément du menu
export type MenuItemType = "food" | "drink";

// Catégorie de menu
export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: MenuItemType;
  order: number;
  isActive: boolean;
  showOnSite: boolean;
  createdAt: string;
  updatedAt: string;
}

// Item du menu (food ou drink)
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  recipe?: string; // Recette/Instructions (format markdown)
  image?: string; // URL CloudFront
  category: {
    id: string;
    name: string;
    slug: string;
  };
  type: MenuItemType;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form data pour créer/éditer une catégorie
export interface MenuCategoryFormData {
  name: string;
  description?: string;
  showOnSite?: boolean;
}

// Form data pour créer/éditer un item
export interface MenuItemFormData {
  name: string;
  description?: string;
  recipe?: string;
  image?: string;
  categoryId: string;
}

// Filtres pour la liste
export interface MenuFilters {
  categoryId?: string;
  search?: string;
  type?: MenuItemType;
}

// Response API complète
export interface MenuData {
  categories: MenuCategory[];
  items: MenuItem[];
}

// Stats pour le dashboard
export interface MenuStats {
  totalCategories: number;
  totalItems: number;
  activeItems: number;
  itemsWithRecipe: number;
}
