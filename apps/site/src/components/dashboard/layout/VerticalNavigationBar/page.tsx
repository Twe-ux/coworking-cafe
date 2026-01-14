"use client";

import { getMenuItems } from "@/helpers/Manu";
import { MenuItemType } from "@/types/menu";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import LogoBox from "../../LogoBox";
import SimplebarReactClient from "../../wrappers/SimplebarReactClient";
import AppMenu from "./components/AppMenu";
import HoverMenuToggle from "./components/HoverMenuToggle";
import SidebarFooter from "./components/SidebarFooter";

const VerticalNavigationBar = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role?.slug as
    | "dev"
    | "admin"
    | "staff"
    | "client"
    | undefined;

  const [unreadCount, setUnreadCount] = useState(0);

  // Get filtered menu items based on user role
  const baseMenuItems = getMenuItems(userRole);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {        // Add timestamp to bypass cache
        const cacheBuster = `${Date.now()}-${Math.random()}`;        const response = await fetch(`/api/contact-mails/unread-count?_=${cacheBuster}`, {
          cache: 'reload',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (response.ok) {
          const data = await response.json();          const count = data.count || 0;          setUnreadCount(count);
        } else {
          const errorData = await response.json().catch(() => ({}));        }
      } catch (error) {
    }
    };    if (userRole === "dev" || userRole === "admin") {      fetchUnreadCount();

      // Listen for custom event to refresh count
      const handleRefresh = () => {        fetchUnreadCount();
      };
      window.addEventListener("refreshUnreadCount", handleRefresh);

      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => {
        clearInterval(interval);
        window.removeEventListener("refreshUnreadCount", handleRefresh);
      };
    } else {    }
  }, [userRole]);

  // Update menu items with dynamic badge count
  const menuItems = useMemo(() => {
    return baseMenuItems.map((item) => {
      if (item.key === "contact-mails") {
        return {
          ...item,
          badge:
            unreadCount > 0
              ? {
                  text: unreadCount.toString(),
                  variant: "danger",
                }
              : undefined,
        };
      }
      return item;
    });
  }, [baseMenuItems, unreadCount]);

  return (
    <div className="main-nav" id="leftside-menu-container">
      <LogoBox />
      <HoverMenuToggle />
      <SimplebarReactClient className="scrollbar" data-simplebar>
        <AppMenu menuItems={menuItems} />
      </SimplebarReactClient>
      <SidebarFooter />
    </div>
  );
};

export default VerticalNavigationBar;
