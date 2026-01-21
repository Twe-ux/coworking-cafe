/**
 * Root Layout - apps/site
 * Layout racine requis par Next.js 14 App Router
 * Contient les balises <html> et <body>
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/assets/site/font/bootstrap-font/bootstrap-icons.min.css';
import '@/assets/site/font/font-awsome/css-js/all.min.css';
import '@/assets/site/scss/main.scss';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: {
    default: 'CoworKing Café - Espace de Coworking à Paris',
    template: '%s | CoworKing Café'
  },
  description: 'Espace de coworking convivial à Paris avec concept anticafé. Wifi haut débit, salles de réunion, café/thé illimité.',
  keywords: ['coworking', 'paris', 'espace de travail', 'anticafé', 'wifi', 'bureau partagé'],
  authors: [{ name: 'CoworKing Café' }],
  metadataBase: new URL('https://coworkingcafe.fr'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'CoworKing Café'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
