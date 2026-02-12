interface OfferItem {
  name: string;
  description: string;
  price: string;
  priceCurrency: string;
  unitText: string;
  eligibleQuantity?: string;
}

interface OfferSchemaProps {
  offers: OfferItem[];
}

export function OfferSchema({ offers }: OfferSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "name": "Tarifs CoworKing Café Strasbourg",
    "itemListElement": offers.map((offer) => ({
      "@type": "Offer",
      "name": offer.name,
      "description": offer.description,
      "price": offer.price,
      "priceCurrency": offer.priceCurrency,
      "unitText": offer.unitText,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "LocalBusiness",
        "@id": "https://coworkingcafe.fr/#organization",
        "name": "CoworKing Café by Anticafé",
      },
      ...(offer.eligibleQuantity && {
        "eligibleQuantity": {
          "@type": "QuantitativeValue",
          "value": offer.eligibleQuantity,
        },
      }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Real offer data for /pricing page
export const pricingOffers: OfferItem[] = [
  {
    name: "Open-Space - Forfait horaire",
    description:
      "Accès open-space, WiFi très haut débit, boissons à volonté, imprimante/scanner, casiers. 1ère heure en entier, puis au prorata.",
    price: "6",
    priceCurrency: "EUR",
    unitText: "heure",
  },
  {
    name: "Open-Space - Forfait journée",
    description:
      "Accès open-space toute la journée. WiFi, boissons à volonté, encas inclus, imprimante/scanner, casiers. Bascule automatique depuis 4h50.",
    price: "29",
    priceCurrency: "EUR",
    unitText: "jour",
  },
  {
    name: "Open-Space - Abonnement semaine",
    description:
      "Accès illimité pendant 7 jours consécutifs. WiFi, boissons à volonté, encas inclus, programme membre fidélité.",
    price: "99",
    priceCurrency: "EUR",
    unitText: "semaine",
  },
  {
    name: "Open-Space - Abonnement mois",
    description:
      "Accès illimité pendant 30 jours consécutifs. WiFi, boissons à volonté, encas inclus, programme membre fidélité.",
    price: "290",
    priceCurrency: "EUR",
    unitText: "mois",
  },
  {
    name: "La Verrière - Location horaire",
    description:
      "Petite salle de réunion (4-5 personnes). Écran LCD, paperboard, WiFi, boissons à volonté.",
    price: "24",
    priceCurrency: "EUR",
    unitText: "heure",
    eligibleQuantity: "4-5 personnes",
  },
  {
    name: "La Verrière - Location journée",
    description:
      "Petite salle de réunion à la journée (4-5 personnes). Écran LCD, paperboard, WiFi, boissons à volonté.",
    price: "120",
    priceCurrency: "EUR",
    unitText: "jour",
    eligibleQuantity: "4-5 personnes",
  },
  {
    name: "L'Étage - Location horaire",
    description:
      "Grande salle de réunion avec salon d'accueil (10-15 personnes). Vidéoprojecteur, système son, paperboard, whiteboard, WiFi, boissons à volonté.",
    price: "60",
    priceCurrency: "EUR",
    unitText: "heure",
    eligibleQuantity: "10-15 personnes",
  },
  {
    name: "L'Étage - Location journée",
    description:
      "Grande salle de réunion avec salon d'accueil à la journée (10-15 personnes). Vidéoprojecteur, système son, paperboard, whiteboard, WiFi, boissons à volonté.",
    price: "300",
    priceCurrency: "EUR",
    unitText: "jour",
    eligibleQuantity: "10-15 personnes",
  },
];
