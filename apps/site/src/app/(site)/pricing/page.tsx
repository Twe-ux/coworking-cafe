import type { Metadata } from 'next';
import ProtectedEmail from "../../../components/common/ProtectedEmail";
import PageTitle from "../../../components/site/PageTitle";
import PricingMeetingRoom from "../../../components/site/pricing/pricingMeetingRoom";
import PricingOpenSpace from "../../../components/site/pricing/pricingOpenSpace";
import { BreadcrumbSchema } from "../../../components/seo/BreadcrumbSchema";
import { FAQPageSchema, pricingFAQs, OfferSchema, pricingOffers } from "../../../components/seo/schemas";

export const metadata: Metadata = {
  title: 'Tarifs Coworking & Salles de Réunion | CoworKing Café Strasbourg',
  description: 'Découvrez nos tarifs flexibles pour le coworking à Strasbourg : à l\'heure, à la journée ou au mois. Location de salles de réunion équipées. Tarifs étudiants disponibles.',

  keywords: [
    'anticafé strasbourg',
    'coworking strasbourg',
    'espace de travail strasbourg',
    'cafe coworking strasbourg',
    'tarifs coworking strasbourg',
    'prix coworking strasbourg',
    'salle reunion strasbourg',
    'espace de travail strasbourg tarif',
    'coworking pas cher strasbourg',
  ],

  openGraph: {
    title: 'Tarifs Coworking & Salles de Réunion à Strasbourg',
    description: 'Tarifs flexibles pour le coworking : à l\'heure, à la journée ou au mois. Location de salles de réunion équipées à Strasbourg.',
    url: 'https://coworkingcafe.fr/pricing',
    type: 'website',
    images: [
      {
        url: '/images/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'CoworKing Café Strasbourg - Tarifs'
      }
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Tarifs Coworking & Salles de Réunion à Strasbourg',
    description: 'Tarifs flexibles pour le coworking : à l\'heure, à la journée ou au mois. Location de salles de réunion équipées à Strasbourg.',
    images: ['/images/og-image.webp'],
  },

  alternates: {
    canonical: 'https://coworkingcafe.fr/pricing',
  },
};

const Pricing = () => {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Accueil", url: "https://coworkingcafe.fr" },
        { name: "Nos Tarifs", url: "https://coworkingcafe.fr/pricing" }
      ]} />
      <FAQPageSchema faqs={pricingFAQs} />
      <OfferSchema offers={pricingOffers} />
      <PageTitle title={"Nos tarifs"} />
      <section className="pricing py__130" id="pricing">
        <div className="container">
          <PricingOpenSpace />
          <PricingMeetingRoom />
          <h2 className="pricing__title pt__50">Tarif Privatisation</h2>
          <h6>
            Pour privatiser tout l'établissement, merci de faire votre demande
            par mail à{" "}
            <ProtectedEmail
              user="strasbourg"
              domain="coworkingcafe.fr"
              className="email"
            />
          </h6>
        </div>
      </section>
    </>
  );
};

export default Pricing;
