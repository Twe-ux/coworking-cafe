import { MENU_ITEMS } from "../assets/dashboard/data/menu-items";
import type { MenuItemType } from "../types/menu";

/**
 * Get menu items filtered by user role
 * @param userRole - The role of the current user
 * @returns Filtered menu items based on role permissions
 */
export const getMenuItems = (
  userRole?: "dev" | "admin" | "staff" | "client",
): MenuItemType[] => {
  // If no role specified, return all items (for dev/admin)
  if (!userRole) {
    return MENU_ITEMS;
  }

  // Filter menu items based on role
  return filterMenuByRole(MENU_ITEMS, userRole);
};

/**
 * Recursively filter menu items by role
 */
const filterMenuByRole = (
  items: MenuItemType[],
  userRole: "dev" | "admin" | "staff" | "client",
): MenuItemType[] => {
  return items
    .filter((item) => {
      // If no roles specified, item is visible to all
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      // Check if user's role is in the allowed roles
      return item.roles.includes(userRole);
    })
    .map((item) => {
      // Recursively filter children
      if (item.children) {
        return {
          ...item,
          children: filterMenuByRole(item.children, userRole),
        };
      }
      return item;
    })
    .filter((item) => {
      // Remove items with children if all children were filtered out
      if (item.children) {
        return item.children.length > 0;
      }
      return true;
    });
};

export const findAllParent = (
  menuItems: MenuItemType[],
  menuItem: MenuItemType,
): string[] => {
  let parents: string[] = [];
  const parent = findMenuItem(menuItems, menuItem.parentKey);
  if (parent) {
    parents.push(parent.key);
    if (parent.parentKey) {
      parents = [...parents, ...findAllParent(menuItems, parent)];
    }
  }
  return parents;
};

export const getMenuItemFromURL = (
  items: MenuItemType | MenuItemType[],
  url: string,
): MenuItemType | undefined => {
  if (items instanceof Array) {
    for (const item of items) {
      const foundItem = getMenuItemFromURL(item, url);
      if (foundItem) {
        return foundItem;
      }
    }
  } else {
    if (items.url == url) return items;
    if (items.children != null) {
      for (const item of items.children) {
        if (item.url == url) return item;
      }
    }
  }
};

export const findMenuItem = (
  menuItems: MenuItemType[] | undefined,
  menuItemKey: MenuItemType["key"] | undefined,
): MenuItemType | null => {
  if (menuItems && menuItemKey) {
    for (const item of menuItems) {
      if (item.key === menuItemKey) {
        return item;
      }
      const found = findMenuItem(item.children, menuItemKey);
      if (found) return found;
    }
  }
  return null;
};
