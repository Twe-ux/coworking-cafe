/**
 * BookingDetailsSkeleton - Loading skeleton for booking details page
 * Matches the structure of /booking/details page
 */

export default function BookingDetailsSkeleton() {
  return (
    <div className="booking-card" style={{ padding: "1.25rem" }}>
      {/* Header Skeleton */}
      <div className="mb-4">
        {/* Back button + Progress bar */}
        <div className="skeleton" style={{ width: "100px", height: "40px", marginBottom: "1rem" }} />
        <div className="skeleton" style={{ width: "100%", height: "8px", marginBottom: "1rem" }} />

        {/* Space title */}
        <div className="skeleton" style={{ width: "250px", height: "32px", margin: "0 auto 1.5rem" }} />

        {/* Booking recap (date, time, people) */}
        <div className="d-flex flex-wrap gap-3 justify-content-center mb-3">
          <div className="skeleton" style={{ width: "150px", height: "24px" }} />
          <div className="skeleton" style={{ width: "150px", height: "24px" }} />
          <div className="skeleton" style={{ width: "150px", height: "24px" }} />
        </div>
      </div>

      <div className="mt-4">
        {/* Contact Form Section */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-header">
                <div className="skeleton" style={{ width: "200px", height: "24px" }} />
              </div>
              <div className="card-body">
                {/* Form fields */}
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="mb-3">
                    <div className="skeleton" style={{ width: "120px", height: "20px", marginBottom: "0.5rem" }} />
                    <div className="skeleton" style={{ width: "100%", height: "40px" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Account Options Section */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <div className="skeleton" style={{ width: "180px", height: "24px" }} />
              </div>
              <div className="card-body">
                {/* Checkbox options */}
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="mb-3 d-flex align-items-center gap-2">
                    <div className="skeleton" style={{ width: "20px", height: "20px" }} />
                    <div className="skeleton" style={{ width: "200px", height: "20px" }} />
                  </div>
                ))}
                {/* Password fields */}
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="mb-3">
                    <div className="skeleton" style={{ width: "100px", height: "20px", marginBottom: "0.5rem" }} />
                    <div className="skeleton" style={{ width: "100%", height: "40px" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Services Section */}
        <div className="card mb-4">
          <div className="card-header">
            <div className="skeleton" style={{ width: "220px", height: "24px" }} />
          </div>
          <div className="card-body">
            {/* Category filters */}
            <div className="d-flex gap-2 mb-3 flex-wrap">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ width: "100px", height: "36px" }} />
              ))}
            </div>

            {/* Service items */}
            <div className="row g-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="skeleton" style={{ width: "150px", height: "24px" }} />
                        <div className="skeleton" style={{ width: "60px", height: "28px" }} />
                      </div>
                      <div className="skeleton" style={{ width: "100%", height: "40px", marginBottom: "0.75rem" }} />
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="skeleton" style={{ width: "80px", height: "24px" }} />
                        <div className="skeleton" style={{ width: "100px", height: "32px" }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Special Requests Section */}
        <div className="card mb-4">
          <div className="card-header">
            <div className="skeleton" style={{ width: "180px", height: "24px" }} />
          </div>
          <div className="card-body">
            <div className="skeleton" style={{ width: "100%", height: "120px" }} />
          </div>
        </div>

        {/* Price Summary Section */}
        <div className="card border-success mb-4">
          <div className="card-header bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <div className="skeleton" style={{ width: "150px", height: "24px" }} />
              <div className="skeleton" style={{ width: "100px", height: "32px" }} />
            </div>
          </div>
          <div className="card-body">
            {/* Price lines */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                <div className="skeleton" style={{ width: "180px", height: "20px" }} />
                <div className="skeleton" style={{ width: "80px", height: "20px" }} />
              </div>
            ))}
            <hr />
            {/* Total */}
            <div className="d-flex justify-content-between align-items-center">
              <div className="skeleton" style={{ width: "100px", height: "28px" }} />
              <div className="skeleton" style={{ width: "120px", height: "32px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button Skeleton */}
      <div className="actions-section mt-4">
        <div className="skeleton" style={{ width: "100%", height: "56px" }} />
      </div>
    </div>
  );
}
