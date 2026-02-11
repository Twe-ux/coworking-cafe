import AboutOne from "../../components/site/about/aboutOne";
import HomeBlogSSR from "../../components/site/blogs/HomeBlogSSR";
import HeroOne from "../../components/site/heros/heroOne";
import ProjectsOne from "../../components/site/projects/projectsOne";
import TestimonialOne from "../../components/site/testimonial/testimonialOne";

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
