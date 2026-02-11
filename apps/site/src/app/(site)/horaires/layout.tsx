import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Horaires d\'Ouverture - CoworKing Café Strasbourg',
  description: 'Horaires du CoworKing Café by Anticafé à Strasbourg : ouvert 6j/7 pour travailler dans un espace coworking convivial. Fermetures exceptionnelles affichées.',

  keywords: [
    'anticafé strasbourg',
    'coworking strasbourg',
    'espace de travail strasbourg',
    'cafe coworking strasbourg',
    'horaires coworking strasbourg',
    'ouverture coworking cafe strasbourg',
    'heures ouverture coworking',
    'anticafe strasbourg horaires',
    'coworking strasbourg dimanche',
  ],

  openGraph: {
    title: 'Horaires d\'Ouverture CoworKing Café Strasbourg',
    description: 'Consultez nos horaires d\'ouverture : ouvert 6 jours sur 7 pour vous accueillir dans notre espace coworking chaleureux.',
    url: 'https://coworkingcafe.fr/horaires',
    type: 'website',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CoworKing Café Strasbourg - Horaires'
      }
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Horaires d\'Ouverture CoworKing Café Strasbourg',
    description: 'Consultez nos horaires d\'ouverture : ouvert 6 jours sur 7 pour vous accueillir dans notre espace coworking chaleureux.',
    images: ['/images/og-image.png'],
  },

  alternates: {
    canonical: 'https://coworkingcafe.fr/horaires',
  },
};

export default function HorairesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
