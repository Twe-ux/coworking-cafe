import { Mail } from "lucide-react";

interface EventDetailContentProps {
  description: string;
  organizer?: string;
  contactEmail?: string;
}

export default function EventDetailContent({
  description,
  organizer,
  contactEmail,
}: EventDetailContentProps) {
  return (
    <section className="event-detail__content-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            {/* Description */}
            <div className="event-detail__description-card">
              <h2 className="event-detail__section-title">
                À propos de cet événement
              </h2>
              <div
                className="event-detail__description"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>

            {/* Organizer */}
            {organizer && (
              <div className="event-detail__organizer">
                <h3 className="event-detail__organizer-title">Organisateur</h3>
                <p className="event-detail__organizer-name">{organizer}</p>
                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="event-detail__organizer-email"
                  >
                    <Mail size={16} aria-hidden="true" />
                    <span>{contactEmail}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
