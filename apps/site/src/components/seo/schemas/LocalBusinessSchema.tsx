export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CoworkingSpace",
    "@id": "https://coworkingcafe.fr/#localbusiness",
    "name": "Cow-or-King Café Strasbourg",
    "alternateName": ["CoworKing Café by Anticafé", "Anticafé Strasbourg"],
    "description": "Espace de coworking chaleureux au cœur de Strasbourg. WiFi rapide, café et boissons à volonté, salles de réunion privatisables. Réservation en ligne.",
    "url": "https://coworkingcafe.fr",
    "telephone": "+33987334519",
    "email": "strasbourg@coworkingcafe.fr",
    "priceRange": "€€",
    "image": [
      "https://coworkingcafe.fr/images/banner/coworking-café.webp",
      "https://coworkingcafe.fr/images/logo-circle-white.webp"
    ],
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
      "latitude": 48.5829,
      "longitude": 7.7482
    },
    "hasMap": "https://maps.app.goo.gl/yourGoogleMapsLink",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "18:00"
      }
    ],
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "WiFi rapide",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Boissons illimitées",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Salles de réunion",
        "value": true
      }
    ],
    "potentialAction": [
      {
        "@type": "ReserveAction",
        "name": "Réserver un espace de coworking",
        "description": "Réservez votre place en ligne - Open-space, salle de réunion ou espace événementiel",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://coworkingcafe.fr/booking",
          "actionPlatform": [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/MobileWebPlatform",
            "http://schema.org/IOSPlatform",
            "http://schema.org/AndroidPlatform"
          ]
        }
      },
      {
        "@type": "ViewAction",
        "name": "Voir les espaces",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://coworkingcafe.fr/spaces"
        }
      },
      {
        "@type": "CommunicateAction",
        "name": "Nous contacter",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://coworkingcafe.fr/contact"
        }
      }
    ],
    "sameAs": [
      "https://www.facebook.com/coworkingbyanticafeStrasbourg/",
      "https://www.instagram.com/coworking_anticafe/?hl=fr"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
