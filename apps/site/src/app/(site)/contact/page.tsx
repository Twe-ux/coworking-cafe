import type { Metadata } from 'next';
import ContactInfo from "../../../components/site/contactInfo";
import GoogleMap from "../../../components/site/googleMap";
import PageTitle from "../../../components/site/PageTitle";
import { BreadcrumbSchema } from "../../../components/seo/BreadcrumbSchema";

export const metadata: Metadata = {
  title: 'Contact - CoworKing Café Strasbourg | Nous Contacter',
  description: 'Contactez CoworKing Café by Anticafé à Strasbourg : téléphone, email, adresse. Nous répondons à toutes vos questions sur le coworking et la location de salles.',

  keywords: [
    'anticafé strasbourg',
    'coworking strasbourg',
    'espace de travail strasbourg',
    'cafe coworking strasbourg',
    'contact coworking strasbourg',
    'coworking strasbourg adresse',
    'coworking cafe strasbourg telephone',
    'où travailler strasbourg',
  ],

  openGraph: {
    title: 'Contactez CoworKing Café Strasbourg',
    description: 'Nous contacter par téléphone, email ou venir nous voir directement. Réponse rapide à toutes vos questions sur le coworking.',
    url: 'https://coworkingcafe.fr/contact',
    type: 'website',
    images: [
      {
        url: '/images/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'CoworKing Café Strasbourg - Contact'
      }
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Contactez CoworKing Café Strasbourg',
    description: 'Nous contacter par téléphone, email ou venir nous voir directement. Réponse rapide à toutes vos questions sur le coworking.',
    images: ['/images/og-image.webp'],
  },

  alternates: {
    canonical: 'https://coworkingcafe.fr/contact',
  },
};

const Contact = () => {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Accueil", url: "https://coworkingcafe.fr" },
        { name: "Contact", url: "https://coworkingcafe.fr/contact" }
      ]} />
      <PageTitle title={"Contactez-nous"} />
      <ContactInfo />
      <GoogleMap />
    </>
  );
};

export default Contact;
