export function generateCompagnyPassSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Pass Entreprise CoworKing Café",
    description:
      "Abonnement flexible pour équipes au coworking de Strasbourg. Forfait prépayé ou facturation mensuelle au réel.",
    brand: {
      "@type": "Brand",
      name: "CoworKing Café by Anticafé",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: "6",
      highPrice: "290",
      availability: "https://schema.org/InStock",
      offerCount: 2,
      priceSpecification: [
        {
          "@type": "UnitPriceSpecification",
          price: "6",
          priceCurrency: "EUR",
          name: "Tarif horaire",
          description: "À partir de 6€/heure pour l'accès open-space",
        },
        {
          "@type": "UnitPriceSpecification",
          price: "290",
          priceCurrency: "EUR",
          name: "Abonnement mensuel",
          description: "À partir de 290€/mois pour l'accès illimité",
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "32",
      bestRating: "5",
      worstRating: "1",
    },
    provider: {
      "@type": "LocalBusiness",
      name: "CoworKing Café by Anticafé",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Strasbourg",
        addressRegion: "Grand Est",
        addressCountry: "FR",
      },
    },
  };
}
