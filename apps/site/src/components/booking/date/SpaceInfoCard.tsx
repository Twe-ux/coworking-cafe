// ============================================================================
// SpaceInfoCard Component
// ============================================================================
// Displays selected space information (title, capacity, etc.)
// ============================================================================

import type { SpaceConfig } from "@/types/booking";

export interface SpaceInfoCardProps {
  /** Space configuration data */
  spaceConfig: SpaceConfig;
  /** Space display title */
  spaceTitle: string;
  /** Space subtitle/description */
  spaceSubtitle: string;
  /** Optional custom class name */
  className?: string;
}

/**
 * Card displaying selected space information
 */
export function SpaceInfoCard({
  spaceConfig,
  spaceTitle,
  spaceSubtitle,
  className = "",
}: SpaceInfoCardProps) {
  return (
    <div className={`card mb-3 ${className}`}>
      <div className="card-body">
        <h5 className="card-title">{spaceTitle}</h5>
        <p className="card-text text-muted">{spaceSubtitle}</p>

        <div className="row g-2 mt-2">
          {/* Capacity */}
          <div className="col-auto">
            <span className="badge bg-light text-dark">
              <i className="bi bi-people me-1" />
              {spaceConfig.minCapacity === spaceConfig.maxCapacity
                ? `${spaceConfig.maxCapacity} personnes`
                : `${spaceConfig.minCapacity}-${spaceConfig.maxCapacity} personnes`}
            </span>
          </div>

          {/* Per Person pricing indicator */}
          {spaceConfig.pricing.perPerson && (
            <div className="col-auto">
              <span className="badge bg-primary">
                <i className="bi bi-person-check me-1" />
                Prix par personne
              </span>
            </div>
          )}

          {/* Daily rate available indicator */}
          {spaceConfig.pricing.isDailyRateAvailable && (
            <div className="col-auto">
              <span className="badge bg-info">
                <i className="bi bi-calendar-check me-1" />
                Tarif journée disponible
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
