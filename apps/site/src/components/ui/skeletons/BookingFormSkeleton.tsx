/**
 * BookingFormSkeleton - Loading skeleton for booking form
 * Matches the structure of BookingDateContent
 */

export default function BookingFormSkeleton() {
  return (
    <div className="booking-card" style={{ padding: "1.25rem" }}>
      {/* Header Skeleton */}
      <div className="mb-4">
        {/* Back button */}
        <div className="skeleton" style={{ width: "100px", height: "40px", marginBottom: "1rem" }} />

        {/* Progress bar */}
        <div className="skeleton" style={{ width: "100%", height: "8px", marginBottom: "1rem" }} />

        {/* Space title */}
        <div className="skeleton" style={{ width: "200px", height: "32px", margin: "0 auto" }} />
      </div>

      {/* Reservation Type Selector Skeleton */}
      <div className="mb-4">
        <div className="skeleton" style={{ width: "150px", height: "24px", marginBottom: "0.75rem" }} />
        <div className="d-flex gap-2 flex-wrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ width: "100px", height: "40px" }} />
          ))}
        </div>
      </div>

      {/* Date Section Skeleton */}
      <div className="mb-3">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="skeleton" style={{ width: "120px", height: "24px" }} />
              <div className="skeleton" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
            </div>
          </div>
          <div className="card-body">
            {/* Calendar placeholder */}
            <div className="skeleton" style={{ width: "100%", height: "300px" }} />
          </div>
        </div>
      </div>

      {/* Time Section Skeleton */}
      <div className="mb-3">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="skeleton" style={{ width: "140px", height: "24px" }} />
              <div className="skeleton" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* People Counter & Price Display Row */}
      <div className="row g-3 mb-4 align-items-stretch">
        {/* People Counter Skeleton */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="skeleton" style={{ width: "180px", height: "24px", marginBottom: "1rem" }} />
              <div className="d-flex justify-content-center align-items-center gap-3">
                <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                <div className="skeleton" style={{ width: "60px", height: "48px" }} />
                <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Price Display Skeleton */}
        <div className="col-md-6">
          <div className="card h-100 border-success">
            <div className="card-body">
              <div className="skeleton" style={{ width: "100px", height: "20px", marginBottom: "0.5rem" }} />
              <div className="skeleton" style={{ width: "120px", height: "36px", marginBottom: "1rem" }} />
              <div className="skeleton" style={{ width: "80px", height: "16px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button Skeleton */}
      <div className="d-flex justify-content-end">
        <div className="skeleton" style={{ width: "160px", height: "48px" }} />
      </div>
    </div>
  );
}
