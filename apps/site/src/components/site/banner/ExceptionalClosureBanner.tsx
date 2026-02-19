"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useExceptionalClosures } from "@/hooks/useExceptionalClosures";

export default function ExceptionalClosureBanner() {
  const { upcomingClosures, loading } = useExceptionalClosures();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed today
    const dismissedDate = localStorage.getItem("closureBannerDismissed");
    const isDismissedToday = dismissedDate === new Date().toDateString();
    if (isDismissedToday) {
      setIsDismissed(true);
    }
  }, []);

  // Add margin-top to header__bottom when banner is visible
  useEffect(() => {
    const shouldShow = !loading && !isDismissed && upcomingClosures.length > 0;
    const headerBottom = document.querySelector('.header__bottom') as HTMLElement;

    if (headerBottom) {
      if (shouldShow) {
        // Add margin equal to banner height (~70px with padding 1rem + content)
        headerBottom.style.marginTop = '70px';
      } else {
        headerBottom.style.marginTop = '0';
      }
    }

    // Cleanup on unmount
    return () => {
      if (headerBottom) {
        headerBottom.style.marginTop = '0';
      }
    };
  }, [loading, isDismissed, upcomingClosures]);

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
    // Priority: check isFullDay flag first (even if times are present)
    if (nextClosure.isFullDay === true || nextClosure.isFullDay === undefined) {
      return "toute la journée";
    }
    // Only show time range if explicitly marked as partial closure
    if (nextClosure.isFullDay === false && nextClosure.startTime && nextClosure.endTime) {
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
            <strong>Horaires exceptionnels :</strong>{" "}
            <span className="closure-date">{formattedDate}</span>{" "}
            <span className="closure-time">({getClosureTimeText()})</span>
            {nextClosure.reason && (
              <span className="closure-reason"> - {nextClosure.reason}</span>
            )}
            {upcomingClosures.length > 1 && (
              <span className="more-closures">
                {" "}
                +{upcomingClosures.length - 1} autre
                {upcomingClosures.length > 2 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="banner-actions">
            <Link href="/horaires" className="banner-link">
              Voir les horaires
            </Link>
            <button
              onClick={handleDismiss}
              className="banner-close"
              aria-label="Fermer"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .exceptional-closure-banner {
          background: linear-gradient(135deg, #c13080 0%, #661940 100%);
          color: white;
          padding: 1rem 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1100;
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
