/**
 * Blog Page - apps/site
 * Liste des articles avec filtres catégories, recherche et pagination
 */

import type { Metadata } from 'next';
import { ArticleClient } from './ArticleClient';

export const metadata: Metadata = {
  title: "Le Mag' - CoworKing Café | Actualités et Conseils Coworking",
  description:
    'Découvrez nos articles sur le coworking, la productivité et le travail collaboratif. Conseils, astuces et actualités pour optimiser votre expérience.',
  keywords: [
    'coworking',
    'productivité',
    'travail collaboratif',
    'espace de travail',
    'blog coworking',
    'conseils coworking',
  ],
  openGraph: {
    title: "Le Mag' - CoworKing Café",
    description: 'Actualités et conseils sur le coworking et la productivité',
    url: 'https://coworkingcafe.fr/blog',
    siteName: 'CoworKing Café',
    images: [
      {
        url: '/images/og-blog.jpg',
        width: 1200,
        height: 630,
        alt: "Blog CoworKing Café - Le Mag'",
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://coworkingcafe.fr/blog',
  },
};

export default function BlogPage() {
  return <ArticleClient />;
}
