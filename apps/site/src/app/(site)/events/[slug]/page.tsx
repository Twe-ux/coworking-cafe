import { Event } from "@coworking-cafe/database";
import { connectDB } from "@/lib/mongodb";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { buildEventJsonLd, buildEventMetadata, BASE_URL } from "./eventSchema";
import EventDetailHero from "@/components/site/events/EventDetailHero";
import EventDetailContent from "@/components/site/events/EventDetailContent";
import RegistrationForm from "@/components/site/events/RegistrationForm";
import type { Metadata } from "next";

interface EventDetailPageProps {
  params: { slug: string };
}

async function getEvent(slug: string) {
  await connectDB();
  const event = await Event.findOne({ slug, status: "published" }).lean();
  if (!event) return null;

  return {
    ...event,
    _id: event._id.toString(),
    createdBy: event.createdBy?.toString(),
    createdAt: event.createdAt?.toString(),
    updatedAt: event.updatedAt?.toString(),
  };
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const event = await getEvent(params.slug);
  if (!event) return { title: "Événement introuvable | CoworKing Café" };
  return buildEventMetadata(event);
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const event = await getEvent(params.slug);
  if (!event) notFound();

  const formattedDate = new Date(event.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const isPastEvent = event.date < new Date().toISOString().split("T")[0];

  return (
    <div className="event-detail pb__260">
      <BreadcrumbSchema
        items={[
          { name: "Accueil", url: BASE_URL },
          { name: "Événements", url: `${BASE_URL}/events` },
          { name: event.title, url: `${BASE_URL}/events/${params.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildEventJsonLd({ ...event, isPastEvent })),
        }}
      />

      {/* Breadcrumb */}
      <nav className="event-detail__breadcrumb" aria-label="Fil d'Ariane">
        <div className="container">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link href="/">Accueil</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/events">Événements</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {event.title}
            </li>
          </ol>
        </div>
      </nav>

      <EventDetailHero
        title={event.title}
        shortDescription={event.shortDescription}
        date={event.date}
        formattedDate={formattedDate}
        startTime={event.startTime}
        endTime={event.endTime}
        location={event.location}
        category={event.category}
        price={event.price}
        imgSrc={event.imgSrc}
        imgAlt={event.imgAlt}
        registrationType={event.registrationType}
        externalLink={event.externalLink}
        maxParticipants={event.maxParticipants}
        currentParticipants={event.currentParticipants}
        isPastEvent={isPastEvent}
      />

      <EventDetailContent
        description={event.description}
        organizer={event.organizer}
        contactEmail={event.contactEmail}
      />

      {/* Registration */}
      {event.registrationType === "internal" && !isPastEvent && (
        <section id="inscription" className="event-detail__registration">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto">
                <h2 className="event-detail__section-title text-center">
                  Inscription
                </h2>
                {event.maxParticipants &&
                (event.currentParticipants || 0) >= event.maxParticipants ? (
                  <div className="event-detail__registration-full">
                    <p>Cet événement est complet.</p>
                  </div>
                ) : (
                  <RegistrationForm eventSlug={params.slug} />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Back to events */}
      <div className="event-detail__back mt-5">
        <div className="container text-center">
          <Link href="/events" className="common__btn">
            <span>Voir tous les événements</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
