import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Users, ExternalLink } from "lucide-react";

interface EventDetailHeroProps {
  title: string;
  shortDescription?: string;
  date: string;
  formattedDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  category: string[];
  priceType?: "free" | "organizer" | "fixed";
  price?: number;
  imgSrc: string;
  imgAlt: string;
  registrationType: string;
  externalLink?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  isPastEvent: boolean;
}

export default function EventDetailHero({
  title,
  shortDescription,
  date,
  formattedDate,
  startTime,
  endTime,
  location,
  category,
  priceType,
  price,
  imgSrc,
  imgAlt,
  registrationType,
  externalLink,
  maxParticipants,
  currentParticipants,
  isPastEvent,
}: EventDetailHeroProps) {
  const remaining = maxParticipants
    ? maxParticipants - (currentParticipants || 0)
    : null;
  const fillPercent = maxParticipants
    ? ((currentParticipants || 0) / maxParticipants) * 100
    : 0;

  return (
    <section className="event-detail__hero">
      <div className="container">
        <div className="row align-items-center">
          {/* Image */}
          <div className="col-lg-6 order-1 order-lg-2 mb-4 mb-lg-0">
            <div className="event-detail__hero-image">
              <Image
                src={imgSrc}
                alt={imgAlt}
                width={800}
                height={600}
                className="event-detail__image"
                priority
                quality={90}
                sizes="(max-width: 991px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Content */}
          <div className="col-lg-6 order-2 order-lg-1">
            <div className="event-detail__hero-content">
              {isPastEvent && (
                <span className="event-detail__past-badge">
                  Événement passé
                </span>
              )}

              <h1 className="event-detail__title">{title}</h1>

              {shortDescription && (
                <p className="event-detail__subtitle">{shortDescription}</p>
              )}

              {/* Meta */}
              <div className="event-detail__meta">
                <div className="event-detail__meta-item">
                  <Calendar size={18} className="event-detail__meta-icon" aria-hidden="true" />
                  <time dateTime={date}>{formattedDate}</time>
                </div>
                {startTime && (
                  <div className="event-detail__meta-item">
                    <Clock size={18} className="event-detail__meta-icon" aria-hidden="true" />
                    <time dateTime={`${date}T${startTime}`}>
                      {startTime}{endTime && ` - ${endTime}`}
                    </time>
                  </div>
                )}
                {location && (
                  <div className="event-detail__meta-item">
                    <MapPin size={18} className="event-detail__meta-icon" aria-hidden="true" />
                    <span>{location}</span>
                  </div>
                )}
                {registrationType === "internal" && maxParticipants && (
                  <div className="event-detail__meta-item">
                    <Users size={18} className="event-detail__meta-icon" aria-hidden="true" />
                    <span>{currentParticipants || 0}/{maxParticipants} places</span>
                  </div>
                )}
              </div>

              {/* Categories */}
              {category.length > 0 && (
                <div className="event-detail__categories">
                  {category.map((cat) => (
                    <span key={cat} className="event-detail__category">{cat}</span>
                  ))}
                </div>
              )}

              {/* Price */}
              {priceType === "fixed" && price && price > 0 ? (
                <div className="event-detail__price">{price}&euro;</div>
              ) : priceType === "organizer" ? (
                <div className="event-detail__price event-detail__price--info">
                  Prix fixé par l&apos;organisateur
                </div>
              ) : (
                <div className="event-detail__price event-detail__price--free">Gratuit</div>
              )}

              {/* Availability bar */}
              {registrationType === "internal" && maxParticipants && !isPastEvent && (
                <div className="event-detail__availability">
                  <div className="event-detail__availability-header">
                    <span>Places disponibles</span>
                    <span className="event-detail__availability-count">
                      {remaining} / {maxParticipants}
                    </span>
                  </div>
                  <div className="event-detail__availability-bar">
                    <div
                      className="event-detail__availability-fill"
                      style={{ width: `${fillPercent}%` }}
                      role="progressbar"
                      aria-valuenow={currentParticipants || 0}
                      aria-valuemin={0}
                      aria-valuemax={maxParticipants}
                    />
                  </div>
                </div>
              )}

              {/* CTA */}
              {!isPastEvent && (
                <>
                  {registrationType === "external" && externalLink && (
                    <Link
                      href={externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="event-detail__cta"
                    >
                      <span>S&apos;inscrire</span>
                      <ExternalLink size={18} />
                    </Link>
                  )}
                  {registrationType === "internal" && (
                    <Link href="#inscription" className="event-detail__cta">
                      <span>S&apos;inscrire</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
