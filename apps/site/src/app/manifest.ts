/**
 * PWA Manifest - apps/site
 * Configuration pour Progressive Web App
 *
 * Doc: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CoworKing Café by Anticafé - Strasbourg',
    short_name: 'CoworKing Café',
    description: 'Espace de coworking convivial au cœur de Strasbourg. Concept anticafé : payez le temps, profitez de boissons à volonté.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#417972',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon'
      },
      {
        src: '/images/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/images/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    categories: ['business', 'lifestyle', 'productivity'],
    orientation: 'portrait-primary',
    dir: 'ltr',
    lang: 'fr-FR'
  };
}
