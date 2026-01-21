/**
 * Navigation Component - apps/site
 * Liste de liens responsive avec état actif
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { BaseComponentProps } from '@/types/common';

interface NavigationLink {
  label: string;
  href: string;
  active?: boolean;
}

interface NavigationProps extends BaseComponentProps {
  links: NavigationLink[];
  onClick?: () => void;
}

export function Navigation({ links, onClick, className, id }: NavigationProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={cn('layout-navigation', className)} id={id}>
      <ul className="layout-navigation__list">
        {links.map((link) => {
          const isActive = link.active !== undefined ? link.active : isLinkActive(link.href);

          return (
            <li key={link.href} className="layout-navigation__item">
              <Link
                href={link.href}
                className={cn(
                  'layout-navigation__link',
                  isActive && 'layout-navigation__link--active'
                )}
                onClick={onClick}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
