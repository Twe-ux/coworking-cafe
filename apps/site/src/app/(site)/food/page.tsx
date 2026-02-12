import type { Metadata } from 'next';
import Menu from "../../../components/site/menu/menu";
import PageTitle from "../../../components/site/PageTitle";

export const metadata: Metadata = {
  title: 'Nos Produits Alimentaires - Snacks & Repas | CoworKing Café',
  description: 'Découvrez notre sélection de produits alimentaires à la carte : pizzas, sandwiches, salades, encas sucrés. Parfait pour travailler sans interruption.',

  keywords: [
    'anticafé strasbourg',
    'coworking strasbourg',
    'espace de travail strasbourg',
    'cafe coworking strasbourg',
    'repas coworking strasbourg',
    'snacks coworking',
    'manger coworking cafe',
    'pizza coworking strasbourg',
    'dejeuner espace travail strasbourg',
  ],

  openGraph: {
    title: 'Nos Produits Alimentaires - Snacks & Repas',
    description: 'Pizzas, sandwiches, salades, encas sucrés : notre sélection de produits alimentaires disponibles à la carte.',
    url: 'https://coworkingcafe.fr/food',
    type: 'website',
    images: [
      {
        url: '/images/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'CoworKing Café Strasbourg - Nos Produits Alimentaires'
      }
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Nos Produits Alimentaires - Snacks & Repas',
    description: 'Pizzas, sandwiches, salades, encas sucrés : notre sélection de produits alimentaires disponibles à la carte.',
    images: ['/images/og-image.webp'],
  },

  alternates: {
    canonical: 'https://coworkingcafe.fr/food',
  },
};

const FoodPage = () => {
  return (
    <>
      <PageTitle title={"Nos Produits Alimentaires"} />
      <Menu
        type="food"
        title="Nos Produits Alimentaires"
        subtitle="Découvrez notre sélection de produits alimentaires, disponibles à la carte."
      />
    </>
  );
};

export default FoodPage;
