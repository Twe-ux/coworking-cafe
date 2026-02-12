export function StudentOfferSchema() {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Offer",
      "name": "Happy Hours Étudiants",
      "description":
        "Tarif spécial étudiants : 12 € les 3 heures au lieu de 18 €. Du lundi au vendredi de 17h à 20h, sur présentation d'une carte étudiante valide. WiFi très haut débit, boissons à volonté incluses.",
      "price": "12",
      "priceCurrency": "EUR",
      "unitText": "3 heures",
      "availability": "https://schema.org/InStock",
      "eligibleCustomerType": "https://schema.org/Student",
      "validFrom": "17:00",
      "validThrough": "20:00",
      "offeredBy": {
        "@type": "LocalBusiness",
        "@id": "https://coworkingcafe.fr/#organization",
        "name": "CoworKing Café by Anticafé",
      },
      "areaServed": {
        "@type": "City",
        "name": "Strasbourg",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Offer",
      "name": "Happy Weekend Étudiants",
      "description":
        "Tarif spécial étudiants : 24 € la journée au lieu de 29 €. Tous les samedis, dimanches et jours fériés, sur présentation d'une carte étudiante valide. WiFi très haut débit, boissons à volonté incluses.",
      "price": "24",
      "priceCurrency": "EUR",
      "unitText": "jour",
      "availability": "https://schema.org/InStock",
      "eligibleCustomerType": "https://schema.org/Student",
      "offeredBy": {
        "@type": "LocalBusiness",
        "@id": "https://coworkingcafe.fr/#organization",
        "name": "CoworKing Café by Anticafé",
      },
      "areaServed": {
        "@type": "City",
        "name": "Strasbourg",
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
