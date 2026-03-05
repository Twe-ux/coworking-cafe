import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ExternalLink } from "lucide-react";

interface EventsCardProps {
  slug: string;
  title: string;
  shortDescription?: string;
  date: string;
  startTime?: string;
  category: string[];
  imgSrc: string;
  imgAlt: string;
  priceType?: "free" | "organizer" | "fixed";
  price?: number;
  registrationType: "internal" | "external";
  externalLink?: string;
  maxParticipants?: number;
  currentParticipants?: number;
}

export default function EventsCard({
  slug,
  title,
  shortDescription,
  date,
  startTime,
  category,
  imgSrc,
  imgAlt,
  priceType,
  price,
  registrationType,
  externalLink,
  maxParticipants,
  currentParticipants,
}: EventsCardProps) {
  const eventDate = new Date(date);
  const formattedDate = eventDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isFullyBooked =
    registrationType === "internal" &&
    maxParticipants &&
    currentParticipants &&
    currentParticipants >= maxParticipants;

  const truncatedDescription =
    shortDescription && shortDescription.length > 100
      ? `${shortDescription.substring(0, 100)}...`
      : shortDescription;

  return (
    <article className="events-card">
      <div className="events-card__image-wrapper">
        <Link href={`/events/${slug}`} aria-label={`Voir ${title}`}>
          <Image
            src={imgSrc}
            alt={imgAlt}
            width={400}
            height={300}
            className="events-card__image"
            loading="lazy"
            quality={85}
            sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 25vw"
          />
        </Link>

        {category.length > 0 && (
          <div className="events-card__categories">
            {category.slice(0, 2).map((cat) => (
              <span key={cat} className="events-card__category">
                {cat}
              </span>
            ))}
            {category.length > 2 && (
              <span className="events-card__category events-card__category--extra">
                +{category.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="events-card__content">
        <h3 className="events-card__title">
          <Link href={`/events/${slug}`}>{title}</Link>
        </h3>

        {truncatedDescription && (
          <p className="events-card__description">{truncatedDescription}</p>
        )}

        <div className="events-card__meta">
          <div className="events-card__meta-datetime">
            <span className="events-card__meta-date">
              <Calendar
                size={14}
                className="events-card__meta-icon"
                aria-hidden="true"
              />
              {formattedDate}
            </span>
            {startTime && (
              <span className="events-card__meta-time">
                <Clock
                  size={14}
                  className="events-card__meta-icon"
                  aria-hidden="true"
                />
                {startTime}
              </span>
            )}
          </div>
        </div>

        {/* Price display based on priceType */}
        {priceType === "fixed" && price !== undefined && price > 0 && (
          <div className="events-card__price">{price}&euro;</div>
        )}
        {priceType === "organizer" && (
          <div className="events-card__price events-card__price--info">
            Prix fixé par l&apos;organisateur
          </div>
        )}
        {priceType === "free" && (
          <div className="events-card__price events-card__price--free">Gratuit</div>
        )}

        <div className="events-card__actions">
          {isFullyBooked ? (
            <span className="events-card__badge--full">Complet</span>
          ) : (
            <>
              {registrationType === "external" && externalLink ? (
                <Link
                  href={externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="events-card__btn-primary"
                  aria-label={`S'inscrire à ${title} (lien externe)`}
                >
                  <span>S&apos;inscrire</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href={`/events/${slug}#inscription`}
                  className="events-card__btn-primary"
                  aria-label={`S'inscrire à ${title}`}
                >
                  S&apos;inscrire
                </Link>
              )}
              <Link
                href={`/events/${slug}`}
                className="events-card__btn-secondary"
                aria-label={`Voir détails de ${title}`}
              >
                Voir détails
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
