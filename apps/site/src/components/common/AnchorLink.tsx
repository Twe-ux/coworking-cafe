"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

interface AnchorLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Enhanced Link component that properly handles anchor navigation (#id)
 * Fixes Next.js client-side routing not scrolling to anchors
 */
export function AnchorLink({
  href,
  children,
  className,
  onClick,
}: AnchorLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call external onClick if provided
    onClick?.();

    const [path, hash] = href.split("#");

    // No hash = normal Link behavior
    if (!hash) return;

    e.preventDefault();

    // Same page: scroll directly
    if (pathname === path || path === "") {
      const element = document.getElementById(hash);
      if (element) {
        // Offset for sticky header (adjust if needed)
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } else {
      // Different page: navigate then scroll
      router.push(href);
      // Wait for navigation + render
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 150);
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
