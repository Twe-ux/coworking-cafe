export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://coworkingcafe.fr/#organization",
    name: "CoworKing Cafe",
    description:
      "Espace de coworking chaleureux au coeur de Strasbourg. WiFi fibre, cafe a volonte, salles de reunion privatisables.",
    url: "https://coworkingcafe.fr",
    telephone: "+33987334519",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1 rue de la Division Leclerc",
      addressLocality: "Strasbourg",
      addressRegion: "Grand Est",
      postalCode: "67000",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "48.5735",
      longitude: "7.7538",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "09:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "10:00",
        closes: "20:00",
      },
    ],
    priceRange: "$$",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "280",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
