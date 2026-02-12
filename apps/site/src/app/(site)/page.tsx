import AboutOne from "../../components/site/about/aboutOne";
import HomeBlogSSR from "../../components/site/blogs/HomeBlogSSR";
import HeroOne from "../../components/site/heros/heroOne";
import ProjectsOne from "../../components/site/projects/projectsOne";
import TestimonialOne from "../../components/site/testimonial/testimonialOne";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CoworKing Café Strasbourg | Espace Coworking avec Boissons Illimitées",
  description:
    "Espace de coworking au cœur de Strasbourg. +40 boissons illimitées, Wi-Fi rapide, salles de réunion privatisables. Réservation en ligne. Le café motive • L'humain relie.",
  keywords: [
    "coworking strasbourg",
    "espace coworking strasbourg centre",
    "anticafé strasbourg",
    "bureau partagé strasbourg",
    "coworking boissons illimitées",
    "salle réunion strasbourg",
    "espace travail strasbourg",
    "télétravailleurs strasbourg",
  ],
  openGraph: {
    title: "CoworKing Café Strasbourg | Coworking + Boissons Illimitées",
    description:
      "Espace de coworking au cœur de Strasbourg. +40 boissons illimitées, Wi-Fi rapide, ambiance conviviale. Réservez votre place !",
    url: "https://coworkingcafe.fr",
    siteName: "CoworKing Café Strasbourg",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "CoworKing Café Strasbourg - Espace de coworking avec boissons illimitées",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CoworKing Café Strasbourg | Coworking + Boissons Illimitées",
    description:
      "Espace de coworking au cœur de Strasbourg. +40 boissons, Wi-Fi rapide. Réservez maintenant !",
    images: ["/images/og-image.webp"],
  },
  alternates: {
    canonical: "https://coworkingcafe.fr",
  },
};

const Home = () => {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://coworkingcafe.fr/#organization",
    "name": "CoworKing Café by Anticafé",
    "alternateName": "Anticafé Strasbourg",
    "legalName": "CoworKing Café by Anticafé",

    "description": "Espace de coworking chaleureux au cœur de Strasbourg. WiFi rapide, café et boissons à volonté, salles de réunion privatisables.",

    "url": "https://coworkingcafe.fr",
    "logo": "https://coworkingcafe.fr/images/logo-circle-white.png",
    "image": [
      "https://coworkingcafe.fr/images/banner/coworking-café.webp",
      "https://coworkingcafe.fr/images/spaces/open-space-strasbourg.webp"
    ],

    "telephone": "+33987334519",
    "email": "strasbourg@coworkingcafe.fr",

    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1 rue de la Division Leclerc",
      "addressLocality": "Strasbourg",
      "addressRegion": "Grand Est",
      "postalCode": "67000",
      "addressCountry": "FR"
    },

    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "48.5839",
      "longitude": "7.7455"
    },

    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday", "Sunday"],
        "opens": "10:00",
        "closes": "20:00"
      }
    ],

    "priceRange": "€€",

    "servesCuisine": ["Café", "Snacks"],

    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "WiFi gratuit",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Prises électriques",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Salle de réunion",
        "value": true
      }
    ],

    "sameAs": [
      "https://www.facebook.com/coworkingbyanticafeStrasbourg/",
      "https://www.instagram.com/coworking_anticafe/?hl=fr"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema)
        }}
      />
      <HeroOne />
      <AboutOne />
      <ProjectsOne isProjectUseCaseShow={true} />
      <TestimonialOne />
      <HomeBlogSSR className={"py__130"} />
    </>
  );
};

export default Home;
