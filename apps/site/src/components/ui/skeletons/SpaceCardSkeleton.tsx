/**
 * SpaceCardSkeleton Component
 * Skeleton loader for booking space cards with shimmer effect
 * Matches SpaceCard structure for seamless loading experience
 */

import "./skeleton.module.scss";

export default function SpaceCardSkeleton() {
  return (
    <div className="col-lg-3 col-md-6 px-10">
      <div className="space-card h-100">
        {/* Image Skeleton */}
        <div
          className="skeleton"
          style={{
            width: "100%",
            height: "200px",
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
          }}
        />

        {/* Card Content */}
        <div className="card-content">
          {/* Title & Subtitle */}
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="skeleton" style={{ width: "60%", height: "24px" }} />
            <div className="skeleton" style={{ width: "30%", height: "18px" }} />
          </div>

          {/* Capacity Info */}
          <div className="capacity-info mb-3">
            <div className="skeleton" style={{ width: "120px", height: "18px" }} />
          </div>

          {/* Description */}
          <div className="mb-3">
            <div className="skeleton mb-2" style={{ width: "100%", height: "16px" }} />
            <div className="skeleton mb-2" style={{ width: "95%", height: "16px" }} />
            <div className="skeleton" style={{ width: "80%", height: "16px" }} />
          </div>

          {/* Features */}
          <div className="features-list mb-3 d-flex gap-2">
            <div className="skeleton" style={{ width: "80px", height: "28px", borderRadius: "15px" }} />
            <div className="skeleton" style={{ width: "90px", height: "28px", borderRadius: "15px" }} />
            <div className="skeleton" style={{ width: "70px", height: "28px", borderRadius: "15px" }} />
          </div>
        </div>

        {/* Pricing Skeleton */}
        <div
          className="d-flex mt-auto justify-content-center align-items-center"
          style={{
            background: "linear-gradient(135deg, rgba(242, 211, 129, 0.25) 0%, rgba(65, 121, 114, 0.2) 100%)",
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px",
            padding: "20px",
            marginLeft: "-20px",
            marginRight: "-20px",
            marginBottom: "-20px",
          }}
        >
          <div className="d-flex gap-3 align-items-center mb-3">
            <div className="skeleton" style={{ width: "80px", height: "20px" }} />
            <div className="skeleton" style={{ width: "80px", height: "20px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
