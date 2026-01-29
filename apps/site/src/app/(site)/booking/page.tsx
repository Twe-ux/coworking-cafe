"use client";

import BookingProgressBar from "@/components/site/booking/BookingProgressBar";
import PageTitle from "@/components/site/PageTitle";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SpaceConfig {
  spaceType: string;
  name: string;
  slug: string;
  description?: string;
  pricing: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
    perPerson: boolean;
  };
  availableReservationTypes: {
    hourly: boolean;
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
  requiresQuote: boolean;
  minCapacity: number;
  maxCapacity: number;
  imageUrl?: string;
  displayOrder: number;
  features?: string[];
}

interface DisplaySpace {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image: string;
  capacity: string;
  features: string[];
  priceFrom: string;
  hourlyPrice: string;
  dailyPrice: string;
  requiresQuote: boolean;
}

// Mapping DB spaceType to URL slug
const spaceTypeToSlug: Record<string, string> = {
  "open-space": "open-space",
  "salle-verriere": "meeting-room-glass",
  "salle-etage": "meeting-room-floor",
  evenementiel: "event-space",
};

// Static display data (icons only - features come from DB)
const spaceDisplayData: Record<string, Partial<DisplaySpace>> = {
  "open-space": {
    title: "Place",
    subtitle: "Open-space",
    icon: "bi-person-workspace",
  },
  "salle-verriere": {
    title: "Salle de réunion",
    subtitle: "Verrière",
    icon: "bi-briefcase",
  },
  "salle-etage": {
    title: "Salle de réunion",
    subtitle: "Étage",
    icon: "bi-building",
  },
  evenementiel: {
    title: "Événementiel",
    subtitle: "Grand espace",
    icon: "bi-calendar-event",
  },
};

