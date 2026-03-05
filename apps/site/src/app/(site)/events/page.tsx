import { AnchorLink } from "@/components/common/AnchorLink";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import PageTitle from "@/components/site/PageTitle";
import EventsCard from "@/components/site/events/EventsCard";
import { connectDB } from "@/lib/mongodb";
import SlideDown from "@/utils/animations/slideDown";
import SlideUp from "@/utils/animations/slideUp";
import { Event } from "@coworking-cafe/database";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const BASE_URL = "https://coworkingcafe.fr";

export const metadata: Metadata = {
  title: "Événements & Ateliers à Strasbourg | CoworKing Café",
  description:
    "Découvrez nos ateliers, formations et rencontres professionnelles à Strasbourg. Networking, conférences et workshops dans un espace coworking convivial.",
  keywords: [
    "événements coworking strasbourg",
    "ateliers professionnels strasbourg",
    "networking strasbourg",
    "conférences strasbourg",
    "workshops strasbourg",
    "formations professionnelles strasbourg",
    "rencontres professionnelles alsace",
  ],
  openGraph: {
    title: "Événements & Ateliers à Strasbourg | CoworKing Café",
    description:
      "Ateliers, formations, networking et conférences au CoworKing Café Strasbourg. Rejoignez notre communauté lors de nos prochains événements.",
    url: `${BASE_URL}/events`,
    siteName: "CoworKing Café Strasbourg",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/events/organiser-atelier-evenement-strasbourg.webp",
        width: 1200,
        height: 630,
        alt: "Événements et ateliers au CoworKing Café Strasbourg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Événements & Ateliers | CoworKing Café Strasbourg",
    description:
      "Ateliers, formations, networking et conférences au CoworKing Café Strasbourg.",
    images: ["/images/events/organiser-atelier-evenement-strasbourg.webp"],
  },
  alternates: {
    canonical: `${BASE_URL}/events`,
  },
};

async function getUpcomingEvents() {
  await connectDB();

  const events = await Event.find({
    status: "published",
    date: { $gte: new Date().toISOString().split("T")[0] },
  })
    .sort({ date: 1, startTime: 1 })
    .limit(12)
    .lean();

  return events.map((event) => ({
    ...event,
    _id: event._id.toString(),
    createdBy: event.createdBy?.toString(),
    createdAt: event.createdAt?.toString(),
    updatedAt: event.updatedAt?.toString(),
  }));
}

function buildItemListSchema(
  events: Awaited<ReturnType<typeof getUpcomingEvents>>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Événements à venir au CoworKing Café Strasbourg",
    description:
      "Liste des prochains ateliers, formations et rencontres professionnelles.",
    numberOfItems: events.length,
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${BASE_URL}/events/${event.slug}`,
      name: event.title,
      item: {
        "@type": "Event",
        name: event.title,
        description: event.shortDescription || event.title,
        startDate: `${event.date}${event.startTime ? `T${event.startTime}:00` : ""}`,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: event.location || "CoworKing Café by Anticafé",
          address: {
            "@type": "PostalAddress",
            streetAddress: "1 rue de Thiergarten",
            addressLocality: "Strasbourg",
            postalCode: "67000",
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
                availability: "https://schema.org/InStock",
                url: `${BASE_URL}/events/${event.slug}`,
              },
            }
          : {}),
        organizer: {
          "@type": "Organization",
          name: "CoworKing Café by Anticafé",
          url: BASE_URL,
        },
      },
    })),
  };
}

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <>
      {/* Schema.org JSON-LD */}
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: BASE_URL },
          { name: "Événements", url: `${BASE_URL}/events` },
        ]}
      />
      {events.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildItemListSchema(events)),
          }}
        />
      )}

      <PageTitle title={"Événements"} />

      {/* Events à venir */}
      <section className="all__project pt__130">
        <div className="container">
          {/* <h2 className="mb-5 text-center">Nos prochains événements</h2> */}
          {events.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                Aucun événement à venir pour le moment.
              </p>
            </div>
          ) : (
            <div className="events-grid mt-5" id="events">
              {events.map((event, index) => (
                <SlideUp key={event._id} delay={index + 1}>
                  <EventsCard
                    slug={event.slug}
                    title={event.title}
                    shortDescription={event.shortDescription}
                    date={event.date}
                    startTime={event.startTime}
                    category={event.category}
                    imgSrc={event.imgSrc}
                    imgAlt={event.imgAlt}
                    priceType={(event as any).priceType}
                    price={event.price}
                    registrationType={event.registrationType}
                    externalLink={event.externalLink}
                    maxParticipants={event.maxParticipants}
                    currentParticipants={event.currentParticipants}
                  />
                </SlideUp>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Description - Organiser un événement */}
      <section className="spaces spaces__2 py__130" id="spaces">
        <div className="container position-relative">
          <SlideDown className="">
            <h2 className="title text-white">
              Si toi aussi tu veux organiser un événement chez nous...
            </h2>
          </SlideDown>
          <section className="tools__concept py__90 ">
            <div className="container">
              <div className="projects__usecase">
                <div className="row align-items-center">
                  <SlideUp className="col-lg-6">
                    <div className="projects__usecase_content">
                      <p className="">
                        Vous cherchez un lieu chaleureux, central et fonctionnel
                        pour organiser un événement ?
                      </p>
                      <p className="mt-4">
                        Coworking Café by Anticafé accueille aussi ateliers,
                        formations, conférences, rencontres professionnelles,
                        groupes de parole, lancements de produits ou points
                        boutiques, en format public ou privé.
                      </p>
                      <p className="mt-4">
                        Nos espaces sont modulables, équipés et pensés pour
                        favoriser les échanges, dans une ambiance conviviale et
                        propice aux rencontres. Que ce soit pour un événement
                        ponctuel ou récurrent, nous étudions les demandes avec
                        attention afin de proposer un cadre adapté à votre
                        format.
                      </p>

                      <p className="mt-4">
                        Contactez-nous par email pour nous présenter votre
                        projet et connaître les conditions de mise à disposition
                        de nos espaces.
                      </p>

                      <AnchorLink
                        href="/contact#contact"
                        className="common__btn mt-5"
                      >
                        <span>Nous contacter</span>
                        <Image
                          src="/icons/arrow-up-rignt-black.svg"
                          alt="Icône lien vers page contact"
                          width={20}
                          height={20}
                          loading="lazy"
                        />
                      </AnchorLink>
                    </div>
                  </SlideUp>

                  <SlideUp delay={2} className="col-lg-6 mt-5 mt-lg-0">
                    <div className="spaces__carousel">
                      <Image
                        src="/images/events/organiser-atelier-evenement-strasbourg.webp"
                        alt="Organiser un atelier ou événement professionnel au CoworKing Café Strasbourg"
                        width={800}
                        height={600}
                        loading="lazy"
                        quality={85}
                        className="spaces__carousel_img rounded-3"
                        sizes="(max-width: 991px) 100vw, 50vw"
                      />
                    </div>
                  </SlideUp>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}

// Revalidate every hour (balance between freshness and performance)
export const revalidate = 3600;
