"use client";

import PageTitle from "@/components/site/pageTitle";
import { useEffect, useState } from "react";

interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

interface WeeklyHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

interface ExceptionalClosure {
  date: string;
  reason?: string;
  startTime?: string;
  endTime?: string;
  isFullDay?: boolean;
}

interface OpeningHoursData {
  defaultHours: WeeklyHours;
  exceptionalClosures: ExceptionalClosure[];
}

const daysOfWeek = [
  { key: "monday", label: "Lundi", icon: "bi-calendar-check" },
  { key: "tuesday", label: "Mardi", icon: "bi-calendar-check" },
  { key: "wednesday", label: "Mercredi", icon: "bi-calendar-check" },
  { key: "thursday", label: "Jeudi", icon: "bi-calendar-check" },
  { key: "friday", label: "Vendredi", icon: "bi-calendar-check" },
  { key: "saturday", label: "Samedi", icon: "bi-calendar-event" },
  { key: "sunday", label: "Dimanche", icon: "bi-calendar-event" },
];

export default function HorairesPage() {
  const [hoursData, setHoursData] = useState<OpeningHoursData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        // Fetch global hours configuration
        const response = await fetch("/api/admin/global-hours");
        const data = await response.json();

        if (data.success && data.data) {
          setHoursData({
            defaultHours: data.data.defaultHours,
            exceptionalClosures: data.data.exceptionalClosures || [],
          });
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchHours();
  }, []);

  const formatTime = (time?: string) => {
    if (!time) return "";
    return time;
  };

  const isUpcoming = (dateStr: string) => {
    const closureDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return closureDate >= today;
  };

  const upcomingClosures =
    hoursData?.exceptionalClosures
      .filter((closure) => isUpcoming(closure.date))
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ) || [];

  if (loading) {
    return (
      <>
        <PageTitle title="Horaires d'ouverture" />
        <section className="py-5">
          <div className="container">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
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
      <PageTitle title="Horaires d'ouverture" />

      <section className="horaires-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Introduction */}
              <div className="text-center mb-5">
                <h2 className="mb-3">Nos horaires d'ouverture</h2>
                <p className="text-muted">
                  Le CoworKing Café by Anticafé vous accueille toute la semaine
                  pour travailler dans un cadre convivial
                </p>
              </div>

              {/* Upcoming Closures Alert */}
              {upcomingClosures.length > 0 && (
                <div className="alert alert-warning mb-5">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                    <div>
                      <h5 className="alert-heading mb-2">
                        Fermetures exceptionnelles à venir
                      </h5>
                      <ul className="mb-0">
                        {upcomingClosures.map((closure, index) => {
                          const isPartialClosure =
                            closure.isFullDay === false &&
                            closure.startTime &&
                            closure.endTime;
                          return (
                            <li key={index}>
                              <strong>
                                {new Date(closure.date).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  }
                                )}
                              </strong>
                              {isPartialClosure && (
                                <span className="text-muted">
                                  {" "}
                                  (de {closure.startTime} à {closure.endTime})
                                </span>
                              )}
                              {closure.reason && ` - ${closure.reason}`}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Weekly Hours */}
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <h4 className="card-title mb-4">
                    <i className="bi bi-clock-history me-2 text-primary"></i>
                    Horaires hebdomadaires
                  </h4>

                  <div className="hours-list">
                    {hoursData &&
                      hoursData.defaultHours &&
                      daysOfWeek.map((day) => {
                        const dayKey = day.key as keyof WeeklyHours;
                        const dayHours = hoursData.defaultHours[dayKey];

                        return (
                          <div key={day.key} className="hours-item">
                            <div className="row align-items-center py-3 border-bottom">
                              <div className="col-md-4">
                                <div className="d-flex align-items-center">
                                  <i
                                    className={`${day.icon} me-3 fs-5 text-primary`}
                                  ></i>
                                  <strong>{day.label}</strong>
                                </div>
                              </div>
                              <div className="col-md-8 text-md-end mt-2 mt-md-0">
                                {dayHours?.isOpen ? (
                                  <span className="badge bg-success-subtle text-success px-3 py-2">
                                    <i className="bi bi-clock me-2"></i>
                                    {formatTime(dayHours.openTime)} -{" "}
                                    {formatTime(dayHours.closeTime)}
                                  </span>
                                ) : (
                                  <span className="badge bg-danger-subtle text-danger px-3 py-2">
                                    <i className="bi bi-x-circle me-2"></i>
                                    Fermé
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="text-center mt-5">
                <div className="card bg-light border-0">
                  <div className="card-body p-4">
                    <h5 className="mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      Informations utiles
                    </h5>
                    <p className="mb-2">
                      <i className="bi bi-telephone me-2 text-primary"></i>
                      <a
                        href="tel:+33987334519"
                        className="text-decoration-none"
                      >
                        09 87 33 45 19
                      </a>
                    </p>
                    <p className="mb-2">
                      <i className="bi bi-envelope me-2 text-primary"></i>
                      <a
                        href="mailto:strasbourg@coworkingcafe.fr"
                        className="text-decoration-none"
                      >
                        strasbourg@coworkingcafe.fr
                      </a>
                    </p>
                    <p className="mb-0 text-muted small">
                      Les horaires peuvent être modifiés pendant les jours
                      fériés et événements spéciaux.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .horaires-section {
          background-color: #f8f9fa;
          min-height: 60vh;
        }

        .hours-item:last-child .border-bottom {
          border-bottom: none !important;
        }

        .badge {
          font-size: 0.95rem;
          font-weight: 500;
        }

        .alert-warning {
          border-left: 4px solid #ffc107;
        }

        .card {
          border: none;
          border-radius: 12px;
        }
      `}</style>
    </>
  );
}
