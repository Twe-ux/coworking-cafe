const BASE_URL = "https://coworkingcafe.fr";

interface EventSchemaInput {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  imgSrc: string;
  price?: number;
  organizer?: string;
  contactEmail?: string;
  category: string[];
  registrationType: string;
  externalLink?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  isPastEvent: boolean;
}

export function buildEventJsonLd(event: EventSchemaInput) {
  const isFullyBooked =
    event.registrationType === "internal" &&
    event.maxParticipants &&
    event.currentParticipants &&
    event.currentParticipants >= event.maxParticipants;

  const availability = event.isPastEvent
    ? "https://schema.org/SoldOut"
    : isFullyBooked
      ? "https://schema.org/SoldOut"
      : "https://schema.org/InStock";

  const eventUrl = `${BASE_URL}/events/${event.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.shortDescription || event.description,
    url: eventUrl,
    startDate: `${event.date}${event.startTime ? `T${event.startTime}:00` : ""}`,
    ...(event.endTime ? { endDate: `${event.date}T${event.endTime}:00` } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location || "CoworKing Café by Anticafé",
      address: {
        "@type": "PostalAddress",
        streetAddress: "1 rue de Thiergarten",
        addressLocality: "Strasbourg",
        postalCode: "67000",
        addressRegion: "Grand Est",
        addressCountry: "FR",
      },
    },
    image: event.imgSrc,
    ...(event.price
      ? {
          offers: {
            "@type": "Offer",
            price: event.price,
            priceCurrency: "EUR",
            availability,
            url: eventUrl,
            validFrom: event.date,
          },
        }
      : {
          isAccessibleForFree: true,
        }),
    organizer: {
      "@type": "Organization",
      name: event.organizer || "CoworKing Café by Anticafé",
      url: BASE_URL,
      ...(event.contactEmail ? { email: event.contactEmail } : {}),
    },
    ...(event.maxParticipants
      ? { maximumAttendeeCapacity: event.maxParticipants }
      : {}),
  };
}

interface EventMetadataInput {
  title: string;
  slug: string;
  shortDescription?: string;
  date: string;
  imgSrc: string;
  imgAlt: string;
  category: string[];
}

export function buildEventMetadata(event: EventMetadataInput) {
  const eventDate = new Date(event.date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const description = event.shortDescription
    ? `${event.shortDescription} - ${eventDate} à Strasbourg`
    : `${event.title} le ${eventDate} au CoworKing Café Strasbourg`;

  return {
    title: `${event.title} | Événement CoworKing Café Strasbourg`,
    description: description.substring(0, 160),
    keywords: [
      ...event.category,
      "événement strasbourg",
      "coworking café strasbourg",
      event.title.toLowerCase(),
    ],
    openGraph: {
      title: event.title,
      description: description.substring(0, 160),
      url: `${BASE_URL}/events/${event.slug}`,
      siteName: "CoworKing Café Strasbourg",
      locale: "fr_FR",
      type: "website" as const,
      images: [
        {
          url: event.imgSrc,
          width: 1200,
          height: 630,
          alt: event.imgAlt || event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: event.title,
      description: description.substring(0, 160),
      images: [event.imgSrc],
    },
    alternates: {
      canonical: `${BASE_URL}/events/${event.slug}`,
    },
  };
}

export { BASE_URL };
