import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Coworking Café - Admin',
    short_name: 'CWC Admin',
    description: 'Dashboard administrateur du Coworking Café',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    // Activer le Badge API pour les notifications PWA
    categories: ['business', 'productivity'],
    // Définir les shortcuts (optionnel)
    shortcuts: [
      {
        name: 'Messages Contact',
        short_name: 'Contact',
        description: 'Voir les messages de contact',
        url: '/support/contact',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  }
}
