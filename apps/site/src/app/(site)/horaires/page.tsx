"use client";

import ProtectedEmail from "@/components/common/ProtectedEmail";
import { useEffect, useState } from "react";
import PageTitle from "../../../components/site/pageTitle";

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
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
];

export default function HorairesPage() {
  const [hoursData, setHoursData] = useState<OpeningHoursData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        // Fetch global hours configuration
        const response = await fetch("/api/global-hours");
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
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ) || [];

  if (loading) {
    return (
      <>
        <PageTitle title="Horaires d'ouverture" />
        <section className="py-5">
          <div className="container">
            <div className="text-center">
              <div
                className="spinner-border"
                role="status"
                style={{ color: "#1f4038", borderRightColor: "transparent" }}
              >
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
      {/* <PageTitle title="Horaires d'ouverture" /> */}

      <section
        className="horaires-section py-5 pb-7"
        style={{ backgroundColor: "#1f4038" }}
      >
        <div className="container" style={{ backgroundColor: "#1f4038" }}>
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Introduction */}
              <div className="text-center mb-5">
                <h2 className="mb-3 text-white fw-bold">
                  Nos horaires d'ouverture
                </h2>
                <p className="text-white-50 fs-5">
                  Le CoworKing Café by Anticafé vous accueille toute la semaine
                  pour travailler dans un cadre convivial
                </p>
              </div>

              {/* Upcoming Closures Alert */}
              {upcomingClosures.length > 0 && (
                <div
                  className="alert mb-5"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <div className="d-flex align-items-start">
                    <i
                      className="bi bi-exclamation-triangle-fill me-3 fs-4"
                      style={{ color: "#ffc107" }}
                    ></i>
                    <div>
                      <h5 className="alert-heading mb-3 text-white fw-bold">
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
                                  },
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
              <div
                className="card shadow-sm border-0"
                style={{ backgroundColor: "#d4e8e4" }}
              >
                <div className="card-body p-4 p-md-5">
                  <h4
                    className="card-title mb-4 fw-bold text-center"
                    style={{ color: "#1f4038" }}
                  >
                    <i
                      className="bi bi-clock-history me-2"
                      style={{ color: "#1f4038" }}
                    ></i>
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
                            <div
                              className="row align-items-center py-3 border-bottom"
                              style={{
                                borderColor:
                                  "rgba(20, 34, 32, 0.15) !important",
                              }}
                            >
                              <div className="col-md-4">
                                <div className="d-flex align-items-center">
                                  <i
                                    className={`${
                                      dayHours?.isOpen
                                        ? "bi-calendar-check"
                                        : "bi-calendar2-x"
                                    } me-3 fs-5`}
                                    style={{
                                      color: dayHours?.isOpen ? "#1f4038" : "#dc3545",
                                    }}
                                  ></i>
                                  <strong style={{ color: "#1f4038" }}>
                                    {day.label}
                                  </strong>
                                </div>
                              </div>
                              <div className="col-md-8 text-md-end mt-2 mt-md-0">
                                {dayHours?.isOpen ? (
                                  <span
                                    className="badge px-4 py-2 fs-6 fw-semibold"
                                    style={{
                                      backgroundColor: "#1f4038",
                                      color: "white",
                                    }}
                                  >
                                    <i className="bi bi-clock me-2"></i>
                                    {formatTime(dayHours.openTime)} -{" "}
                                    {formatTime(dayHours.closeTime)}
                                  </span>
                                ) : (
                                  <span
                                    className="badge px-4 py-2 fs-6 fw-semibold"
                                    style={{
                                      backgroundColor: "#dc3545",
                                      color: "white",
                                    }}
                                  >
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
              <div className="text-center mt-5 mb-5">
                <div
                  className="card border-0"
                  style={{ backgroundColor: "#d4e8e4" }}
                >
                  <div className="card-body p-4 p-md-5">
                    <h5 className="mb-4 fw-bold" style={{ color: "#1f4038" }}>
                      <i
                        className="bi bi-info-circle me-2"
                        style={{ color: "#1f4038" }}
                      ></i>
                      Informations utiles
                    </h5>
                    <p className="mb-3">
                      <i
                        className="bi bi-telephone me-2"
                        style={{ color: "#1f4038" }}
                      ></i>
                      <a
                        href="tel:+33987334519"
                        className="text-decoration-none fw-semibold"
                        style={{ color: "#1f4038" }}
                      >
                        09 87 33 45 19
                      </a>
                    </p>
                    <p className="mb-3">
                      <i
                        className="bi bi-envelope me-2"
                        style={{ color: "#1f4038" }}
                      ></i>

                      <ProtectedEmail
                        user="strasbourg"
                        domain="coworkingcafe.fr"
                        className="fw-semibold"
                        style={{ color: "#1f4038" }}
                      />
                    </p>
                    <p className="mb-0" style={{ color: "#5a7570" }}>
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
          background-color: #ffffff;
          min-height: 70vh;
          padding-bottom: 200px !important; /* Espace pour le footer Helper */
        }

        .hours-item:last-child .border-bottom {
          border-bottom: none !important;
        }

        .badge {
          font-size: 0.95rem;
          font-weight: 500;
          border-radius: 8px;
        }

        .alert-warning {
          border-left: 4px solid #1f4038;
          background-color: #fff9e6;
          border-radius: 8px;
        }

        .card {
          border: none;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(20, 34, 32, 0.08);
        }

        .text-dark-green {
          color: #1f4038;
        }

        @media (max-width: 768px) {
          .horaires-section {
            padding-bottom: 250px !important;
          }
        }
      `}</style>
    </>
  );
}
