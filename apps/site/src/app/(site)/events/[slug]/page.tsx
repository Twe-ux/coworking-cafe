import { Event } from "@coworking-cafe/database";
import { connectDB } from "@/lib/mongodb";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SlideUp from "@/utils/animations/slideUp";
import { Calendar, Clock, MapPin, Users, ExternalLink } from "lucide-react";

interface EventDetailPageProps {
  params: { slug: string };
}

async function getEvent(slug: string) {
  await connectDB();

  // Get event even if past (SEO: keep old events indexed)
  const event = await Event.findOne({
    slug,
    status: "published",
  }).lean();

  if (!event) {
    return null;
  }

  return {
    ...event,
    _id: event._id.toString(),
    createdBy: event.createdBy?.toString(),
    createdAt: event.createdAt?.toString(),
    updatedAt: event.updatedAt?.toString(),
  };
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const event = await getEvent(params.slug);

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Check if event is past
  const today = new Date().toISOString().split("T")[0];
  const isPastEvent = event.date < today;

  // Schema.org JSON-LD for SEO
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.shortDescription || event.description,
    startDate: `${event.date}${event.startTime ? `T${event.startTime}` : ""}`,
    endDate: event.endTime ? `${event.date}T${event.endTime}` : undefined,
    eventStatus: isPastEvent
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: event.location
      ? {
          "@type": "Place",
          name: event.location,
        }
      : undefined,
    image: event.imgSrc,
    offers: event.price
      ? {
          "@type": "Offer",
          price: event.price,
          priceCurrency: "EUR",
          availability: isPastEvent
            ? "https://schema.org/SoldOut"
            : "https://schema.org/InStock",
        }
      : undefined,
    organizer: event.organizer
      ? {
          "@type": "Organization",
          name: event.organizer,
          email: event.contactEmail,
        }
      : undefined,
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      {/* Hero Section */}
      <section className="event-detail-hero pt__130 pb__60">
        <div className="container">
          <div className="row align-items-center">
            <SlideUp className="col-lg-6">
              <div className="event-detail-content">
                {isPastEvent && (
                  <div className="alert alert-warning mb-3" role="alert">
                    <strong>⏰ Événement passé</strong> - Cet événement a déjà eu lieu
                  </div>
                )}

                <h1 className="title mb-4">{event.title}</h1>

                {event.shortDescription && (
                  <p className="lead mb-4">{event.shortDescription}</p>
                )}

                {/* Event Meta */}
                <div className="event-meta mb-4">
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Calendar size={20} className="text-primary" />
                      <span>{formattedDate}</span>
                    </div>

                    {event.startTime && (
                      <div className="d-flex align-items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        <span>
                          {event.startTime}
                          {event.endTime && ` - ${event.endTime}`}
                        </span>
                      </div>
                    )}

                    {event.location && (
                      <div className="d-flex align-items-center gap-2">
                        <MapPin size={20} className="text-primary" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.registrationType === "internal" && event.maxParticipants && (
                      <div className="d-flex align-items-center gap-2">
                        <Users size={20} className="text-primary" />
                        <span>
                          {event.currentParticipants || 0}/{event.maxParticipants} places
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {event.category.map((cat: string) => (
                      <span key={cat} className="badge bg-secondary">
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  {event.price && event.price > 0 && (
                    <div className="event-price mb-3">
                      <strong className="fs-4 text-primary">{event.price}€</strong>
                    </div>
                  )}
                </div>

                {/* Registration Button - Only show for upcoming events */}
                {!isPastEvent && (
                  <>
                    {event.registrationType === "external" && event.externalLink && (
                      <Link
                        href={event.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="common__btn"
                      >
                        <span>S'inscrire</span>
                        <ExternalLink size={20} />
                      </Link>
                    )}

                    {event.registrationType === "internal" && (
                      <Link href="#inscription" className="common__btn">
                        <span>S'inscrire</span>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </SlideUp>

            <SlideUp delay={2} className="col-lg-6 mt-5 mt-lg-0">
              <div className="event-detail-image">
                <Image
                  src={event.imgSrc}
                  alt={event.imgAlt}
                  width={800}
                  height={600}
                  className="rounded-3 w-100"
                  priority
                  quality={90}
                />
              </div>
            </SlideUp>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="event-description py__60">
        <div className="container">
          <SlideUp>
            <div className="row">
              <div className="col-lg-8 mx-auto">
                <div className="event-description-content">
                  <h2 className="mb-4">À propos de cet événement</h2>
                  <div
                    className="description-text"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />

                  {/* Organizer */}
                  {event.organizer && (
                    <div className="mt-5 p-4 bg-light rounded-3">
                      <h5 className="mb-2">Organisateur</h5>
                      <p className="mb-0">{event.organizer}</p>
                      {event.contactEmail && (
                        <p className="mb-0">
                          <a href={`mailto:${event.contactEmail}`}>
                            {event.contactEmail}
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Back to Events */}
      <section className="py__60">
        <div className="container text-center">
          <Link href="/events" className="common__btn common__btn--outline">
            <span>Voir tous les événements</span>
          </Link>
        </div>
      </section>
    </>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: EventDetailPageProps) {
  const event = await getEvent(params.slug);

  if (!event) {
    return {
      title: "Événement introuvable",
    };
  }

  return {
    title: `${event.title} | CoworKing Café`,
    description: event.shortDescription || event.description.substring(0, 160),
    openGraph: {
      title: event.title,
      description: event.shortDescription || event.description.substring(0, 160),
      images: [event.imgSrc],
      type: "website",
    },
  };
}
