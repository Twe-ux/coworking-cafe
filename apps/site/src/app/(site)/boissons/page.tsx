import type { Metadata } from 'next';
import Menu from "../../../components/site/menu/menu";
import PageTitle from "../../../components/site/PageTitle";

export const metadata: Metadata = {
  title: 'Nos Boissons - Café, Thé & Boissons à Volonté | CoworKing Café',
  description: 'Découvrez notre carte de boissons à volonté : cafés de spécialité, thés bio, chocolats chauds, jus frais. Toutes les boissons sont préparées à la demande.',

  keywords: [
    'anticafé strasbourg',
    'coworking strasbourg',
    'espace de travail strasbourg',
    'cafe coworking strasbourg',
    'boissons coworking strasbourg',
    'the bio strasbourg',
    'boissons a volonte',
    'menu boissons anticafe',
  ],

  openGraph: {
    title: 'Nos Boissons - Café, Thé & Boissons à Volonté',
    description: 'Cafés de spécialité, thés bio, chocolats chauds, jus frais : toutes nos boissons sont préparées à la demande et incluses.',
    url: 'https://coworkingcafe.fr/boissons',
    type: 'website',
    images: [
      {
        url: '/images/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'CoworKing Café Strasbourg - Nos Boissons'
      }
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Nos Boissons - Café, Thé & Boissons à Volonté',
    description: 'Cafés de spécialité, thés bio, chocolats chauds, jus frais : toutes nos boissons sont préparées à la demande et incluses.',
    images: ['/images/og-image.webp'],
  },

  alternates: {
    canonical: 'https://coworkingcafe.fr/boissons',
  },
};

const BoissonsPage = () => {
  return (
    <>
      <PageTitle title={"Nos Boissons"} />
      <Menu type="drink" title="" subtitle="" />
    </>
  );
};

export default BoissonsPage;
