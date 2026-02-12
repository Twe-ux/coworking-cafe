"use client";

import { useEffect, useState } from "react";

interface CancellationTier {
  daysBeforeBooking: number;
  chargePercentage: number;
}

interface CancellationPolicy {
  tiers: CancellationTier[];
  spaceType: string;
}

interface FormattedTier {
  label: string;
  percentage: number;
}

function formatPolicyTiers(tiers: CancellationTier[]): FormattedTier[] {
  const sortedTiers = [...tiers].sort(
    (a, b) => b.daysBeforeBooking - a.daysBeforeBooking,
  );

  return sortedTiers.map((tier, index) => {
    if (index === sortedTiers.length - 1) {
      if (sortedTiers.length > 1) {
        const previousTier = sortedTiers[index - 1];
        return {
          label: `Entre 0 et ${previousTier.daysBeforeBooking} jours avant`,
          percentage: tier.chargePercentage,
        };
      }
      return {
        label: `Moins de ${tier.daysBeforeBooking} jour avant`,
        percentage: tier.chargePercentage,
      };
    } else if (index === 0) {
      return {
        label: `Plus de ${tier.daysBeforeBooking} jours avant`,
        percentage: tier.chargePercentage,
      };
    } else {
      const previousTier = sortedTiers[index - 1];
      return {
        label: `Entre ${tier.daysBeforeBooking} et ${previousTier.daysBeforeBooking} jours avant`,
        percentage: tier.chargePercentage,
      };
    }
  });
}

function PolicyTiersList({ policy }: { policy: CancellationPolicy | null }) {
  if (!policy?.tiers) {
    return (
      <p className="mb-0" style={{ color: "#f57c00" }}>
        Chargement des conditions...
      </p>
    );
  }

  return (
    <ul className="mb-0 text-dark">
      {formatPolicyTiers(policy.tiers).map((tier, index) => (
        <li key={index} className="mb-1">
          <strong>{tier.label} :</strong>{" "}
          {tier.percentage === 0
            ? "Aucun frais"
            : `${tier.percentage}% de frais`}
        </li>
      ))}
    </ul>
  );
}

export default function CancellationPolicySection() {
  const [openSpacePolicy, setOpenSpacePolicy] =
    useState<CancellationPolicy | null>(null);
  const [meetingRoomPolicy, setMeetingRoomPolicy] =
    useState<CancellationPolicy | null>(null);

  useEffect(() => {
    const fetchOpenSpacePolicy = async () => {
      try {
        const response = await fetch(
          "/api/cancellation-policy?spaceType=open-space",
        );
        if (response.ok) {
          const data = await response.json();
          setOpenSpacePolicy(data.data.cancellationPolicy);
        }
      } catch {
        // Silently fail - loading state shown
      }
    };

    const fetchMeetingRoomPolicy = async () => {
      try {
        const response = await fetch(
          "/api/cancellation-policy?spaceType=salle-verriere",
        );
        if (response.ok) {
          const data = await response.json();
          setMeetingRoomPolicy(data.data.cancellationPolicy);
        }
      } catch {
        // Silently fail - loading state shown
      }
    };

    fetchOpenSpacePolicy();
    fetchMeetingRoomPolicy();
  }, []);

  return (
    <div
      className="border rounded-3 p-4 mb-4"
      style={{
        backgroundColor: "#fff3e0",
        borderColor: "#ffb74d !important",
      }}
    >
      <h3
        className="h5 fw-semibold mb-3"
        style={{ color: "#e65100" }}
      >
        Politique d&apos;annulation
      </h3>

      <p
        className="text-dark"
        style={{ lineHeight: "1.8", marginBottom: "1rem" }}
      >
        Les délais d&apos;annulation sont exprimés en{" "}
        <strong>jours calendaires</strong> (tous les jours du
        calendrier, y compris les week-ends et jours fériés), et
        sont calculés à compter de la date de réception écrite de
        l&apos;annulation. (tous les jours du calendrier, y compris
        les week-ends et jours fériés), et sont calculés à compter
        de la date de réception écrite de l&apos;annulation.
      </p>

      <h4
        className="h6 fw-semibold mb-2"
        style={{ color: "#e65100" }}
      >
        Espaces de travail partagés (Open-space) :
      </h4>
      <div className="mb-3">
        <PolicyTiersList policy={openSpacePolicy} />
      </div>

      <h4
        className="h6 fw-semibold mb-2"
        style={{ color: "#e65100" }}
      >
        Salles de réunion et espaces privatifs :
      </h4>
      <PolicyTiersList policy={meetingRoomPolicy} />

      <p
        className="text-dark"
        style={{ lineHeight: "1.8", marginTop: "1rem" }}
      >
        Ces frais correspondent à une{" "}
        <strong>indemnité d&apos;annulation</strong>, tenant compte
        de l&apos;immobilisation des espaces, de la perte de chiffre
        d&apos;affaires et des frais engagés.
      </p>
    </div>
  );
}
