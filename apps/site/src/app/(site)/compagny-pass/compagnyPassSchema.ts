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
      availability: "https://schema.org/InStock",
      offerCount: 2,
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
