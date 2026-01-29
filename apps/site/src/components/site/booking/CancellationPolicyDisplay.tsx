// ============================================================================
// CancellationPolicyDisplay Component
// ============================================================================
// Display cancellation policy for booking summary page
// Extracted from page.tsx to reduce file size
// Created: 2026-01-29
// ============================================================================

"use client";

interface CancellationTier {
  daysBeforeBooking: number;
  chargePercentage: number;
}

interface CancellationPolicy {
  spaceType: string;
  tiers: CancellationTier[];
}

interface CancellationPolicyDisplayProps {
  cancellationPolicy: CancellationPolicy;
}

export default function CancellationPolicyDisplay({
  cancellationPolicy,
}: CancellationPolicyDisplayProps) {
  if (!cancellationPolicy || !cancellationPolicy.tiers) {
    return null;
  }

  const renderTiers = () => {
    const sortedTiers = [...cancellationPolicy.tiers].sort(
      (a: CancellationTier, b: CancellationTier) =>
        b.daysBeforeBooking - a.daysBeforeBooking,
    );

    return sortedTiers.map((tier: CancellationTier, index: number) => {
      let label = "";
      if (index === sortedTiers.length - 1) {
        if (sortedTiers.length > 1) {
          const previousTier = sortedTiers[index - 1];
          label = `Entre 0 et ${previousTier.daysBeforeBooking} jours avant`;
        } else {
          label = `Moins de ${tier.daysBeforeBooking} jour avant`;
        }
      } else if (index === 0) {
        label = `Plus de ${tier.daysBeforeBooking} jours avant`;
      } else {
        const previousTier = sortedTiers[index - 1];
        label = `Entre ${tier.daysBeforeBooking} et ${previousTier.daysBeforeBooking} jours avant`;
      }

      return (
        <li
          key={index}
          style={{
            marginBottom: "0.65rem",
            color: "#78350f",
          }}
        >
          <strong style={{ color: "#92400E" }}>{label}</strong> :{" "}
          {tier.chargePercentage === 0
            ? "Aucun frais"
            : `${tier.chargePercentage}% de frais`}
        </li>
      );
    });
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
        border: "2px solid #F59E0B",
        borderRadius: "12px",
        padding: "1.75rem",
        marginBottom: "1.5rem",
        boxShadow: "0 2px 8px rgba(245, 158, 11, 0.1)",
      }}
    >
      <h6
        style={{
          color: "#92400E",
          fontWeight: "700",
          marginBottom: "1.25rem",
          fontSize: "1.05rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <i
          className="bi bi-info-circle-fill"
          style={{ fontSize: "1.2rem" }}
        ></i>
        Conditions d'annulation
      </h6>
      <div
        style={{
          color: "#78350f",
          fontSize: "0.9rem",
          lineHeight: "1.8",
        }}
      >
        <p
          style={{
            marginBottom: "1rem",
            color: "#92400E",
            fontWeight: "500",
          }}
        >
          {cancellationPolicy.spaceType === "open_space"
            ? "En cas d'annulation, des frais peuvent s'appliquer selon les délais :"
            : "Pour les salles de réunion, des frais d'annulation peuvent s'appliquer :"}
        </p>
        <ul
          style={{
            marginBottom: "1rem",
            paddingLeft: "1.75rem",
            listStyleType: "disc",
          }}
        >
          {renderTiers()}
        </ul>
        <div
          style={{
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid #F59E0B",
            fontSize: "0.875rem",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0", color: "#92400E" }}>
            Pour plus de détails, consultez nos{" "}
            <a
              href="/CGU#article6"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#F59E0B",
                textDecoration: "underline",
                fontWeight: "600",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "#D97706")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#F59E0B")
              }
            >
              Conditions Générales de Vente (Article 6)
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
