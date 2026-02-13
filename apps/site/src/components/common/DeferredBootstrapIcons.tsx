'use client';

import { useEffect } from 'react';

/**
 * DeferredBootstrapIcons - Charge Bootstrap Icons de manière asynchrone après le rendu initial
 *
 * Bootstrap Icons CSS (84 KB, 14 KB gz) n'est pas utilisé above-the-fold.
 * Ce composant retarde le chargement pour améliorer Core Web Vitals.
 *
 * Impact :
 * - Réduit les ressources de rendu bloquant de ~14 KB
 * - Icônes apparaissent ~100ms après paint (imperceptible)
 */
export function DeferredBootstrapIcons() {
  useEffect(() => {
    // Créer dynamiquement un élément <link> pour charger Bootstrap Icons après le rendu
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/site/font/bootstrap-font/bootstrap-icons.min.css';
    document.head.appendChild(link);
  }, []);

  return null;
}
