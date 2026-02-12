interface ServiceOffer {
  price: string;
  priceCurrency: string;
  unitText: string;
}

interface ServiceItem {
  name: string;
  description: string;
  offers: ServiceOffer[];
  areaServed?: string;
}

interface ServiceSchemaProps {
  services: ServiceItem[];
}

export function ServiceSchema({ services }: ServiceSchemaProps) {
  const schema = services.map((service) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "provider": {
      "@type": "LocalBusiness",
      "@id": "https://coworkingcafe.fr/#organization",
      "name": "CoworKing Café by Anticafé",
    },
    "name": service.name,
    "description": service.description,
    "areaServed": service.areaServed || "Strasbourg",
    "offers": service.offers.map((offer) => ({
      "@type": "Offer",
      "price": offer.price,
      "priceCurrency": offer.priceCurrency,
      "unitText": offer.unitText,
      "availability": "https://schema.org/InStock",
    })),
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Real service data for /spaces page
export const spacesServices: ServiceItem[] = [
  {
    name: "Open-Space Coworking",
    description:
      "Espace de coworking lumineux et convivial de 130 m² pouvant accueillir 30 à 40 personnes. WiFi très haut débit, boissons à volonté, imprimante/scanner et casiers inclus.",
    offers: [
      { price: "6", priceCurrency: "EUR", unitText: "heure" },
      { price: "29", priceCurrency: "EUR", unitText: "jour" },
      { price: "99", priceCurrency: "EUR", unitText: "semaine" },
      { price: "290", priceCurrency: "EUR", unitText: "mois" },
    ],
  },
  {
    name: "La Verrière - Petite salle de réunion",
    description:
      "Petite salle de réunion lumineuse et calme de 7 m², idéale pour 4-5 personnes. Équipée d'un écran LCD pour projection, paperboard, WiFi très haut débit et boissons à volonté.",
    offers: [
      { price: "24", priceCurrency: "EUR", unitText: "heure" },
      { price: "120", priceCurrency: "EUR", unitText: "jour" },
    ],
  },
  {
    name: "L'Étage - Grande salle de réunion",
    description:
      "Grande salle de réunion de 35-40 m² avec salon d'accueil, pouvant accueillir 10-15 personnes (jusqu'à 20 en format conférence). Vidéoprojecteur, système son, paperboard, whiteboard, WiFi et boissons à volonté.",
    offers: [
      { price: "60", priceCurrency: "EUR", unitText: "heure" },
      { price: "300", priceCurrency: "EUR", unitText: "jour" },
    ],
  },
];
