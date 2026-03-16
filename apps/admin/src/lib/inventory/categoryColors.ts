import type { ProductCategory } from '@/types/inventory'
import {
  UtensilsCrossed,
  Sparkles,
  Package,
  FileText,
  Shapes,
} from 'lucide-react'

/**
 * Centralized category color configuration
 * Used consistently across badges, cards, and filters
 */
export const CATEGORY_COLORS = {
  food: {
    label: 'Alimentaire',
    icon: UtensilsCrossed,
    // Badge colors
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-300',
    // Card/Ring colors (matching badge)
    ring: 'ring-orange-300',
    iconColor: 'text-orange-700',
    // Background color for cards
    bgHover: 'hover:bg-orange-50',
  },
  cleaning: {
    label: 'Entretien',
    icon: Sparkles,
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-300',
    ring: 'ring-blue-300',
    iconColor: 'text-blue-700',
    bgHover: 'hover:bg-blue-50',
  },
  emballage: {
    label: 'Emballage',
    icon: Package,
    badgeText: 'text-gray-700',
    badgeBorder: 'border-gray-300',
    ring: 'ring-gray-300',
    iconColor: 'text-gray-700',
    bgHover: 'hover:bg-gray-50',
  },
  papeterie: {
    label: 'Papeterie',
    icon: FileText,
    badgeText: 'text-yellow-700',
    badgeBorder: 'border-yellow-300',
    ring: 'ring-yellow-300',
    iconColor: 'text-yellow-700',
    bgHover: 'hover:bg-yellow-50',
  },
  divers: {
    label: 'Divers',
    icon: Shapes,
    badgeText: 'text-gray-700',
    badgeBorder: 'border-gray-300',
    ring: 'ring-gray-300',
    iconColor: 'text-gray-700',
    bgHover: 'hover:bg-gray-50',
  },
} as const

export type CategoryColorConfig = typeof CATEGORY_COLORS

/**
 * Get badge colors for a category
 */
export function getCategoryBadgeColors(category?: ProductCategory) {
  if (!category || !(category in CATEGORY_COLORS)) return null
  const config = CATEGORY_COLORS[category]
  return {
    label: config.label,
    color: `${config.badgeText} ${config.badgeBorder}`,
  }
}

/**
 * Get card colors for a category
 */
export function getCategoryCardColors(category: ProductCategory) {
  if (!(category in CATEGORY_COLORS)) return null
  return CATEGORY_COLORS[category]
}
