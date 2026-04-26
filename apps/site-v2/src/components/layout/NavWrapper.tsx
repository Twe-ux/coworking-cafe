"use client";

import { usePathname } from "next/navigation";
import { Nav } from "./Nav";

export function NavWrapper({ variant }: { variant?: "light" | "dark" }) {
  const pathname = usePathname();
  return <Nav variant={variant} currentPath={pathname} />;
}