export default function BookingPage() {
  const [spaces, setSpaces] = useState<DisplaySpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTTC, setShowTTC] = useState(true);

  // Function to convert price string from TTC to HT or vice versa
  // Hourly = 10% VAT, Daily = 20% VAT
  const convertPrice = (priceString: string, toTTC: boolean): string => {
    if (priceString === "Sur devis") return priceString;

    // Extract the numeric price
    const match = priceString.match(/(\d+(?:\.\d+)?)€/);
    if (!match) return priceString;

    const price = parseFloat(match[1]);

    // Determine VAT rate based on whether it's hourly or daily
    const isHourly = priceString.includes("/h");
    const vatRate = isHourly ? 1.1 : 1.2; // 10% for hourly, 20% for daily

    const convertedPrice = toTTC ? price : (price / vatRate).toFixed(2);

    // Replace the price in the original string
    return priceString.replace(/\d+(?:\.\d+)?€/, `${convertedPrice}€`);
  };

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await fetch("/api/space-configurations");
        const data = await response.json();

        if (data.success) {
          const displaySpaces = data.data.map((config: SpaceConfig) => {
            const displayData = spaceDisplayData[config.spaceType] || {};
            const urlSlug = spaceTypeToSlug[config.spaceType] || config.slug;

            // Determine price display
            let hourlyPrice = "Sur devis";
            let dailyPrice = "Sur devis";
            let capacityText = "";

            if (!config.requiresQuote) {
              // Hourly price (store TTC values)
              if (config.pricing.hourly > 0) {
                hourlyPrice = `${config.pricing.hourly}€/h`;
              }

              // Daily price (store TTC values)
              if (config.pricing.daily > 0) {
                dailyPrice = `${config.pricing.daily}€/jour`;
              }
            }

            // Format capacity for bottom display
            if (config.minCapacity === config.maxCapacity) {
              capacityText = `${config.minCapacity} personne${
                config.minCapacity > 1 ? "s" : ""
              }`;
            } else if (config.maxCapacity > 50) {
              capacityText = `Jusqu'à ${config.maxCapacity} personnes`;
            } else {
              capacityText = `${config.minCapacity}-${config.maxCapacity} personnes`;
            }

            return {
              id: urlSlug,
              title: displayData.title || config.name,
              subtitle: displayData.subtitle || "",
              description: config.description || displayData.description || "",
              icon: displayData.icon || "bi-building",
              image: config.imageUrl || `/images/spaces/${config.slug}.jpg`,
              capacity: capacityText,
              features: config.features || [],
              priceFrom: hourlyPrice, // Kept for compatibility, but we'll use new fields
              hourlyPrice,
              dailyPrice,
              requiresQuote: config.requiresQuote,
            };
          });

          setSpaces(displaySpaces);
        }
      } catch (error) {
    } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, []);

  if (loading) {
    return (
      <>
        <PageTitle title="Réserver un espace" />
        <section className="booking-selection py-5">
          <div className="container">
            <div className="text-center">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
  return (
    <>
      <PageTitle title="Réserver un espace" />

      <section className="booking-selection py__90">
        <div className="container">
          {/* Progress Bar */}
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8">
              <BookingProgressBar currentStep={1} />

              {/* Page Title */}
              <div className="text-center mb-4 mt-4">
                <h2 className="mb-2" style={{ fontSize: "1.35rem" }}>
                  Quel espace souhaitez-vous réserver ?
                </h2>
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                  Sélectionnez le type d'espace qui correspond à vos besoins
                </p>

                {/* TTC/HT Switch */}
                <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                  <span
                    className={`tax-toggle ${showTTC ? "active" : ""}`}
                    onClick={() => setShowTTC(true)}
                    style={{ cursor: "pointer" }}
                  >
                    Prix TTC
                  </span>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="taxSwitch"
                      checked={!showTTC}
                      onChange={() => setShowTTC(!showTTC)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  <span
                    className={`tax-toggle ${!showTTC ? "active" : ""}`}
                    onClick={() => setShowTTC(false)}
                    style={{ cursor: "pointer" }}
                  >
                    Prix HT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Space Type Cards */}
          <div className="row g-4 justify-content-center">
            {spaces.map((space) => (
              <div key={space.id} className="col-lg-3 col-md-6 px-10">
                <Link
                  href={
                    space.requiresQuote
                      ? "/contact"
                      : `/booking/${space.id}/new`
                  }
                  className="text-decoration-none"
                >
                  <div className="space-card h-100">
                    <div className="card-image-container">
                      {space.image ? (
                        <img
                          src={space.image}
                          alt={space.title}
                          className="space-image"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "d-none"
                            );
                          }}
                        />
                      ) : null}
                      <div
                        className={`space-icon-placeholder ${
                          space.image ? "d-none" : ""
                        }`}
                      >
                        <i className={space.icon}></i>
                      </div>
                      <div className="card-overlay">
                        <div className="overlay-content">
                          <i className="bi bi-arrow-right-circle"></i>
                          <span>
                            {space.requiresQuote
                              ? "Demander un devis"
                              : "Réserver"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h3 className="card-title">{space.title}</h3>
                        <p className="card-subtitle text-muted">
                          {space.subtitle}
                        </p>
                      </div>
                      <div className="capacity-info mb-3">
                        <i className="bi bi-people me-2 text-success"></i>
                        <span
                          style={{ fontSize: "0.875rem", fontWeight: "500" }}
                        >
                          {space.capacity}
                        </span>
                      </div>

                      <p className="card-description">{space.description}</p>

                      <div className="features-list mb-3">
                        {space.features.map((feature, index) => (
                          <span key={index} className="feature-badge">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pricing section at bottom with full width background */}
                    <div
                      className={`d-flex mt-auto ${
                        space.requiresQuote
                          ? "justify-content-center align-items-center"
                          : "justify-content-center align-items-center"
                      }`}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(242, 211, 129, 0.25) 0%, rgba(65, 121, 114, 0.2) 100%)",
                        borderBottomLeftRadius: "10px",
                        borderBottomRightRadius: "10px",
                        padding: "20px",
                        marginLeft: "-20px",
                        marginRight: "-20px",
                        marginBottom: "-20px",
                      }}
                    >
                      {!space.requiresQuote && (
                        <>
                          <div className="d-flex gap-3 align-items-center mb-3">
                            <span className="text-success fw-bold">
                              {convertPrice(space.hourlyPrice, showTTC)}{" "}
                              {showTTC ? "TTC" : "HT"}
                            </span>
                            <span
                              className="rounded-circle bg-black"
                              style={{
                                width: "6px",
                                height: "6px",
                                display: "inline-block",
                              }}
                            ></span>
                            <span className="text-success fw-bold">
                              {convertPrice(space.dailyPrice, showTTC)}{" "}
                              {showTTC ? "TTC" : "HT"}
                            </span>
                          </div>
                        </>
                      )}
                      {space.requiresQuote && (
                        <div className="d-flex gap-3 align-items-center mb-3">
                          <span className="text-success fw-bold">
                            Sur devis
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
