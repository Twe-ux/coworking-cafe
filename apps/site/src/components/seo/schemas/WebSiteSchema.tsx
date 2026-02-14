export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://coworkingcafe.fr/#website",
    name: "Cow-or-King Café Strasbourg",
    alternateName: ["CoworKing Café", "Anticafé Strasbourg"],
    url: "https://coworkingcafe.fr",
    publisher: {
      "@id": "https://coworkingcafe.fr/#organization",
    },
    inLanguage: "fr-FR",
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://coworkingcafe.fr/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
      {
        "@type": "ReserveAction",
        name: "Réserver un espace",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://coworkingcafe.fr/booking",
          actionPlatform: [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/MobileWebPlatform"
          ]
        },
      }
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
