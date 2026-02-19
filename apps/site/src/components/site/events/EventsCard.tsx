import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react";

interface EventsCardProps {
  slug: string;
  title: string;
  shortDescription?: string;
  date: string;
  startTime?: string;
  category: string[];
  imgSrc: string;
  imgAlt: string;
  location?: string;
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
  location,
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

  return (
    <div className="project__card h-100">
      <div className="project__card_img">
        <Link href={`/events/${slug}`}>
          <Image
            src={imgSrc}
            alt={imgAlt}
            width={400}
            height={300}
            className="w-100"
            loading="lazy"
            quality={85}
          />
        </Link>

        {/* Categories */}
        {category && category.length > 0 && (
          <div className="project__card_category">
            {category.slice(0, 2).map((cat, index) => (
              <span key={index} className="badge bg-primary me-1">
                {cat}
              </span>
            ))}
            {category.length > 2 && (
              <span className="badge bg-secondary">+{category.length - 2}</span>
            )}
          </div>
        )}
      </div>

      <div className="project__card_content">
        <Link href={`/events/${slug}`}>
          <h3 className="project__card_title">{title}</h3>
        </Link>

        {shortDescription && (
          <p className="project__card_description text-muted">
            {shortDescription.length > 100
              ? `${shortDescription.substring(0, 100)}...`
              : shortDescription}
          </p>
        )}

        {/* Event Meta */}
        <div className="event__meta mt-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Calendar size={16} className="text-primary" />
            <span className="small">{formattedDate}</span>
          </div>

          {startTime && (
            <div className="d-flex align-items-center gap-2 mb-2">
              <Clock size={16} className="text-primary" />
              <span className="small">{startTime}</span>
            </div>
          )}

          {location && (
            <div className="d-flex align-items-center gap-2 mb-2">
              <MapPin size={16} className="text-primary" />
              <span className="small">{location}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {price && price > 0 && (
          <div className="event__price mt-2">
            <strong className="text-primary">{price}€</strong>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-3">
          {isFullyBooked ? (
            <span className="badge bg-danger">Complet</span>
          ) : registrationType === "external" && externalLink ? (
            <Link
              href={externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="common__btn common__btn--sm"
            >
              <span>S'inscrire</span>
              <ExternalLink size={16} />
            </Link>
          ) : (
            <Link href={`/events/${slug}`} className="common__btn common__btn--sm">
              <span>En savoir plus</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
