export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://coworkingcafe.fr/#organization",
    "name": "CoworKing Café by Anticafé",
    "alternateName": "Anticafé Strasbourg",
    "url": "https://coworkingcafe.fr",
    "logo": {
      "@type": "ImageObject",
      "url": "https://coworkingcafe.fr/images/logo-circle-white.webp",
      "width": 512,
      "height": 512,
    },
    "image": "https://coworkingcafe.fr/images/banner/coworking-café.webp",
    "description":
      "Espace de coworking chaleureux au cœur de Strasbourg. WiFi rapide, café et boissons à volonté, salles de réunion privatisables.",
    "telephone": "+33987334519",
    "email": "strasbourg@coworkingcafe.fr",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1 rue de la Division Leclerc",
      "addressLocality": "Strasbourg",
      "addressRegion": "Grand Est",
      "postalCode": "67000",
      "addressCountry": "FR",
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+33987334519",
      "email": "strasbourg@coworkingcafe.fr",
      "contactType": "customer service",
      "availableLanguage": ["French", "English"],
      "areaServed": "FR",
    },
    "sameAs": [
      "https://www.facebook.com/coworkingbyanticafeStrasbourg/",
      "https://www.instagram.com/coworking_anticafe/?hl=fr",
    ],
    "foundingDate": "2017",
    "foundingLocation": {
      "@type": "Place",
      "name": "Strasbourg, France",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
