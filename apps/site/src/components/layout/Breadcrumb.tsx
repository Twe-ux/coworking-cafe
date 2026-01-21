/**
 * Breadcrumb Component - apps/site
 * Fil d'Ariane avec Schema.org BreadcrumbList
 */

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { BreadcrumbItem, BaseComponentProps } from '@/types/common';

interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items, className, id }: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  // Schema.org BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coworkingcafe.fr'}${item.href}`
    }))
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb UI */}
      <nav
        className={cn('layout-breadcrumb', className)}
        id={id}
        aria-label="Fil d'Ariane"
      >
        <ol className="layout-breadcrumb__list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isCurrent = item.current || isLast;

            return (
              <li
                key={item.href}
                className={cn(
                  'layout-breadcrumb__item',
                  isCurrent && 'layout-breadcrumb__item--current'
                )}
              >
                {isCurrent ? (
                  <span
                    className="layout-breadcrumb__text"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.href}
                      className="layout-breadcrumb__link"
                    >
                      {item.label}
                    </Link>
                    <span
                      className="layout-breadcrumb__separator"
                      aria-hidden="true"
                    >
                      &gt;
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
