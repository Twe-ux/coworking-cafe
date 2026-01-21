"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ExceptionalClosure {
  date: string;
  reason?: string;
  startTime?: string;
  endTime?: string;
  isFullDay?: boolean;
}

export default function ExceptionalClosureBanner() {
  const [upcomingClosures, setUpcomingClosures] = useState<ExceptionalClosure[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClosures = async () => {
      try {
        // Fetch from open-space config as reference
        const response = await fetch("/api/space-configurations/open-space");
        const data = await response.json();

        if (data.success && data.data.exceptionalClosures) {
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          // Filter upcoming closures (today and future)
          const upcoming = data.data.exceptionalClosures
            .filter((closure: ExceptionalClosure) => {
              const closureDate = new Date(closure.date);
              closureDate.setHours(0, 0, 0, 0);
              return closureDate >= now;
            })
            .sort((a: ExceptionalClosure, b: ExceptionalClosure) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .slice(0, 3); // Show max 3 upcoming closures

          setUpcomingClosures(upcoming);
        }
      } catch (error) {
    } finally {
        setLoading(false);
      }
    };

    fetchClosures();

    // Check if banner was dismissed today
    const dismissedDate = localStorage.getItem("closureBannerDismissed");
    if (dismissedDate === new Date().toDateString()) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("closureBannerDismissed", new Date().toDateString());
  };

  if (loading || isDismissed || upcomingClosures.length === 0) {
    return null;
  }

  const nextClosure = upcomingClosures[0];
  const closureDate = new Date(nextClosure.date);
  const formattedDate = closureDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Format time range if partial closure
  const getClosureTimeText = () => {
    if (nextClosure.isFullDay !== false && !nextClosure.startTime && !nextClosure.endTime) {
      return "toute la journée";
    }
    if (nextClosure.startTime && nextClosure.endTime) {
      return `de ${nextClosure.startTime} à ${nextClosure.endTime}`;
    }
    return "toute la journée";
  };

  return (
    <div className="exceptional-closure-banner">
      <div className="container">
        <div className="banner-content">
          <div className="banner-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="banner-text">
            <strong>Fermeture exceptionnelle :</strong>{" "}
            <span className="closure-date">{formattedDate}</span>
            {" "}<span className="closure-time">({getClosureTimeText()})</span>
            {nextClosure.reason && <span className="closure-reason"> - {nextClosure.reason}</span>}
            {upcomingClosures.length > 1 && (
              <span className="more-closures">
                {" "}+{upcomingClosures.length - 1} autre{upcomingClosures.length > 2 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="banner-actions">
            <Link href="/horaires" className="banner-link">
              Voir les horaires
            </Link>
            <button onClick={handleDismiss} className="banner-close" aria-label="Fermer">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .exceptional-closure-banner {
          background: linear-gradient(135deg, #ff9a00 0%, #ff6a00 100%);
          color: white;
          padding: 0.75rem 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          position: relative;
          z-index: 1000;
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .banner-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .banner-text {
          flex: 1;
          min-width: 200px;
          font-size: 0.95rem;
        }

        .closure-date {
          text-transform: capitalize;
        }

        .closure-reason {
          opacity: 0.95;
        }

        .more-closures {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          font-size: 0.85rem;
          margin-left: 0.5rem;
        }

        .banner-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .banner-link {
          background: white;
          color: #ff6a00;
          padding: 0.4rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .banner-link:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .banner-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .banner-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .exceptional-closure-banner {
            padding: 1rem 0;
          }

          .banner-content {
            justify-content: center;
            text-align: center;
          }

          .banner-text {
            flex-basis: 100%;
            order: 1;
          }

          .banner-icon {
            order: 0;
          }

          .banner-actions {
            order: 2;
            flex-basis: 100%;
            justify-content: center;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
